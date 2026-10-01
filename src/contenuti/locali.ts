/**
 * I locali, uno per stagione.
 *
 * Dal brief: d'inverno il Room 26 a Roma, d'estate il Ninfeo a Roma e il
 * Morgan Beach Club a Civitavecchia.
 *
 * Le due righe in più sul Ninfeo e sul Morgan vengono da fonti pubbliche
 * (il portale eventi del Comune di Roma e la stampa locale), non dal brief:
 * vanno confermate con Luca prima di andare online. Niente indirizzi
 * precisi, niente orari, niente prezzi: quelli li dà lui.
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
  readonly attesa?: "ninfeo" | "morgan";
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
      "D'inverno lavoro qui, quattro sere a settimana. Ogni serata ha la sua musica e il suo pubblico: scegli la tua e ti sistemo io, al tavolo o in lista.",
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
  {
    codice: "morgan",
    nome: "Morgan Beach Club",
    citta: "Civitavecchia",
    stagione: "estate",
    occhiello: "D'ESTATE",
    titolo: ["MORGAN", "BEACH CLUB"],
    sottotitolo: "Sul mare, a Civitavecchia",
    testo:
      "L'altra casa dell'estate, sul litorale: piscina, solarium e si balla fino a tardi. Anche qui il calendario arriva quando è pronto: lasciami un contatto e sei fra i primi a saperlo.",
    attesa: "morgan",
  },
];

export function locale(codice: string): Locale | undefined {
  return LOCALI_STAGIONE.find((l) => l.codice === codice);
}
