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
  // "Bàilame" con l'accento: è la grafia del logo della serata.
  { codice: "bailame", nome: "BÀILAME", giorno: 0, musica: "100% reggaeton", sale: [] },
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

/**
 * L'ora in cui comincia una serata.
 *
 * Un numero solo, in un posto solo. Non è confermato da Luca: quando darà
 * gli orari veri, per serata o per stagione, si cambia qui e cambia
 * dappertutto, biglietto compreso.
 */
export const ORARIO_INIZIO = { ora: 23, minuti: 30 } as const;

/** Il fuso in cui vive il locale. Il server sta a Greenwich, Luca no. */
const FUSO = "Europe/Rome";

const PEZZI = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  weekday: "short",
});

interface OraDiRoma {
  readonly anno: number;
  readonly mese: number;
  readonly giorno: number;
  readonly ore: number;
  readonly minuti: number;
  readonly secondi: number;
  /** 0 domenica, 6 sabato, come Date.getDay(). */
  readonly settimana: number;
}

const GIORNI = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Che ora è a Roma in questo istante. */
function aRoma(istante: Date): OraDiRoma {
  const p: Record<string, string> = {};
  for (const pezzo of PEZZI.formatToParts(istante)) {
    if (pezzo.type !== "literal") {
      p[pezzo.type] = pezzo.value;
    }
  }

  return {
    anno: Number(p["year"]),
    mese: Number(p["month"]),
    giorno: Number(p["day"]),
    ore: Number(p["hour"]) % 24,
    minuti: Number(p["minute"]),
    secondi: Number(p["second"]),
    settimana: GIORNI.indexOf(p["weekday"] ?? "Sun"),
  };
}

/** Di quanto Roma è avanti rispetto a Greenwich, in quell'istante. */
function scarto(istante: Date): number {
  const r = aRoma(istante);
  const comeSeFosseUtc = Date.UTC(r.anno, r.mese - 1, r.giorno, r.ore, r.minuti, r.secondi);
  return comeSeFosseUtc - Math.floor(istante.getTime() / 1000) * 1000;
}

/**
 * L'istante in cui comincia la prossima serata di quel giorno.
 *
 * Il calcolo è fatto sull'orologio di Roma, non su quello del computer che
 * lo esegue: su Vercel il server sta a Greenwich, e prendendo l'ora locale
 * le 23:30 sarebbero diventate l'una e mezza di notte.
 *
 * Lo scarto si misura due volte perché nelle due notti all'anno in cui
 * cambia l'ora la prima misura è quella sbagliata.
 */
export function prossimaSerata(giorno: number, adesso: Date = new Date()): Date {
  const ora = aRoma(adesso);
  const mancanti = (giorno - ora.settimana + 7) % 7;
  const passata =
    mancanti === 0 &&
    (ora.ore > ORARIO_INIZIO.ora ||
      (ora.ore === ORARIO_INIZIO.ora && ora.minuti >= ORARIO_INIZIO.minuti));

  const giorniAvanti = mancanti === 0 && passata ? 7 : mancanti;

  const comeSeFosseUtc = Date.UTC(
    ora.anno,
    ora.mese - 1,
    ora.giorno + giorniAvanti,
    ORARIO_INIZIO.ora,
    ORARIO_INIZIO.minuti,
  );

  const primaMisura = new Date(comeSeFosseUtc - scarto(adesso));
  return new Date(comeSeFosseUtc - scarto(primaMisura));
}

/** Il giorno della settimana di una serata, dal suo codice. */
export function giornoDellaSerata(codice: string): number {
  return SERATE.find((s) => s.codice === codice)?.giorno ?? 6;
}
