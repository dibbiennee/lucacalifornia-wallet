/**
 * La lista d'attesa: tipi, eventi e regole comuni al sito e al pannello.
 *
 * Gira sia sul server sia nel browser: niente API di Node qui dentro.
 *
 * DUE CATEGORIE, distinte nello schema:
 *
 * - **serata**: una notte del calendario di Luca (giovedì, venerdì, sabato,
 *   domenica al ROOM26, poi il Ninfeo). Ha sempre una data vera e il codice
 *   della notte, gli stessi di richieste.data_serata e richieste.codice_serata.
 * - **speciale**: un evento che non fa parte del calendario fisso (special
 *   guest, Halloween, Capodanno, le due stagioni estive). Non ha una data
 *   finché non viene configurata: non se ne inventano. Quando Luca ne imposta
 *   una (tabella eventi_speciali), tutta la lista di quell'evento la acquista
 *   senza riscrivere nessuna riga.
 */

import type { NotteSerata } from "./calendario-serate";

export type CategoriaAttesa = "serata" | "speciale";

export const EVENTI_SPECIALI = ["special_guest", "halloween", "capodanno", "ninfeo", "morgan"] as const;
export type EventoSpeciale = (typeof EVENTI_SPECIALI)[number];

/**
 * Gli eventi per cui si può entrare in lista dal sito: solo Halloween e
 * Capodanno. Special guest, Ninfeo e Morgan non hanno lista: sul sito sono solo
 * "In arrivo", senza modulo e senza dati raccolti. Restano in EVENTI_SPECIALI
 * solo perché una riga già salvata si legga ancora.
 */
export const EVENTI_CON_LISTA = ["halloween", "capodanno"] as const satisfies readonly EventoSpeciale[];
export type EventoConLista = (typeof EVENTI_CON_LISTA)[number];

export function eEventoConLista(valore: unknown): valore is EventoConLista {
  return typeof valore === "string" && (EVENTI_CON_LISTA as readonly string[]).includes(valore);
}

export const NOTTI: readonly NotteSerata[] = ["milkshake", "venerdi", "sabato", "bailame", "ninfeo"];

export function eEventoSpeciale(valore: unknown): valore is EventoSpeciale {
  return typeof valore === "string" && (EVENTI_SPECIALI as readonly string[]).includes(valore);
}

export function eNotte(valore: unknown): valore is NotteSerata {
  return typeof valore === "string" && (NOTTI as readonly string[]).includes(valore);
}

/** Come si leggono nel pannello. */
export const NOME_SPECIALE: Readonly<Record<EventoSpeciale, string>> = {
  special_guest: "Special guest",
  halloween: "Halloween",
  capodanno: "Capodanno",
  ninfeo: "Ninfeo, estate",
  morgan: "Morgan, estate",
};

export const NOME_NOTTE: Readonly<Record<NotteSerata, string>> = {
  milkshake: "Giovedì · Milkshake",
  venerdi: "Venerdì · Drip",
  sabato: "Sabato · International",
  bailame: "Domenica · Bàilame",
  ninfeo: "Ninfeo",
};

/* ---------------------------------- stati ---------------------------------- */

export const STATI_ATTESA = ["in attesa", "avvisata", "chiusa"] as const;
export type StatoAttesa = (typeof STATI_ATTESA)[number];

export function eStatoAttesa(valore: unknown): valore is StatoAttesa {
  return typeof valore === "string" && (STATI_ATTESA as readonly string[]).includes(valore);
}

/**
 * Il flusso di una persona in lista:
 *
 *   in attesa  ->  avvisata  ->  chiusa
 *              ->  chiusa
 *
 * "Avvisata": Luca (o il PR) le ha scritto. "Chiusa": non serve più (ha
 * prenotato, non risponde, si è tolta). Chiusa è la fine. Ogni stato ha al
 * più due stati da cui si può arrivare; l'UPDATE condizionale li usa.
 */
export const STATI_PRECEDENTI: Readonly<Record<StatoAttesa, readonly StatoAttesa[]>> = {
  "in attesa": [],
  avvisata: ["in attesa"],
  chiusa: ["in attesa", "avvisata"],
};

/* ------------------------------- l'evento scelto ------------------------------- */

/**
 * Un filtro "evento" è una stringa sola, comoda in un indirizzo e in un menu:
 * "serata:sabato" oppure "speciale:halloween".
 */
export type ChiaveEvento =
  | { readonly categoria: "serata"; readonly notte: NotteSerata }
  | { readonly categoria: "speciale"; readonly evento: EventoSpeciale };

export function chiaveDaTesto(testo: string | null | undefined): ChiaveEvento | null {
  if (testo === null || testo === undefined) {
    return null;
  }

  const [categoria, valore] = testo.split(":");

  if (categoria === "serata" && eNotte(valore)) {
    return { categoria: "serata", notte: valore };
  }
  if (categoria === "speciale" && eEventoSpeciale(valore)) {
    return { categoria: "speciale", evento: valore };
  }

  return null;
}

export function testoDaChiave(chiave: ChiaveEvento): string {
  return chiave.categoria === "serata" ? `serata:${chiave.notte}` : `speciale:${chiave.evento}`;
}

export function nomeEvento(chiave: ChiaveEvento): string {
  return chiave.categoria === "serata" ? NOME_NOTTE[chiave.notte] : NOME_SPECIALE[chiave.evento];
}

/* --------------------------------- il contatto --------------------------------- */

export interface ContattoNormalizzato {
  readonly tipo: "telefono" | "email";
  /**
   * La forma per confrontare e cercare: per il telefono le sole cifre col
   * prefisso italiano (393331234567), per l'email minuscola. Due persone che
   * scrivono lo stesso numero in modi diversi ("333 123 4567", "+39 333...")
   * sono la stessa persona.
   */
  readonly norma: string;
}

/**
 * Da quello che ha scritto la persona alla forma da conservare e cercare.
 * Null se non somiglia né a un telefono né a un'email: stesse soglie che il
 * modulo usava già (almeno 9 cifre, oppure una chiocciola).
 */
export function normalizzaContatto(contatto: string): ContattoNormalizzato | null {
  const pulito = contatto.trim();

  if (pulito.includes("@")) {
    // Un controllo largo di proposito: serve a scartare gli errori di battitura, non a validare l'indirizzo.
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pulito) ? { tipo: "email", norma: pulito.toLowerCase() } : null;
  }

  let cifre = pulito.replace(/\D/g, "");

  if (cifre.startsWith("00")) {
    cifre = cifre.slice(2);
  }

  if (cifre.length < 9 || cifre.length > 15) {
    return null;
  }

  // Un numero scritto senza prefisso (da 9 a 10 cifre) è italiano e prende il 39. Conta la lunghezza, non l'inizio:
  // un cellulare come 393 123 4567 comincia per 39 ma è un numero senza prefisso, mentre col prefisso ne ha 12.
  if (cifre.length <= 10) {
    cifre = `39${cifre}`;
  }

  return { tipo: "telefono", norma: cifre };
}

/** I caratteri speciali di LIKE, perché chi cerca "50%" non trovi tutto. */
export function escapaLike(testo: string): string {
  return testo.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** AAAA-MM-GG, e che sia una data vera. */
export function eDataIso(valore: unknown): valore is string {
  if (typeof valore !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valore)) {
    return false;
  }
  const [a, m, g] = valore.split("-").map(Number) as [number, number, number];
  const d = new Date(Date.UTC(a, m - 1, g));
  return d.getUTCFullYear() === a && d.getUTCMonth() === m - 1 && d.getUTCDate() === g;
}

/** "2026-10-02": il giorno di oggi all'ora di Roma. */
export function oggiARoma(adesso: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(adesso);
}
