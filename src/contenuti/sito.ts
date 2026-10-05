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
 * Senza accento restano solo l'indirizzo della pagina (/serate/domenica, che
 * è il giorno) e i nomi dei file: lì un accento crea solo problemi.
 */

export const MARCHIO = { riga1: "LUCA", riga2: "CALIFORNIA" } as const;

export const MOTTO = ["NON IMPORTA CHI TU SIA", "IMPORTA CHE TI SAPPIA DIVERTIRE"] as const;

export const INSTAGRAM = "lucacurella_ninfeo";
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM}`;

/** Telefono di Luca, da confermare con lui prima di pubblicare davvero. */
export const WHATSAPP = "393348548735";

/** I due contatti della pagina Contatti: mail e telefono, niente altro. */
export const CONTATTI = {
  email: "luca.curella91@gmail.com",
  /** Come si legge a video. */
  telefono: "+39 334 854 8735",
  /** Come lo vuole il link tel: (senza spazi). */
  telefonoLink: "+393348548735",
} as const;

/** Il link che apre WhatsApp con un messaggio già scritto. Il numero è uno solo, quello qui sopra. */
export function linkWhatsapp(messaggio: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(messaggio)}`;
}

/** I messaggi già scritti: stessi sulla pagina della navetta e nel chatbot. */
export const MESSAGGI_WHATSAPP = {
  navetta: "Ciao Luca, vorrei avere informazioni sulla navetta per il ROOM26. Vorrei sapere disponibilità, orari e costo.",
  generico: "Ciao Luca, ho visto il sito e vorrei avere qualche informazione.",
} as const;

export const MENU = [
  { testo: "Serate", dove: "/serate" },
  { testo: "Tavoli", dove: "/tavoli" },
  { testo: "Navetta", dove: "/navetta" },
  { testo: "Capodanno", dove: "/capodanno" },
  { testo: "Diventa PR", dove: "/diventa-pr" },
  { testo: "Chi sono", dove: "/chi-sono" },
  { testo: "Contatti", dove: "/contatti" },
] as const;

export type Etichetta = "Disponibilità limitata" | "Pochi tavoli" | "Tutto pieno";

export interface SerataSito {
  readonly codice: string;
  /** Ultima parte dell'indirizzo della pagina: è il giorno, non il nome del format. */
  readonly slug: string;
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
  /** La frase in cima alla pagina e nell'anteprima di Google: giorno, città, locale, come prenotare. */
  readonly presentazione: string;
  /** Cosa si balla quel giorno e in cosa si distingue dagli altri: solo il genere, nessun'altra caratteristica. */
  readonly musicaTesto: string;
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
    slug: "giovedi",
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
    presentazione:
      "Giovedì sera a Roma, all'EUR: Milkshake al ROOM26, con afro e reggaeton. Prenota con me un tavolo, il bracciale VIP o la lista.",
    musicaTesto:
      "Il giovedì al ROOM26 è Milkshake: afro e reggaeton. È l'unica serata della settimana con l'afro.",
    quando: "Ogni giovedì",
  },
  {
    codice: "venerdi",
    slug: "venerdi",
    giorno: "Venerdì",
    breve: "Ven",
    nome: "Drip",
    musica: "Commerciale e reggaeton",
    genere: "Commerciale e reggaeton",
    colore: "acid",
    alt: "Il volantino Drip del venerdì, con gli occhiali a specchio",
    etichetta: "Disponibilità limitata",
    copertina: "/foto/serate/venerdi.jpg",
    badge: "/foto/serate/venerdi-riga-6.jpg",
    badgePosizione: "center",
    descrizione:
      "Il venerdì si balla commerciale e reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    presentazione:
      "Venerdì sera a Roma, all'EUR: Drip al ROOM26, con commerciale e reggaeton. Prenota con me un tavolo, il bracciale VIP o la lista.",
    musicaTesto:
      "Il venerdì al ROOM26 è Drip: commerciale e reggaeton, senza house.",
    quando: "Ogni venerdì",
  },
  {
    codice: "sabato",
    slug: "sabato",
    giorno: "Sabato",
    breve: "Sab",
    nome: "International",
    musica: "Reggaeton, commerciale e house",
    genere: "Reggaeton, commerciale e house",
    colore: "cyan",
    alt: "Il volantino del sabato, con due ballerine e il logo ROOM26",
    etichetta: "Pochi tavoli",
    copertina: "/foto/serate/sabato.jpg",
    copertinaPosizione: "center top",
    badge: "/foto/serate/sabato-riga.jpg",
    badgePosizione: "center",
    descrizione:
      "Il sabato è International: reggaeton, commerciale e house. Dimmi che formato musicale ti piace e ti sistemo io.",
    presentazione:
      "Sabato sera a Roma, all'EUR: International al ROOM26, con reggaeton, commerciale e house. Prenota con me un tavolo, il bracciale VIP o la lista.",
    musicaTesto:
      "Il sabato al ROOM26 è International: reggaeton, commerciale e house. È l'unica serata della settimana con la house.",
    quando: "Ogni sabato",
  },
  {
    codice: "bailame",
    slug: "domenica",
    giorno: "Domenica",
    breve: "Dom",
    nome: "Bàilame",
    musica: "Reggaeton",
    genere: "Reggaeton",
    colore: "red",
    alt: "La grafica Bàilame, con l'orsetto in giacca bianca",
    etichetta: "Disponibilità limitata",
    copertina: "/foto/serate/bailame-quadrato.jpg",
    badge: "/foto/serate/bailame-badge.jpg",
    badgePosizione: "center",
    descrizione:
      "La domenica si chiude la settimana con Bàilame: tutta la sera reggaeton. Prenota qui e ti ricontatto io con disponibilità e prezzo.",
    presentazione:
      "Domenica sera a Roma, all'EUR: Bàilame al ROOM26, tutto reggaeton. Prenota con me un tavolo, il bracciale VIP o la lista.",
    musicaTesto:
      "La domenica al ROOM26 è Bàilame: tutto reggaeton. Gli altri giorni la musica cambia, qui resta una sola.",
    quando: "Ogni domenica",
  },
];

/** Indirizzo della pagina di una serata. */
export function percorsoSerata(serata: Pick<SerataSito, "slug">): string {
  return `/serate/${serata.slug}`;
}

export const LOCALE = {
  nome: "ROOM26, ROMA",
  indirizzo: "Piazza Guglielmo Marconi 31, Roma",
  /** Dove cade lo spillo sulla mappa (OpenStreetMap). */
  lat: 41.8343033,
  lon: 12.4703946,
} as const;

/** Apre la mappa del locale (Google Maps, funziona su ogni telefono e sul computer). */
export function linkMappaLocale(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${LOCALE.nome}, ${LOCALE.indirizzo}`)}`;
}

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
