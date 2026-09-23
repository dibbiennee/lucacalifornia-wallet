import { cookies } from "next/headers";

import { BISCOTTO_PROVENIENZA, nomeProvenienza } from "@/contenuti/canali";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve una richiesta di lista o tavolo.
 *
 * IN ANTEPRIMA NON SALVA NIENTE, e lo dice a chi la manda. Nel sito vero la
 * richiesta finisce su Supabase e compare nel pannello di Luca. Finché quel
 * pezzo non c'è, fingere di aver salvato sarebbe peggio che dirlo.
 *
 * Qui non parte nessun messaggio: ogni messaggio ai clienti lo manda Luca a
 * mano, ed è una regola del brief.
 */

interface Richiesta {
  readonly tipo: string;
  readonly nome: string;
  readonly cognome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly note?: string;
  readonly zona?: string;
}

const TIPI = ["lista", "tavolo", "navetta"] as const;

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
  const serata = testo(c.serata, 60);
  const tipo = testo(c.tipo, 20);

  if (tipo === null || !TIPI.includes(tipo as (typeof TIPI)[number])) {
    return Response.json({ errore: "Tipo di richiesta sconosciuto" }, { status: 400 });
  }

  // La navetta si chiede con nome, telefono, serata e zona: il cognome no,
  // perché è un modulo corto che si compila mentre si sta già uscendo.
  const navetta = tipo === "navetta";
  const zona = testo(c.zona, 80);

  if (nome === null || telefono === null || serata === null) {
    return Response.json({ errore: "Servono nome, telefono e la serata" }, { status: 400 });
  }

  if (!navetta && cognome === null) {
    return Response.json({ errore: "Serve anche il cognome" }, { status: 400 });
  }

  if (navetta && zona === null) {
    return Response.json({ errore: "Serve la zona da cui parti" }, { status: 400 });
  }

  if (telefono.replace(/\D/g, "").length < 9) {
    return Response.json({ errore: "Il numero di telefono non sembra giusto" }, { status: 400 });
  }

  const tavolo = tipo === "tavolo";

  /*
   * Rimando indietro la richiesta come l'ho capita. Non la salvo, ma così
   * si può verificare che arrivi completa, occasione e note comprese, senza
   * dover guardare dentro un database che qui non c'è.
   */
  /*
   * Da dove arriva chi prenota. Non lo chiede il modulo: lo sa il sito,
   * perché chi è entrato da /ig o da /marco si porta dietro un biscotto.
   * Chi arriva digitando l'indirizzo risulta "Diretto", che è la verità.
   */
  const provenienza = nomeProvenienza((await cookies()).get(BISCOTTO_PROVENIENZA)?.value);

  const ricevuta = {
    tipo,
    nome,
    ...(cognome === null ? {} : { cognome }),
    telefono,
    serata,
    ...(zona === null ? {} : { zona }),
    provenienza,
    ...(tavolo
      ? {
          gruppo: testo(c.gruppo, 40) ?? "",
          budget: testo(c.budget, 40) ?? "",
          occasione: testo(c.occasione, 60) ?? "",
          note: testo(c.note, 300) ?? "",
        }
      : {}),
  };

  return Response.json(
    { salvata: false, nota: "Anteprima del sito: la richiesta non viene conservata.", ricevuta },
    { headers: { "Cache-Control": "no-store" } },
  );
}
