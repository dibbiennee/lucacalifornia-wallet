/**
 * I locali, uno per stagione.
 *
 * Dal brief: d'inverno il Room 26 a Roma, d'estate il Ninfeo a Roma.
 *
 * La riga in più sul Ninfeo viene da fonti pubbliche (il portale eventi del
 * Comune di Roma e la stampa locale), non dal brief: va confermata con Luca
 * prima di andare online. Niente indirizzi precisi, niente orari, niente
 * prezzi: quelli li dà lui.
 */

export interface Locale {
  readonly codice: string;
  readonly nome: string;
  readonly citta: string;
  readonly stagione: "inverno" | "estate";
  readonly occhiello: string;
  readonly sottotitolo: string;
  readonly titolo: readonly string[];
  readonly testo: string;
  /** Chi ha già una programmazione porta alle serate, gli altri alla lista d'attesa. */
  readonly attesa?: "ninfeo";
  readonly foto?: string;
}

export const LOCALI_STAGIONE: readonly Locale[] = [
  {
    codice: "room26",
    nome: "Room 26",
    citta: "Roma",
    stagione: "inverno",
    occhiello: "D'INVERNO",
    titolo: ["ROOM 26", "ROMA"],
    sottotitolo: "Quattro sere a settimana, da giovedì a domenica",
    testo:
      "D'inverno lavoro qui, quattro sere a settimana. Ogni serata ha la sua musica e il suo pubblico: scegli la tua e ti sistemo io, in lista o al tavolo.",
    foto: "/foto/copertine/sabato.jpg",
  },
  {
    codice: "ninfeo",
    nome: "Ninfeo",
    citta: "Roma",
    stagione: "estate",
    occhiello: "D'ESTATE",
    titolo: ["NINFEO", "ROMA"],
    sottotitolo: "Ninfeo Village, al parco del Ninfeo, all'EUR",
    testo:
      "D'estate ci spostiamo qui, sotto gli alberi: stesso gruppo, stessa musica, all'aperto. Il calendario della stagione lo pubblico quando è pronto: lasciami un contatto e te lo dico io, prima che se ne accorgano gli altri.",
    attesa: "ninfeo",
  },
];

export function locale(codice: string): Locale | undefined {
  return LOCALI_STAGIONE.find((l) => l.codice === codice);
}
