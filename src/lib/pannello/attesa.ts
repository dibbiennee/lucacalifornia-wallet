import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";
import {
  STATI_PRECEDENTI,
  eDataIso,
  eEventoSpeciale,
  eNotte,
  eStatoAttesa,
  escapaLike,
  nomeEvento,
  type CategoriaAttesa,
  type ChiaveEvento,
  type EventoSpeciale,
  type StatoAttesa,
} from "@/lib/lista-attesa";

import type { Ambito } from "./sessione";

/**
 * I dati della lista d'attesa.
 *
 * Come per le richieste (dati.ts), ogni lettura riceve l'ambito di chi guarda
 * e lo applica NELLA QUERY: Luca (owner) vede tutta la lista, un PR solo le
 * persone arrivate dal suo link (pr_id). Anche tutti i filtri (evento, data,
 * stato, ricerca) stanno nella query: la pagina non filtra niente da sola, e
 * un filtro non è mai solo un'apparenza dell'interfaccia.
 *
 * "Data effettiva" di una riga: la data della serata se è una serata del
 * calendario; per un evento speciale, la data che Luca ha impostato in
 * eventi_speciali, oppure nessuna. Non se ne inventano.
 */

/** L'ambito come parametro per le query: null = nessun limite (Luca), altrimenti l'id del PR. */
function prDi(ambito: Ambito): string | null {
  if (ambito.ruolo === "owner") {
    return null;
  }

  // Un PR senza id sarebbe un ambito vuoto che passerebbe per "vedi tutto": non deve succedere mai.
  if (typeof ambito.prId !== "string" || ambito.prId === "") {
    throw new Error("Ambito del PR non valido");
  }

  return ambito.prId;
}

/* ------------------------------- iscrizione ------------------------------- */

export interface NuovaAttesa {
  readonly nome: string;
  readonly contatto: string;
  readonly contattoTipo: "telefono" | "email";
  readonly contattoNorma: string;
  readonly evento: ChiaveEvento;
  /** Solo per le serate del calendario: AAAA-MM-GG. */
  readonly dataSerata?: string;
  readonly prId?: string;
  readonly provenienza: string;
}

/**
 * Mette una persona in lista. Se c'è già (stesso contatto, stessa lista) non fa
 * niente e lo dice: un secondo clic o un secondo invio non crea un doppione.
 * Non richiede una sessione: la chiama il modulo pubblico del sito.
 */
export async function iscriviListaAttesa(dati: NuovaAttesa): Promise<{ readonly nuova: boolean }> {
  const sql = await db();
  const e = dati.evento;
  const categoria: CategoriaAttesa = e.categoria;

  const righe = (await sql`
    INSERT INTO lista_attesa (
      id, nome, contatto, contatto_tipo, contatto_norma, categoria,
      codice_serata, data_serata, evento_speciale, pr_id, provenienza
    ) VALUES (
      ${`att-${randomUUID()}`}, ${dati.nome}, ${dati.contatto}, ${dati.contattoTipo}, ${dati.contattoNorma}, ${categoria},
      ${e.categoria === "serata" ? e.notte : null}, ${e.categoria === "serata" ? (dati.dataSerata ?? null) : null},
      ${e.categoria === "speciale" ? e.evento : null}, ${dati.prId ?? null}, ${dati.provenienza}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `) as unknown as readonly { readonly id: string }[];

  return { nuova: righe.length > 0 };
}

/* --------------------------------- lettura --------------------------------- */

export interface FiltriAttesa {
  readonly evento?: ChiaveEvento;
  /** AAAA-MM-GG: la data effettiva (della serata, o impostata per l'evento speciale). */
  readonly data?: string;
  readonly stato?: StatoAttesa;
  /** Nome, telefono o email, o un pezzo. */
  readonly q?: string;
  /** "futuri" nasconde le date passate (gli eventi senza data restano); "tutti" le mostra. */
  readonly quando: "futuri" | "tutti";
}

export interface VoceAttesa {
  readonly id: string;
  readonly creataIso: string;
  readonly nome: string;
  readonly contatto: string;
  readonly contattoTipo: "telefono" | "email";
  readonly evento: ChiaveEvento;
  /** "Sabato · International", "Halloween". */
  readonly nomeEvento: string;
  /** AAAA-MM-GG, o null per un evento speciale senza data. */
  readonly dataIso: string | null;
  readonly stato: StatoAttesa;
  readonly provenienza: string;
  /** Il PR da cui è arrivata, per Luca. */
  readonly prNome: string | null;
}

export interface RisultatoAttesa {
  readonly voci: readonly VoceAttesa[];
  /** Quante corrispondono ai filtri in tutto, anche oltre il limite. */
  readonly totale: number;
}

interface RigaAttesa {
  readonly id: string;
  readonly creata_alle: Date | string;
  readonly nome: string;
  readonly contatto: string;
  readonly contatto_tipo: string;
  readonly categoria: string;
  readonly codice_serata: string | null;
  readonly evento_speciale: string | null;
  readonly data_effettiva: string | null;
  readonly stato: string;
  readonly provenienza: string;
  readonly pr_nome: string | null;
  readonly totale: number | string;
}

function chiaveDaRiga(r: { categoria: string; codice_serata: string | null; evento_speciale: string | null }): ChiaveEvento {
  if (r.categoria === "serata" && eNotte(r.codice_serata)) {
    return { categoria: "serata", notte: r.codice_serata };
  }
  if (r.categoria === "speciale" && eEventoSpeciale(r.evento_speciale)) {
    return { categoria: "speciale", evento: r.evento_speciale };
  }
  // I vincoli della tabella lo rendono impossibile: se succede, meglio un errore che una riga travestita.
  throw new Error("Riga della lista d'attesa con evento non riconoscibile");
}

const LIMITE = 300;

/**
 * La lista, filtrata nella query. L'ordine: prima per data (le più vicine in
 * alto, gli eventi senza data in fondo), poi per evento, poi per chi è
 * arrivato prima.
 */
export async function listaAttesa(ambito: Ambito, filtri: FiltriAttesa, oggi: string): Promise<RisultatoAttesa> {
  // Un PR non vede la lista: contiene telefoni ed email, e non ha mai un'iscrizione sua.
  if (ambito.ruolo !== "owner") {
    return { voci: [], totale: 0 };
  }

  const sql = await db();
  const pr = prDi(ambito);

  const categoria = filtri.evento?.categoria ?? null;
  const codice = filtri.evento?.categoria === "serata" ? filtri.evento.notte : null;
  const speciale = filtri.evento?.categoria === "speciale" ? filtri.evento.evento : null;
  const data = filtri.data !== undefined && eDataIso(filtri.data) ? filtri.data : null;
  const stato = filtri.stato !== undefined && eStatoAttesa(filtri.stato) ? filtri.stato : null;
  const soloFuturi = filtri.quando === "futuri";

  const q = (filtri.q ?? "").trim().slice(0, 60);
  const ricerca = q === "" ? null : escapaLike(q);
  // La ricerca sulle cifre normalizzate (col prefisso 39) vale da tre cifre in su: con due troverebbe tutti i
  // telefoni, che cominciano tutti per 39. La ricerca sul testo scritto dalla persona, invece, vale sempre.
  const cifre = q.replace(/\D/g, "");
  const ricercaCifre = cifre.length >= 3 ? cifre : null;

  const righe = (await sql`
    WITH l AS (
      SELECT a.*, COALESCE(a.data_serata, e.data_evento) AS data_eff
      FROM lista_attesa a
      LEFT JOIN eventi_speciali e ON e.codice = a.evento_speciale
    )
    SELECT
      l.id, l.creata_alle, l.nome, l.contatto, l.contatto_tipo, l.categoria, l.codice_serata, l.evento_speciale,
      to_char(l.data_eff, 'YYYY-MM-DD') AS data_effettiva,
      l.stato, l.provenienza, p.nome AS pr_nome,
      COUNT(*) OVER () AS totale
    FROM l
    LEFT JOIN pr p ON p.id = l.pr_id
    WHERE (${pr}::text IS NULL OR l.pr_id = ${pr}::text)
      AND (${categoria}::text IS NULL OR l.categoria = ${categoria}::text)
      AND (${codice}::text IS NULL OR l.codice_serata = ${codice}::text)
      AND (${speciale}::text IS NULL OR l.evento_speciale = ${speciale}::text)
      AND (${data}::date IS NULL OR l.data_eff = ${data}::date)
      AND (${stato}::text IS NULL OR l.stato = ${stato}::text)
      AND (${soloFuturi}::boolean = false OR l.data_eff IS NULL OR l.data_eff >= ${oggi}::date)
      AND (
        ${ricerca}::text IS NULL
        OR l.nome ILIKE '%' || ${ricerca}::text || '%'
        OR l.contatto ILIKE '%' || ${ricerca}::text || '%'
        OR (${ricercaCifre}::text IS NOT NULL AND l.contatto_norma LIKE '%' || ${ricercaCifre}::text || '%')
      )
    ORDER BY (l.data_eff IS NULL), l.data_eff, l.categoria, l.codice_serata, l.evento_speciale, l.creata_alle
    LIMIT ${LIMITE}
  `) as unknown as RigaAttesa[];

  const voci = righe.map((r): VoceAttesa => {
    const evento = chiaveDaRiga(r);

    return {
      id: r.id,
      creataIso: new Date(r.creata_alle).toISOString(),
      nome: r.nome,
      contatto: r.contatto,
      contattoTipo: r.contatto_tipo === "email" ? "email" : "telefono",
      evento,
      nomeEvento: nomeEvento(evento),
      dataIso: r.data_effettiva,
      stato: eStatoAttesa(r.stato) ? r.stato : "in attesa",
      provenienza: r.provenienza,
      prNome: r.pr_nome,
    };
  });

  return { voci, totale: righe.length === 0 ? 0 : Number(righe[0]?.totale ?? 0) };
}

export interface ConteggioEvento {
  readonly evento: ChiaveEvento;
  readonly inAttesa: number;
  readonly totale: number;
}

interface RigaConteggio {
  readonly categoria: string;
  readonly codice_serata: string | null;
  readonly evento_speciale: string | null;
  readonly in_attesa: number;
  readonly totale: number;
}

/** Quante persone ci sono per evento, nell'ambito di chi guarda: per i numeri accanto al menu dei filtri. */
export async function conteggiPerEvento(ambito: Ambito): Promise<readonly ConteggioEvento[]> {
  const sql = await db();
  const pr = prDi(ambito);

  const righe = (await sql`
    SELECT categoria, codice_serata, evento_speciale,
           (COUNT(*) FILTER (WHERE stato = 'in attesa'))::int AS in_attesa,
           COUNT(*)::int AS totale
    FROM lista_attesa
    WHERE (${pr}::text IS NULL OR pr_id = ${pr}::text)
    GROUP BY categoria, codice_serata, evento_speciale
  `) as unknown as RigaConteggio[];

  return righe.map((r) => ({ evento: chiaveDaRiga(r), inAttesa: r.in_attesa, totale: r.totale }));
}

/** Quante persone aspettano una risposta (in attesa), per il numero sulla voce del menu. */
export async function contaInAttesa(ambito: Ambito): Promise<number> {
  const sql = await db();
  const pr = prDi(ambito);

  const righe = (await sql`
    SELECT COUNT(*)::int AS n FROM lista_attesa
    WHERE stato = 'in attesa' AND (${pr}::text IS NULL OR pr_id = ${pr}::text)
  `) as unknown as readonly { readonly n: number }[];

  return righe[0]?.n ?? 0;
}

/* -------------------------------- cambio di stato -------------------------------- */

export type EsitoCambioAttesa =
  | { readonly ok: true }
  | { readonly ok: false; readonly motivo: "inesistente" }
  | { readonly ok: false; readonly motivo: "non_valida"; readonly statoAttuale: StatoAttesa };

/**
 * Cambia lo stato di una persona in lista, in un solo UPDATE condizionale
 * sullo stato di partenza e, per un PR, sul suo pr_id: come transizione() per
 * le richieste. Due clic o due schede insieme: uno solo cambia lo stato.
 */
export async function cambiaStatoAttesa(ambito: Ambito, id: string, verso: StatoAttesa): Promise<EsitoCambioAttesa> {
  if (ambito.ruolo !== "owner") {
    throw new Error("Non autorizzato");
  }

  const sql = await db();
  const pr = prDi(ambito);
  const da = STATI_PRECEDENTI[verso];
  const primo = da[0];

  if (primo !== undefined) {
    // Al massimo due stati di partenza: si passano entrambi (il secondo ripete il primo se ce n'è uno solo).
    const secondo = da[1] ?? primo;

    const righe = (await sql`
      UPDATE lista_attesa SET stato = ${verso}
      WHERE id = ${id} AND (stato = ${primo} OR stato = ${secondo}) AND (${pr}::text IS NULL OR pr_id = ${pr}::text)
      RETURNING id
    `) as unknown as readonly unknown[];

    if (righe.length > 0) {
      return { ok: true };
    }
  }

  // Niente di cambiato: o non c'è (per questo ambito), o non era nello stato giusto.
  const attuale = (await sql`
    SELECT stato FROM lista_attesa WHERE id = ${id} AND (${pr}::text IS NULL OR pr_id = ${pr}::text)
  `) as unknown as readonly { readonly stato: string }[];
  const riga = attuale[0];

  return riga === undefined
    ? { ok: false, motivo: "inesistente" }
    : { ok: false, motivo: "non_valida", statoAttuale: eStatoAttesa(riga.stato) ? riga.stato : "in attesa" };
}

/* ------------------------------ date degli eventi speciali ------------------------------ */

export interface EventoSpecialeConData {
  readonly codice: EventoSpeciale;
  readonly nome: string;
  /** AAAA-MM-GG, o null finché non viene impostata. */
  readonly dataIso: string | null;
}

export async function eventiSpeciali(): Promise<readonly EventoSpecialeConData[]> {
  const sql = await db();
  const righe = (await sql`
    SELECT codice, nome, to_char(data_evento, 'YYYY-MM-DD') AS data_evento FROM eventi_speciali ORDER BY nome
  `) as unknown as readonly { readonly codice: string; readonly nome: string; readonly data_evento: string | null }[];

  return righe
    .filter((r): r is typeof r & { codice: EventoSpeciale } => eEventoSpeciale(r.codice))
    .map((r) => ({ codice: r.codice, nome: r.nome, dataIso: r.data_evento }));
}

/**
 * La data di un evento speciale, che Luca imposta quando la decide (o toglie,
 * con null). Da quel momento chi è in lista per quell'evento ha quella data.
 * Solo per Luca: un PR non decide le date.
 */
export async function impostaDataEventoSpeciale(ambito: Ambito, codice: EventoSpeciale, data: string | null): Promise<void> {
  if (ambito.ruolo !== "owner") {
    throw new Error("Non autorizzato");
  }

  if (data !== null && !eDataIso(data)) {
    throw new Error("Data non valida");
  }

  const sql = await db();
  await sql`UPDATE eventi_speciali SET data_evento = ${data}::date, aggiornato_alle = now() WHERE codice = ${codice}`;
}

