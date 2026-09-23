/**
 * I locali, uno per stagione.
 *
 * Dal brief: d'inverno il Room 26 a Roma, d'estate il Ninfeo a Roma e il
 * Morgan Beach Club a Civitavecchia. Di più non si sa ancora, e qui non si
 * inventa: niente indirizzi, niente orari, niente prezzi finché non li dà
 * Luca. Le frasi sono scritte per funzionare anche senza quei dati.
 */

export interface Locale {
  readonly codice: string;
  readonly nome: string;
  readonly citta: string;
  readonly stagione: "inverno" | "estate";
  readonly occhiello: string;
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
    testo:
      "D'estate mi sposto qui. Il calendario della stagione lo pubblico quando è pronto: lasciami un contatto e te lo dico io, prima che se ne accorgano gli altri.",
    attesa: "ninfeo",
  },
  {
    codice: "morgan",
    nome: "Morgan Beach Club",
    citta: "Civitavecchia",
    stagione: "estate",
    occhiello: "D'ESTATE",
    titolo: ["MORGAN", "BEACH CLUB"],
    testo:
      "L'altra casa dell'estate, sul litorale. Anche qui il calendario arriva quando è pronto: lasciami un contatto e sei fra i primi a saperlo.",
    attesa: "morgan",
  },
];

export function locale(codice: string): Locale | undefined {
  return LOCALI_STAGIONE.find((l) => l.codice === codice);
}
