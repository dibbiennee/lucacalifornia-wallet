/**
 * Tutti i testi del sito in un posto solo.
 *
 * I contenuti vengono dai mockup approvati in riferimenti-design/.
 * Dove Luca non ha ancora dato l'informazione, la frase è scritta in modo da
 * funzionare lo stesso: niente segnaposto a vista e niente dati inventati.
 * Un segnaposto a vista davanti a un cliente è peggio del buco che nasconde.
 */

/*
 * Il nome della serata della domenica si scrive "Bàilame", con l'accento.
 * È come sta scritto nel logo della serata, quello che si vede nelle foto
 * dentro al locale, ed è anche come si scrive in spagnolo.
 *
 * Senza accento restano solo l'indirizzo della pagina (/serate/bailame) e i
 * nomi dei file: lì un accento crea solo problemi.
 */

export const MARCHIO = { riga1: "LUCA", riga2: "CALIFORNIA" } as const;

export const MOTTO = ["NON IMPORTA CHI TU SIA", "IMPORTA CHE TI SAPPIA DIVERTIRE"] as const;

export const INSTAGRAM = "lucacurella_ninfeo";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM}`;

/** Telefono di Luca, da confermare con lui prima di pubblicare davvero. */
export const WHATSAPP = "393348548735";

export const MENU = [
  { testo: "Tavoli", dove: "/tavoli" },
  { testo: "Navetta", dove: "/navetta" },
  { testo: "Capodanno", dove: "/capodanno" },
  { testo: "Diventa PR", dove: "/diventa-pr" },
  { testo: "Chi sono", dove: "/chi-sono" },
] as const;

export type Etichetta = "Disponibilità limitata" | "Pochi tavoli" | "Tutto pieno";

export interface SerataSito {
  readonly codice: string;
  readonly giorno: string;
  /** Il giorno in tre lettere, per la striscia della settimana. */
  readonly breve: string;
  readonly nome: string;
  readonly musica: string;
  /** Il genere per esteso, quando serve una riga sola che spiega. */
  readonly genere: string;
  readonly etichetta: Etichetta;
  readonly copertina: string;
  /** Cosa si vede nella foto: serve a chi non la vede. */
  readonly alt: string;
  /** Il colore della serata, come nome del token: milk, acid, cyan, red. */
  readonly colore: string;
  /** Come si chiama la serata dentro il modulo. */
  readonly descrizione: string;
  readonly quando: string;
  /** Il marchio della serata, per il badge nella riga sottile in home. Non tutte ce l'hanno ancora. */
  readonly badge?: string;
  /**
   * Dove inquadrare il badge: la riga è bassa e larga, quindi "cover" ne
   * mostra solo una fetta orizzontale. Il numero dice quale, in percentuale
   * dall'alto dell'immagine intera. Senza, il logo può cadere a metà o
   * uscire dalla fetta visibile.
   */
  readonly badgePosizione?: string;
  /**
   * Dove inquadrare la copertina intera nella pagina della serata: la foto
   * è quasi quadrata ma il riquadro no, e "cover" da solo può tagliare una
   * scritta vicina al bordo. Senza, l'inquadratura resta centrata.
   */
  readonly copertinaPosizione?: string;
}

/**
 * Le etichette qui sono fisse. Nel sito vero le cambia Luca dal pannello,
 * con un interruttore per serata.
 */
export const SERATE: readonly SerataSito[] = [
  {
    codice: "milkshake",
    giorno: "Giovedì",
    breve: "Gio",
    nome: "Milkshake",
    musica: "Afro e reggaeton",
    genere: "Afro e reggaeton",
    colore: "milk",
    alt: "La grafica Milkshake, con il bicchiere e il logo",
    etichetta: "Disponibilità limitata",
    copertina: "/foto/serate/milkshake-quadrato.jpg",
    badge: "/foto/serate/milkshake-badge.jpg",
    badgePosizione: "center",
    descrizione:
      "Il giovedì è Milkshake: afro e reggaeton tutta la sera. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "Ogni giovedì",
  },
  {
    codice: "venerdi",
    giorno: "Venerdì",
    breve: "Ven",
    nome: "Drip",
    musica: "Commerciale e reggaeton",
    genere: "Commerciale e reggaeton",
    colore: "acid",
    alt: "Il volantino Drip del venerdì, con gli occhiali a specchio",
    etichetta: "Disponibilità limitata",
    copertina: "/foto/serate/venerdi.jpg",
    badge: "/foto/serate/venerdi-riga.jpg",
    badgePosizione: "center",
    descrizione:
      "Il venerdì si balla commerciale e reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "Ogni venerdì",
  },
  {
    codice: "sabato",
    giorno: "Sabato",
    breve: "Sab",
    nome: "International",
    musica: "Commerciale, reggaeton e house",
    genere: "Commerciale, reggaeton e house",
    colore: "cyan",
    alt: "Il volantino del sabato, con due ballerine e il logo ROOM26",
    etichetta: "Pochi tavoli",
    copertina: "/foto/serate/sabato.jpg",
    copertinaPosizione: "center top",
    badge: "/foto/serate/sabato-riga.jpg",
    badgePosizione: "center",
    descrizione:
      "Il sabato si balla soprattutto commerciale e reggaeton, con un po' di house. Dimmi che formato musicale ti piace e ti sistemo io.",
    quando: "Ogni sabato",
  },
  {
    codice: "bailame",
    giorno: "Domenica",
    breve: "Dom",
    nome: "Bàilame",
    musica: "Solo reggaeton",
    genere: "Solo reggaeton",
    colore: "red",
    alt: "La grafica Bàilame, con l'orsetto in giacca bianca",
    etichetta: "Disponibilità limitata",
    copertina: "/foto/serate/bailame-quadrato.jpg",
    badge: "/foto/serate/bailame-badge.jpg",
    badgePosizione: "center",
    descrizione:
      "La domenica si chiude la settimana con Bàilame: tutta la sera solo reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    quando: "Ogni domenica",
  },
];

export const LOCALE = {
  nome: "ROOM26, ROMA",
  indirizzo: "Piazza Guglielmo Marconi 31, Roma",
} as const;

export const COME_FUNZIONA = [
  {
    titolo: "SCEGLI LA TUA SERATA",
    testo: "Prenota dal sito in 20 secondi.",
  },
  {
    titolo: "ATTENDI LA MIA CONFERMA",
    testo: "Ti scriverò su WhatsApp per la conferma.",
  },
  {
    titolo: "GODITI LA TUA SERATA",
    testo: "Verrai seguito dall'inizio alla fine.",
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

export const DIVENTA_PR = {
  occhiello: "APERTE LE CANDIDATURE",
  titolo: ["PER LA FIGURA DI", "PR"],
  testo: "Formazione con me in due giorni: teoria e pratica dentro il locale.",
  azione: "CANDIDATI",
} as const;

export const SPECIAL_GUEST = {
  titolo: "SPECIAL GUEST IN ARRIVO",
  testo: "Sii il primo a saperlo.",
  azione: "AVVISAMI",
} as const;

export const HALLOWEEN = {
  titolo: "HALLOWEEN IN ARRIVO",
  testo: "Sii il primo a saperlo.",
  azione: "AVVISAMI",
} as const;
