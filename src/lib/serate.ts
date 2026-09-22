/**
 * Le serate di Luca, come stanno nel brief del sito.
 *
 * Questo file gira anche nel browser: niente API di Node qui dentro.
 */

export interface Serata {
  readonly codice: string;
  readonly nome: string;
  /** Giorno della settimana secondo Date.getDay(): 0 domenica, 6 sabato. */
  readonly giorno: number;
  readonly musica: string;
  readonly sale: readonly string[];
}

export const SERATE: readonly Serata[] = [
  { codice: "milkshake", nome: "MILKSHAKE", giorno: 4, musica: "afro e reggaeton", sale: [] },
  { codice: "venerdi", nome: "VENERDÌ", giorno: 5, musica: "commerciale e reggaeton", sale: [] },
  {
    codice: "sabato",
    nome: "SABATO",
    giorno: 6,
    musica: "due sale",
    sale: ["Sala 1, house", "Sala 2, reggaeton"],
  },
  { codice: "bailame", nome: "BÁILAME", giorno: 0, musica: "100% reggaeton", sale: [] },
];

/**
 * La prossima volta che cade quella serata, alle 23:30.
 *
 * Calcolata sull'orologio di chi guarda la pagina: Luca sta a Roma, quindi
 * viene l'ora di Roma senza doversi portare dietro i fusi orari.
 */
export function prossimaOccorrenza(giorno: number, adesso: Date = new Date()): Date {
  const data = new Date(adesso);
  data.setHours(23, 30, 0, 0);

  const mancanti = (giorno - data.getDay() + 7) % 7;
  data.setDate(data.getDate() + (mancanti === 0 && data <= adesso ? 7 : mancanti));

  return data;
}

/** "domenica 27 settembre", per i messaggi e per la pagina. */
export function dataInLettere(data: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(data);
}
