import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";

import { serataPerData } from "@/lib/calendario-serate";
import { BISCOTTO_PROVENIENZA, canaleDaBiscotto, nomeProvenienza, prAttivoPerCodice } from "@/contenuti/canali";
import { eDataIso, oggiARoma } from "@/lib/lista-attesa";
import { creaRichiesta, type NuovaRichiesta } from "@/lib/pannello/dati";
import { chiaveIndirizzo, segnaFallito, statoBlocco } from "@/lib/pannello/blocco-tentativi";
import { avvisaTutti } from "@/lib/push";
import { normalizzaTelefono } from "@/lib/telefono";
import { FORMA_SESSIONE, registraEvento } from "@/lib/traffico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve una richiesta di lista, tavolo, braccialetto o navetta.
 *
 * La scrive su Postgres, "in attesa", e avvisa chi ha acceso le notifiche nel
 * pannello: da qui in poi una richiesta vera arriva davvero a Luca.
 *
 * Qui non parte nessun messaggio al cliente: ogni messaggio a chi prenota lo
 * manda Luca a mano, ed è una regola del brief. L'avviso push va solo a lui, e
 * se fallisce la richiesta è comunque salvata.
 *
 * Contro lo spam: un campo trappola ("sito") che un utente non vede e un bot
 * riempie, il limite per indirizzo (12 invii ogni 10 minuti, nel database), la
 * validazione di ogni campo e della data. Una richiesta che non passa i
 * controlli non salva niente.
 *
 * Il PR che l'ha portata NON lo dice il browser con un id: lo ricava il server
 * dal codice della pagina /pr/<codice> da cui parte il modulo, e solo se quel PR
 * è attivo. Un codice sbagliato o spento lascia la richiesta senza PR (diretta).
 */

interface Richiesta {
  readonly tipo: string;
  readonly nome: string;
  readonly cognome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly dataSerata: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly persone?: string;
  readonly note?: string;
  readonly zona?: string;
  readonly genere?: string;
  readonly codicePr?: string;
  readonly sessione?: string;
}

const TIPI = ["tavolo", "braccialetto", "lista", "navetta"] as const;
const GENERI = ["Donna", "Uomo", "Misti"] as const;

const INVII_PER_INDIRIZZO = 12;
/** Quanto si aspetta la push prima di rispondere al cliente: una push lenta non deve far aspettare chi prenota. */
const ATTESA_PUSH_MS = 4000;

const NO_STORE = { "Cache-Control": "no-store" } as const;

function testo(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }
  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

function errore(messaggio: string, status = 400): Response {
  return Response.json({ errore: messaggio }, { status, headers: NO_STORE });
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return errore("Richiesta illeggibile");
  }

  const c = (corpo ?? {}) as Partial<Richiesta> & Record<string, unknown>;

  // Il campo trappola: chi lo riempie è un bot. Si risponde come se fosse andata bene, senza salvare niente.
  if (typeof c["sito"] === "string" && c["sito"].trim() !== "") {
    return Response.json({ salvata: true }, { headers: NO_STORE });
  }

  const nome = testo(c.nome, 60);
  const cognome = testo(c.cognome, 60);
  const telefono = testo(c.telefono, 30);
  const serataScelta = testo(c.serata, 80);
  const persone = testo(c.persone, 10);
  const tipo = testo(c.tipo, 20);

  if (tipo === null || !TIPI.includes(tipo as (typeof TIPI)[number])) {
    return errore("Tipo di richiesta sconosciuto");
  }

  // La navetta si chiede con nome, telefono, serata e zona: il cognome no,
  // perché è un modulo corto che si compila mentre si sta già uscendo.
  const navetta = tipo === "navetta";
  const braccialetto = tipo === "braccialetto";
  const zona = testo(c.zona, 80);
  const genere = testo(c.genere, 10);

  if (nome === null || telefono === null || serataScelta === null) {
    return errore("Servono nome, telefono e la serata");
  }

  if (!navetta && cognome === null) {
    return errore("Serve anche il cognome");
  }

  if (navetta && zona === null) {
    return errore("Serve la zona da cui parti");
  }

  if (braccialetto && (genere === null || !GENERI.includes(genere as (typeof GENERI)[number]))) {
    return errore("Dicci se il braccialetto è per una donna o un uomo");
  }

  if (normalizzaTelefono(telefono) === null) {
    return errore("Il numero di telefono non sembra giusto");
  }

  /*
   * La data. Solo la navetta può non mandarla (sceglie solo il giorno della
   * settimana). Per tutte le altre è obbligatoria, deve essere una data vera
   * (AAAA-MM-GG), non passata, e cadere in una serata del calendario: la notte
   * e il nome da biglietto si ricavano da lei, non da quello che manda il
   * browser. Un valore che non è una data non diventa "nessuna data": si rifiuta.
   */
  let dataSerata: string | null = null;
  const grezza = c.dataSerata;

  if (grezza !== undefined && grezza !== null && grezza !== "") {
    if (!eDataIso(grezza)) {
      return errore("La data della serata non è valida");
    }
    if (grezza < oggiARoma()) {
      return errore("Questa serata è già passata");
    }
    dataSerata = grezza;
  } else if (!navetta) {
    return errore("Scegli la data della serata");
  }

  const derivata = dataSerata === null ? null : serataPerData(dataSerata);

  if (dataSerata !== null && derivata === null) {
    return errore("Questa data non è nel calendario delle serate");
  }

  // Il limite per indirizzo. Senza database non si può né contare né salvare: si dice di riprovare.
  const chiave = `ric:${chiaveIndirizzo(richiesta)}`;
  const limite = await statoBlocco(chiave, INVII_PER_INDIRIZZO, false);

  if (limite.nonDisponibile) {
    return errore("Non riesco a salvare adesso, riprova fra qualche minuto", 503);
  }
  if (limite.bloccato) {
    return errore("Troppe richieste da questo indirizzo, riprova fra un po'", 429);
  }

  await segnaFallito(chiave, false);

  const tavolo = tipo === "tavolo";

  /*
   * Da dove arriva chi prenota. Non lo chiede il modulo: lo sa il sito. Un PR
   * lo dice il codice della pagina /pr/<codice> (controllato qui, attivo o no);
   * un canale (/ig, /tiktok...) lo dice il biscotto che il percorso corto ha
   * lasciato. Chi arriva digitando l'indirizzo risulta "Diretto", che è la verità.
   */
  const biscotto = (await cookies()).get(BISCOTTO_PROVENIENZA)?.value;
  const pr = typeof c.codicePr === "string" ? await prAttivoPerCodice(c.codicePr) : null;
  const provenienza = pr === null ? nomeProvenienza(biscotto) : `Link di ${pr.nome}`;
  const origine = pr === null ? (canaleDaBiscotto(biscotto) ?? "diretto") : "pr";

  const nomeCompleto = cognome === null ? nome : `${nome} ${cognome}`;
  // Il braccialetto non ha una colonna sua per il genere: usa "gruppo", la
  // stessa che il tavolo usa per "chi c'è al tavolo". Sono due cose diverse
  // che non capitano mai insieme, quindi la colonna può restare una sola.
  const gruppo = tavolo ? testo(c.gruppo, 40) : braccialetto ? genere : null;
  const budget = tavolo ? testo(c.budget, 40) : null;
  const occasione = tavolo ? testo(c.occasione, 60) : null;
  const note = tavolo ? testo(c.note, 300) : null;

  const daSalvare: NuovaRichiesta = {
    nome: nomeCompleto,
    telefono,
    serata: serataScelta,
    nomeSerata: derivata?.nomeSerata ?? serataScelta.toUpperCase(),
    codiceSerata: derivata?.notte ?? "altro",
    tipo: tipo as NuovaRichiesta["tipo"],
    provenienza,
    ...(pr === null ? {} : { prId: pr.id }),
    ...(dataSerata === null ? {} : { dataSerata }),
    ...(gruppo === null ? {} : { gruppo }),
    ...(budget === null ? {} : { budget }),
    ...(occasione === null ? {} : { occasione }),
    ...(persone === null ? {} : { persone }),
    ...(note === null ? {} : { messaggio: note }),
    ...(navetta && zona !== null ? { zona } : {}),
  };

  let salvata;

  try {
    salvata = await creaRichiesta(daSalvare);
  } catch (causa) {
    // Nessuna richiesta a metà: o è salvata o non lo è. Il dettaglio resta nei log, non in risposta.
    console.error("Richiesta non salvata:", causa);
    return errore("Non sono riuscito a salvare la richiesta, riprova fra un attimo", 500);
  }

  // L'invio nel traffico: solo ora che la richiesta esiste. Un errore qui non tocca la richiesta.
  const sessione = typeof c.sessione === "string" && FORMA_SESSIONE.test(c.sessione) ? c.sessione : randomUUID();
  await registraEvento({ sessione, evento: "invio", nuova: false, origine, prId: pr?.id ?? null }).catch(() => undefined);

  const corpoAvviso =
    tipo === "tavolo"
      ? `Tavolo, ${salvata.serata}${salvata.sala === undefined ? "" : `, ${salvata.sala}`}`
      : tipo === "navetta"
        ? `Navetta da ${zona}, ${salvata.serata}`
        : tipo === "braccialetto"
          ? `Bracciale ${(genere ?? "").toLowerCase()}, ${salvata.serata}`
          : `Lista, ${salvata.serata}`;

  // Se il push fallisce (nessuno iscritto, un endpoint scaduto, un ritardo...) la
  // richiesta è comunque salvata: Luca la vede aprendo il pannello.
  const titolo = pr === null ? nomeCompleto : `${nomeCompleto} · PR ${pr.nome}`;
  await Promise.race([
    avvisaTutti(titolo, corpoAvviso, `/pannello/richieste/${salvata.id}`).catch(() => undefined),
    new Promise<void>((risolvi) => setTimeout(risolvi, ATTESA_PUSH_MS)),
  ]);

  return Response.json({ salvata: true, id: salvata.id }, { headers: NO_STORE });
}
