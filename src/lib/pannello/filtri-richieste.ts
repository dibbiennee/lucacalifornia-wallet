import { eDataIso } from "@/lib/lista-attesa";

import type { StatoRichiesta } from "./dati";

/**
 * I filtri dell'elenco richieste: cosa sono, come si leggono dall'indirizzo e
 * come si riscrivono.
 *
 * Funzioni pure, usate sia dal server (che applica i filtri nella query) sia
 * dal browser (che li mostra e li tiene nell'indirizzo). Ogni valore sbagliato
 * si scarta in silenzio e diventa "nessun filtro": dall'indirizzo può arrivare
 * qualsiasi cosa, e niente di ciò che arriva deve rompere la pagina.
 *
 * Gli eventi si identificano, nelle richieste, con codice_serata (la notte:
 * giovedì Milkshake, venerdì Drip, sabato International, domenica Bàilame,
 * Ninfeo) più data_serata (il giorno vero). "altro" raccoglie le richieste con
 * un codice non riconosciuto. La navetta e le richieste di prima del
 * calendario non hanno una data.
 */

export const STATI_FILTRO = ["in attesa", "confermata", "rifiutata"] as const;
export const NOTTI_FILTRO = ["milkshake", "venerdi", "sabato", "bailame", "ninfeo", "altro"] as const;
export const TIPI_FILTRO = ["tavolo", "lista", "braccialetto", "navetta"] as const;
export const QUANDO_FILTRO = ["futuri", "passate", "tutte"] as const;

export type NotteFiltro = (typeof NOTTI_FILTRO)[number];
export type TipoFiltro = (typeof TIPI_FILTRO)[number];
export type QuandoFiltro = (typeof QUANDO_FILTRO)[number];

export interface FiltriRichieste {
  readonly stato?: StatoRichiesta;
  readonly notte?: NotteFiltro;
  /** AAAA-MM-GG: una serata precisa. Se c'è, "quando" non conta. */
  readonly data?: string;
  readonly tipo?: TipoFiltro;
  /**
   * Da dove arriva: "diretto" (nessun PR) oppure l'id di un PR ("pr-antonio").
   * Lo applica solo il server, e solo per Luca: un PR vede già soltanto le sue.
   */
  readonly pr?: string;
  /** Nome o telefono, o un pezzo. Per un PR, solo il nome. */
  readonly q?: string;
  /**
   * "futuri": da oggi in poi, e le richieste senza data (la navetta, quelle di
   * prima del calendario). "passate": solo con una data già passata. "tutte".
   */
  readonly quando: QuandoFiltro;
}

export const FILTRI_PREDEFINITI: FiltriRichieste = { quando: "futuri" };

export const NOME_NOTTE_FILTRO: Readonly<Record<NotteFiltro, string>> = {
  milkshake: "Giovedì · Milkshake",
  venerdi: "Venerdì · Drip",
  sabato: "Sabato · International",
  bailame: "Domenica · Bàilame",
  ninfeo: "Ninfeo",
  altro: "Altre serate",
};

export const NOME_TIPO_FILTRO: Readonly<Record<TipoFiltro, string>> = {
  tavolo: "Tavolo",
  lista: "Lista",
  braccialetto: "Bracciale",
  navetta: "Navetta",
};

function incluso<T extends string>(elenco: readonly T[], valore: unknown): valore is T {
  return typeof valore === "string" && (elenco as readonly string[]).includes(valore);
}

/** "diretto" o l'id di un PR: lettere minuscole e cifre dopo "pr-", niente altro. */
export const FORMA_PR = /^(diretto|pr-[a-z0-9]{1,40})$/;

/** Il massimo di caratteri della ricerca: lo stesso della lista d'attesa. */
export const MAX_RICERCA = 60;

/** Da una funzione "dammi il parametro" (URLSearchParams, searchParams di Next, un oggetto) ai filtri. */
export function filtriDaParametri(leggi: (chiave: string) => string | null | undefined): FiltriRichieste {
  const stato = leggi("stato");
  const notte = leggi("notte");
  const data = leggi("data");
  const tipo = leggi("tipo");
  const pr = leggi("pr");
  const q = (leggi("q") ?? "").trim().slice(0, MAX_RICERCA);
  const quando = leggi("quando");

  return {
    ...(incluso(STATI_FILTRO, stato) ? { stato } : {}),
    ...(incluso(NOTTI_FILTRO, notte) ? { notte } : {}),
    ...(data !== null && data !== undefined && eDataIso(data) ? { data } : {}),
    ...(incluso(TIPI_FILTRO, tipo) ? { tipo } : {}),
    ...(typeof pr === "string" && FORMA_PR.test(pr) ? { pr } : {}),
    ...(q === "" ? {} : { q }),
    quando: incluso(QUANDO_FILTRO, quando) ? quando : FILTRI_PREDEFINITI.quando,
  };
}

/** Da un oggetto qualsiasi (quello che manda il browser a un'azione) ai filtri: stessa pulizia. */
export function filtriDaOggetto(valore: unknown): FiltriRichieste {
  const o = typeof valore === "object" && valore !== null ? (valore as Record<string, unknown>) : {};
  // Solo proprietà proprie e di tipo testo: niente di ereditato dal prototipo, niente numeri o elenchi.
  return filtriDaParametri((chiave) => (Object.hasOwn(o, chiave) && typeof o[chiave] === "string" ? (o[chiave] as string) : null));
}

/** I filtri come stringa per l'indirizzo, senza i valori di partenza ("quando=futuri" non serve scriverlo). */
export function parametriDaFiltri(f: FiltriRichieste): string {
  const p = new URLSearchParams();

  if (f.stato !== undefined) p.set("stato", f.stato);
  if (f.notte !== undefined) p.set("notte", f.notte);
  if (f.data !== undefined) p.set("data", f.data);
  if (f.tipo !== undefined) p.set("tipo", f.tipo);
  if (f.pr !== undefined) p.set("pr", f.pr);
  if (f.q !== undefined && f.q !== "") p.set("q", f.q);
  if (f.quando !== FILTRI_PREDEFINITI.quando) p.set("quando", f.quando);

  return p.toString();
}

/** Come parametriDaFiltri ma con il punto interrogativo davanti, o niente. */
export function suffissoDaFiltri(f: FiltriRichieste): string {
  const s = parametriDaFiltri(f);
  return s === "" ? "" : `?${s}`;
}

/** Vero se i filtri sono quelli di partenza. */
export function sonoPredefiniti(f: FiltriRichieste): boolean {
  return parametriDaFiltri(f) === "";
}

/** Una chiave stabile, per confrontare due insiemi di filtri. */
export function chiaveFiltri(f: FiltriRichieste): string {
  return parametriDaFiltri(f);
}

/** Quanti filtri (oltre allo stato, che ha il suo controllo) sono attivi: per il numero sul pulsante "Filtri". */
export function filtriAttiviNelPannello(f: FiltriRichieste): number {
  return [f.notte, f.tipo, f.pr, f.data, f.quando !== FILTRI_PREDEFINITI.quando ? f.quando : undefined].filter((x) => x !== undefined).length;
}

/* ---------------------------- cosa torna dal server ---------------------------- */

/** Una serata con richieste, per le righette delle date. */
export interface DataConRichieste {
  /** AAAA-MM-GG */
  readonly dataIso: string;
  /** "Sab 3 ott" */
  readonly breve: string;
  /** "International" */
  readonly notte: string;
  /** In attesa: quelle a cui si deve ancora rispondere. */
  readonly daGestire: number;
  readonly totale: number;
}

export type ContiPerStato = Readonly<Record<StatoRichiesta, number>>;
