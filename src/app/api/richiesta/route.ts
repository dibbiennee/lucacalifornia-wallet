import { cookies } from "next/headers";

import { serataPerData } from "@/lib/calendario-serate";
import { BISCOTTO_PROVENIENZA, nomeProvenienza } from "@/contenuti/canali";
import { creaRichiesta, type NuovaRichiesta } from "@/lib/pannello/dati";
import { avvisaTutti } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve una richiesta di lista, tavolo o navetta.
 *
 * La scrive su Postgres e avvisa chi ha acceso le notifiche nel pannello:
 * da qui in poi una richiesta vera arriva davvero a Luca.
 *
 * Qui non parte nessun messaggio al cliente: ogni messaggio a chi prenota lo
 * manda Luca a mano, ed è una regola del brief. L'avviso push va solo a lui.
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
}

const TIPI = ["tavolo", "braccialetto", "lista", "navetta"] as const;
const GENERI = ["Donna", "Uomo", "Misti"] as const;

function testo(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }
  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ errore: "Richiesta illeggibile" }, { status: 400 });
  }

  const c = corpo as Partial<Richiesta>;
  const nome = testo(c.nome, 60);
  const cognome = testo(c.cognome, 60);
  const telefono = testo(c.telefono, 30);
  const serataScelta = testo(c.serata, 80);
  // Solo il modulo principale manda una data: la navetta sceglie ancora solo il giorno della settimana.
  const dataSerata = testo(c.dataSerata, 10);
  const persone = testo(c.persone, 10);
  const tipo = testo(c.tipo, 20);

  if (tipo === null || !TIPI.includes(tipo as (typeof TIPI)[number])) {
    return Response.json({ errore: "Tipo di richiesta sconosciuto" }, { status: 400 });
  }

  // La navetta si chiede con nome, telefono, serata e zona: il cognome no,
  // perché è un modulo corto che si compila mentre si sta già uscendo.
  const navetta = tipo === "navetta";
  const braccialetto = tipo === "braccialetto";
  const zona = testo(c.zona, 80);
  const genere = testo(c.genere, 10);

  if (nome === null || telefono === null || serataScelta === null) {
    return Response.json({ errore: "Servono nome, telefono e la serata" }, { status: 400 });
  }

  if (!navetta && cognome === null) {
    return Response.json({ errore: "Serve anche il cognome" }, { status: 400 });
  }

  if (navetta && zona === null) {
    return Response.json({ errore: "Serve la zona da cui parti" }, { status: 400 });
  }

  if (braccialetto && (genere === null || !GENERI.includes(genere as (typeof GENERI)[number]))) {
    return Response.json({ errore: "Dicci se il braccialetto è per una donna o un uomo" }, { status: 400 });
  }

  if (telefono.replace(/\D/g, "").length < 9) {
    return Response.json({ errore: "Il numero di telefono non sembra giusto" }, { status: 400 });
  }

  const tavolo = tipo === "tavolo";

  /*
   * Da dove arriva chi prenota. Non lo chiede il modulo: lo sa il sito,
   * perché chi è entrato da /ig o da /marco si porta dietro un biscotto.
   * Chi arriva digitando l'indirizzo risulta "Diretto", che è la verità.
   */
  const provenienza = await nomeProvenienza((await cookies()).get(BISCOTTO_PROVENIENZA)?.value);

  // La notte e il nome da biglietto si ricavano dalla data, non da quello che
  // manda il browser: così non c'è da fidarsi di una stringa scritta a mano.
  // La navetta non manda una data (sceglie solo il giorno), quindi resta null.
  const derivata = dataSerata === null ? null : serataPerData(dataSerata);
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
    ...(dataSerata === null ? {} : { dataSerata }),
    ...(gruppo === null ? {} : { gruppo }),
    ...(budget === null ? {} : { budget }),
    ...(occasione === null ? {} : { occasione }),
    ...(persone === null ? {} : { persone }),
    ...(note === null ? {} : { messaggio: note }),
    ...(navetta && zona !== null ? { zona } : {}),
  };

  const salvata = await creaRichiesta(daSalvare);

  const corpoAvviso =
    tipo === "tavolo"
      ? `Tavolo, ${salvata.serata}${salvata.sala === undefined ? "" : `, ${salvata.sala}`}`
      : tipo === "navetta"
        ? `Navetta da ${zona}, ${salvata.serata}`
        : tipo === "braccialetto"
          ? `Bracciale ${(genere ?? "").toLowerCase()}, ${salvata.serata}`
          : `Lista, ${salvata.serata}`;

  // Se il push fallisce (nessuno iscritto, un endpoint scaduto...) la
  // richiesta è comunque salvata: Luca la vede aprendo il pannello.
  await avvisaTutti(nomeCompleto, corpoAvviso, `/pannello/richieste/${salvata.id}`).catch(() => undefined);

  return Response.json(
    { salvata: true, id: salvata.id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
