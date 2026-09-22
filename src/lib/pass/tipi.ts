/** I locali dove lavora Luca. Il token porta solo il codice, non l'indirizzo. */
export const LOCALI = {
  room26: {
    nome: "Room 26, Roma",
    indirizzo: "Piazza Guglielmo Marconi 31, 00144 Roma",
  },
  ninfeo: {
    nome: "Ninfeo, Roma",
    indirizzo: "",
  },
  morgan: {
    nome: "Morgan Beach Club, Civitavecchia",
    indirizzo: "",
  },
} as const;

export type CodiceLocale = keyof typeof LOCALI;

export function isCodiceLocale(valore: string): valore is CodiceLocale {
  return Object.hasOwn(LOCALI, valore);
}

/**
 * Una prenotazione confermata: è questo che viaggia cifrato dentro il QR.
 * Niente di superfluo, perché ogni carattere in più infittisce il codice e
 * lo rende più difficile da leggere con la fotocamera di notte.
 */
export interface Prenotazione {
  /** Identificativo del biglietto: univoco, mai riusato. */
  readonly serialNumber: string;
  /** Nome della serata, es. "BÁILAME". */
  readonly serata: string;
  /** Inizio della serata: decide quando il pass compare in blocco schermo. */
  readonly inizioSerata: Date;
  /** Testo mostrato nel campo tipo, es. "LISTA" oppure "TAVOLO, MISTO". */
  readonly tipo: string;
  /** Nome e cognome di chi entra. */
  readonly nomeCliente: string;
  /** Quale locale: nome e indirizzo si ricavano da LOCALI. */
  readonly locale: CodiceLocale;
  /** Sala o area, se il locale ne ha più di una. */
  readonly sala?: string;
}

/** Quello che serve per stampare il biglietto: la prenotazione più il suo QR. */
export interface DatiBiglietto extends Prenotazione {
  /** Contenuto del QR: il token cifrato che rappresenta questa prenotazione. */
  readonly token: string;
}
