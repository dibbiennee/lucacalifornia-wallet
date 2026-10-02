import { cookies } from "next/headers";

import { serataPerData } from "@/lib/calendario-serate";
import { BISCOTTO_PROVENIENZA, nomeProvenienza } from "@/contenuti/canali";
import {
  eDataIso,
  eEventoSpeciale,
  normalizzaContatto,
  oggiARoma,
  type ChiaveEvento,
} from "@/lib/lista-attesa";
import { chiaveIndirizzo, segnaFallito, statoBlocco } from "@/lib/pannello/blocco-tentativi";
import { iscriviListaAttesa } from "@/lib/pannello/attesa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * La lista d'attesa: "avvisami" per gli eventi speciali, e l'attesa per una
 * serata del calendario.
 *
 * Salva davvero su Postgres (tabella lista_attesa): da qui in poi chi si mette
 * in lista compare nel pannello di Luca. Non parte nessun messaggio alla persona: se ne occupa chi usa il
 * pannello, a mano, come per le richieste.
 *
 * POST { nome, contatto, tipo } per un evento speciale (special_guest,
 *   halloween, capodanno, ninfeo, morgan);
 * POST { nome, contatto, dataSerata } per una serata del calendario
 *   (AAAA-MM-GG). La notte la ricava il server dalla data, con la stessa
 *   regola del modulo di prenotazione: non ci si fida di quello che manda il
 *   browser, e una data fuori calendario o già passata si rifiuta.
 *
 * Non si inventa nessuna data per gli eventi speciali: se hanno una data la
 * imposta Luca (eventi_speciali), non chi compila il modulo.
 *
 * Contro lo spam: un campo trappola ("sito") che un utente non vede e un bot
 * riempie, il limite per indirizzo (20 invii ogni 10 minuti, nel database), e
 * il vincolo della tabella che impedisce lo stesso contatto due volte nella
 * stessa lista.
 */

const INVII_PER_INDIRIZZO = 20;

function testo(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }
  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

function errore(messaggio: string, status = 400): Response {
  return Response.json({ errore: messaggio }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return errore("Richiesta illeggibile");
  }

  const c = (corpo ?? {}) as Record<string, unknown>;

  // Il campo trappola: chi lo riempie è un bot. Si risponde come se fosse andata bene, senza salvare niente.
  if (typeof c["sito"] === "string" && c["sito"].trim() !== "") {
    return Response.json({ salvata: true }, { headers: { "Cache-Control": "no-store" } });
  }

  const nome = testo(c["nome"], 60);
  const contattoGrezzo = testo(c["contatto"], 80);

  if (nome === null) {
    return errore("Serve il nome");
  }
  if (contattoGrezzo === null) {
    return errore("Serve un telefono o un'email");
  }

  const contatto = normalizzaContatto(contattoGrezzo);

  if (contatto === null) {
    return errore("Scrivi un telefono valido o un'email");
  }

  // Quale lista: una serata del calendario (dataSerata) oppure un evento speciale (tipo). Una cosa o l'altra.
  let evento: ChiaveEvento;
  let dataSerata: string | undefined;

  if (c["dataSerata"] !== undefined) {
    const data = c["dataSerata"];
    const serata = eDataIso(data) ? serataPerData(data) : null;

    if (serata === null || !eDataIso(data)) {
      return errore("Questa data non è nel calendario delle serate");
    }
    if (data < oggiARoma()) {
      return errore("Questa serata è già passata");
    }

    evento = { categoria: "serata", notte: serata.notte };
    dataSerata = data;
  } else if (eEventoSpeciale(c["tipo"])) {
    evento = { categoria: "speciale", evento: c["tipo"] };
  } else {
    return errore("Tipo di lista sconosciuto");
  }

  // Il limite per indirizzo. Se il database non risponde non si può né contare né salvare: si dice di riprovare.
  const chiave = `att:${chiaveIndirizzo(richiesta)}`;
  const limite = await statoBlocco(chiave, INVII_PER_INDIRIZZO, false);

  if (limite.nonDisponibile) {
    return errore("Non riesco a salvare adesso, riprova fra qualche minuto", 503);
  }
  if (limite.bloccato) {
    return errore("Troppe richieste da questo indirizzo, riprova fra un po'", 429);
  }

  await segnaFallito(chiave, false);

  // Da dove arriva: lo sa il sito, dal biscotto del canale (/ig, /tiktok...), non il modulo.
  // La lista d'attesa si apre dal sito di Luca, non dal link di un PR (che mostra solo il modulo):
  // le iscrizioni arrivano quindi senza PR e le vede Luca.
  const biscotto = (await cookies()).get(BISCOTTO_PROVENIENZA)?.value;
  const provenienza = nomeProvenienza(biscotto);

  await iscriviListaAttesa({
    nome,
    contatto: contattoGrezzo,
    contattoTipo: contatto.tipo,
    contattoNorma: contatto.norma,
    evento,
    ...(dataSerata === undefined ? {} : { dataSerata }),
    provenienza,
  });

  // Stessa risposta se la persona era già in lista: dire "c'era già" farebbe scoprire a chiunque quali numeri ci sono.
  return Response.json({ salvata: true }, { headers: { "Cache-Control": "no-store" } });
}
