/**
 * Tutti i testi del sito in un posto solo.
 *
 * I contenuti vengono dai mockup approvati in riferimenti-design/.
 * Dove Luca non ha ancora dato l'informazione, la frase è scritta in modo da
 * funzionare lo stesso: niente segnaposto a vista e niente dati inventati.
 * Un segnaposto a vista davanti a un cliente è peggio del buco che nasconde.
 */

export const MARCHIO = { riga1: "LUCA", riga2: "CALIFORNIA" } as const;

export const MOTTO = ["NON IMPORTA CHI TU SIA", "IMPORTA CHE TI", "SAPPIA DIVERTIRE"] as const;

export const INSTAGRAM = "lucacurella_ninfeo";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM}`;

/** Telefono di Luca, da confermare con lui prima di pubblicare davvero. */
export const WHATSAPP = "393348548735";

export const MENU = [
  { testo: "Serate", dove: "/serate" },
  { testo: "Navetta", dove: "/navetta" },
  { testo: "Capodanno", dove: "/capodanno" },
  { testo: "Funzioni", dove: "/funzioni" },
  { testo: "Diventa PR", dove: "/diventa-pr" },
  { testo: "Chi sono", dove: "/chi-sono" },
] as const;

export type Etichetta = "LISTA APERTA" | "POCHI TAVOLI" | "TUTTO PIENO";

export interface SerataSito {
  readonly codice: string;
  readonly giorno: string;
  readonly nome: string;
  readonly musica: string;
  readonly etichetta: Etichetta;
  readonly copertina: string;
  readonly descrizione: string;
  readonly quando: string;
}

/**
 * Le etichette qui sono fisse. Nel sito vero le cambia Luca dal pannello,
 * con un interruttore per serata.
 */
export const SERATE: readonly SerataSito[] = [
  {
    codice: "milkshake",
    giorno: "GIOVEDÌ",
    nome: "MILKSHAKE",
    musica: "AFRO E REGGAETON",
    etichetta: "LISTA APERTA",
    copertina: "/foto/copertine/milkshake.jpg",
    descrizione:
      "Il giovedì è Milkshake: afro e reggaeton tutta la sera. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "OGNI GIOVEDÌ",
  },
  {
    codice: "venerdi",
    giorno: "VENERDÌ",
    nome: "COMMERCIALE",
    musica: "E REGGAETON",
    etichetta: "LISTA APERTA",
    copertina: "/foto/copertine/venerdi.jpg",
    descrizione:
      "Il venerdì si balla commerciale e reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "OGNI VENERDÌ",
  },
  {
    codice: "sabato",
    giorno: "SABATO",
    nome: "DUE SALE",
    musica: "HOUSE E REGGAETON",
    etichetta: "POCHI TAVOLI",
    copertina: "/foto/copertine/sabato.jpg",
    descrizione:
      "Il sabato il Room 26 apre due sale: house nella prima, reggaeton nella seconda. Dimmi dove vuoi stare e ti sistemo io.",
    quando: "OGNI SABATO",
  },
  {
    codice: "bailame",
    giorno: "DOMENICA",
    nome: "BÁILAME",
    musica: "SOLO REGGAETON",
    etichetta: "LISTA APERTA",
    copertina: "/foto/copertine/bailame.jpg",
    descrizione:
      "La domenica si chiude la settimana con Báilame: tutta la sera solo reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "OGNI DOMENICA",
  },
];

export const LOCALE = { nome: "ROOM 26, ROMA" } as const;

export const COME_FUNZIONA = [
  {
    titolo: "SCEGLI LISTA O TAVOLO",
    testo: "Compili il form qui sotto in mezzo minuto.",
  },
  {
    titolo: "LUCA CONFERMA",
    testo: "Ti scrive su WhatsApp con disponibilità e prezzo.",
  },
  {
    titolo: "IL BIGLIETTO NEL TELEFONO",
    testo:
      "Lo aggiungi ad Apple Wallet o Google Wallet. All'ingresso mostri il QR, niente nomi da cercare in lista.",
  },
] as const;

export const NAVETTA = {
  occhiello: "TI PORTIAMO NOI",
  titolo: "SERVIZIO NAVETTA",
  testo:
    "Dalla tua zona al locale, e ritorno a fine serata. Niente macchina, niente parcheggio, nessuno che deve restare sobrio per guidare.",
  azione: "Chiedi la navetta",
} as const;

export const CAPODANNO = {
  occhiello: "31 DICEMBRE",
  titolo: "CAPODANNO",
  pacchetti: [
    { nome: "PACK 1", righe: ["SERATA"] },
    { nome: "PACK 2", righe: ["CENA", "+ SERATA"] },
    { nome: "PACK 3", righe: ["CENA", "SERATA", "HOTEL"] },
  ],
  azione: "METTIMI IN LISTA D'ATTESA",
} as const;

/*
 * Delle due sedi estive non c'è ancora una foto giusta: quella che c'era per
 * il Ninfeo era un ritratto di Luca al mare, che del locale non diceva
 * niente. Meglio nessuna foto che una foto sbagliata.
 */
export const ESTATE = {
  occhiello: "D'ESTATE",
  posti: [
    { nome: "NINFEO, ROMA", foto: null as string | null },
    { nome: "MORGAN BEACH CLUB", foto: null },
  ],
} as const;

export const DIVENTA_PR = {
  occhiello: "APERTE LE CANDIDATURE",
  titolo: ["PER LA FIGURA DI", "PR"],
  testo: "Formazione con me in due giorni: teoria e pratica dentro il locale.",
  azione: "CANDIDATI",
} as const;

export const SPECIAL_GUEST = {
  titolo: "SPECIAL GUEST IN ARRIVO",
  testo: "Sii il primo a saperlo.",
  azione: "AVVISAMI",
} as const;
