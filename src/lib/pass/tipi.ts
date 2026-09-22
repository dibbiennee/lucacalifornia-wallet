/** Quello che serve per stampare un biglietto, indipendente da dove arriva. */
export interface DatiBiglietto {
  /** Identificativo del singolo biglietto: univoco, mai riusato. */
  readonly serialNumber: string;
  /** Nome della serata, es. "BAILAME". */
  readonly serata: string;
  /** Inizio della serata: decide quando il pass compare in blocco schermo. */
  readonly inizioSerata: Date;
  /** Testo mostrato nel campo tipo, es. "LISTA" oppure "TAVOLO, MISTO". */
  readonly tipo: string;
  /** Nome e cognome di chi entra. */
  readonly nomeCliente: string;
  /** Nome del locale, es. "Room 26, Roma". */
  readonly locale: string;
  /** Sala o area, se il locale ne ha più di una. */
  readonly sala?: string;
  /** Indirizzo completo, mostrato sul retro del biglietto. */
  readonly indirizzo: string;
  /** Contenuto del QR: in fase 2 sarà il token firmato della prenotazione. */
  readonly token: string;
}
