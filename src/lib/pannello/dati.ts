/**
 * I dati del pannello.
 *
 * PUNTO UNICO DI INGRESSO. Le schermate non sanno da dove arrivano i dati:
 * chiamano queste funzioni e basta. Oggi restituiscono esempi, domani
 * interrogano Supabase, e le schermate non cambiano di una riga.
 *
 * Lo stesso vale per le funzioni che scrivono (aggiornaStato, impostaEtichetta,
 * aggiungiPr...): oggi cambiano gli esempi qui in memoria, domani scrivono sul
 * database. Chi le chiama non se ne accorge.
 *
 * ATTENZIONE, finché sono esempi: la memoria è quella dell'istanza che risponde.
 * Una modifica si vede finché quella resta calda, poi torna indietro, e un'altra
 * istanza non la vede proprio. Le schermate lo dichiarano, invece di far credere
 * il contrario.
 */

export type StatoRichiesta = "nuova" | "confermata" | "in attesa" | "rifiutata";

export interface RichiestaPannello {
  readonly id: string;
  readonly nome: string;
  readonly telefono: string;
  readonly quando: string;
  /** Come si legge nelle schermate: "Sabato", "Domenica Báilame". */
  readonly serata: string;
  /**
   * Il nome della serata, quello che va nel biglietto e nel messaggio:
   * "DUE SALE", non "SABATO". Senza, il messaggio diceva "sei dentro per
   * SABATO di sabato 27 settembre".
   */
  readonly nomeSerata: string;
  /** Per legare la richiesta alla serata senza confrontare stringhe scritte a mano. */
  readonly codiceSerata: string;
  readonly sala?: string;
  readonly tipo: "lista" | "tavolo";
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly messaggio?: string;
  /*
   * Da dove è arrivata la richiesta. Nel pannello non si mostra più da
   * nessuna parte: Edoardo l'ha tolta perché in mezzo alle altre
   * informazioni faceva rumore. Il dato resta perché il conteggio per
   * canale è una funzione promessa, e quando tornerà si leggerà da qui.
   */
  readonly provenienza: string;
  readonly stato: StatoRichiesta;
  readonly notePrivate?: string;
  readonly bigliettoInviatoAlle?: string;
}

/*
 * Mutabile, perché le funzioni di scrittura devono poter cambiare qualcosa.
 * Con il database questa lista sparisce e restano solo le funzioni.
 */
let RICHIESTE: RichiestaPannello[] = [
  {
    id: "giulia-marchetti",
    nome: "Giulia Marchetti",
    telefono: "340 000 0000",
    quando: "18:42",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 2",
    tipo: "tavolo",
    gruppo: "Misto",
    budget: "35–50 €",
    occasione: "Compleanno",
    messaggio: "Siamo un bel gruppo, vorremmo la torta al tavolo verso l'una.",
    provenienza: "Storie Instagram",
    stato: "nuova",
    notePrivate: "Già venuta a giugno con 8 persone, tavolo pagato senza problemi.",
  },
  {
    id: "marco-fanelli",
    nome: "Marco Fanelli",
    telefono: "340 000 0001",
    quando: "18:10",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 1",
    tipo: "tavolo",
    gruppo: "Solo ragazzi",
    budget: "25–30 €",
    provenienza: "Link di Marco",
    stato: "nuova",
  },
  {
    id: "sara-conti",
    nome: "Sara Conti",
    telefono: "340 000 0002",
    quando: "17:55",
    serata: "Domenica Báilame",
    nomeSerata: "BÁILAME",
    codiceSerata: "bailame",
    tipo: "lista",
    provenienza: "Bio Instagram",
    stato: "nuova",
  },
  {
    id: "federico-nardi",
    nome: "Federico Nardi",
    telefono: "340 000 0003",
    quando: "16:30",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 1",
    tipo: "tavolo",
    gruppo: "Misto",
    budget: "Oltre 50 €",
    provenienza: "Storie Instagram",
    stato: "confermata",
    bigliettoInviatoAlle: "17:20",
  },
  {
    id: "elisa-rinaldi",
    nome: "Elisa Rinaldi",
    telefono: "340 000 0004",
    quando: "15:10",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 2",
    tipo: "lista",
    provenienza: "Google",
    stato: "confermata",
    bigliettoInviatoAlle: "15:40",
  },
  {
    id: "chiara-bianchi",
    nome: "Chiara Bianchi",
    telefono: "340 000 0005",
    quando: "14:20",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 2",
    tipo: "tavolo",
    gruppo: "Solo ragazze",
    budget: "35–50 €",
    occasione: "Laurea",
    provenienza: "Bio Instagram",
    stato: "confermata",
    bigliettoInviatoAlle: "14:50",
  },
  {
    id: "luca-ferri",
    nome: "Luca Ferri",
    telefono: "340 000 0006",
    quando: "13:05",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 1",
    tipo: "lista",
    provenienza: "Diretto",
    stato: "confermata",
    bigliettoInviatoAlle: "13:40",
  },
  {
    id: "matteo-conti",
    nome: "Matteo Conti",
    telefono: "340 000 0007",
    quando: "12:30",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 2",
    tipo: "lista",
    provenienza: "TikTok",
    stato: "confermata",
    bigliettoInviatoAlle: "12:45",
  },
  {
    id: "alessia-romano",
    nome: "Alessia Romano",
    telefono: "340 000 0008",
    quando: "11:15",
    serata: "Sabato",
    nomeSerata: "DUE SALE",
    codiceSerata: "sabato",
    sala: "Sala 1",
    tipo: "lista",
    provenienza: "Storie Instagram",
    stato: "confermata",
    bigliettoInviatoAlle: "11:30",
  },
];

export interface Stasera {
  readonly codice: string;
  readonly giorno: string;
  readonly serata: string;
  readonly inCorso: boolean;
  readonly inLista: number;
  readonly tavoli: number;
  readonly entrati: number;
  readonly attesi: number;
  readonly compleanniInArrivo: number;
  readonly attesaCapodanno: number;
}

export type EtichettaSerata = "Lista aperta" | "Pochi tavoli" | "Tutto pieno";

export interface SerataPannello {
  readonly codice: string;
  readonly nome: string;
  readonly etichetta: EtichettaSerata;
}

export interface Pr {
  readonly nome: string;
  readonly prenotazioni: number;
  readonly liste: number;
  readonly tavoli: number;
  readonly provvigioni: number;
  readonly link: string;
}

export interface Compleanno {
  readonly nome: string;
  readonly fra: string;
  readonly annoScorso: string;
  readonly telefono: string;
}

export interface Ingresso {
  readonly nome: string;
  readonly ora: string;
  readonly giaEntrato: boolean;
}

/** Vero finché i dati sono di esempio: le schermate lo dichiarano a schermo. */
export const DATI_DI_ESEMPIO = true;

let SERATE_PANNELLO: SerataPannello[] = [
  { codice: "milkshake", nome: "Giovedì, Milkshake", etichetta: "Lista aperta" },
  { codice: "venerdi", nome: "Venerdì", etichetta: "Lista aperta" },
  { codice: "sabato", nome: "Sabato, due sale", etichetta: "Pochi tavoli" },
  { codice: "bailame", nome: "Domenica, Báilame", etichetta: "Lista aperta" },
];

let SQUADRA: Pr[] = [
  { nome: "Marco", prenotazioni: 18, liste: 12, tavoli: 6, provvigioni: 210, link: "lucacalifornia.satoshiweb.it/marco" },
  { nome: "Sara", prenotazioni: 9, liste: 7, tavoli: 2, provvigioni: 95, link: "lucacalifornia.satoshiweb.it/sara" },
  { nome: "Davide", prenotazioni: 4, liste: 3, tavoli: 1, provvigioni: 40, link: "lucacalifornia.satoshiweb.it/davide" },
];

let ATTESA = { specialGuest: 128, capodanno: 64 };

/* ------------------------------ lettura ------------------------------ */

export function stasera(): Stasera {
  const confermati = confermatiPerSerata("sabato");

  return {
    codice: "sabato",
    giorno: "Sabato 26 set",
    serata: "Sabato, due sale",
    inCorso: true,
    inLista: confermati.filter((r) => r.tipo === "lista").length,
    tavoli: confermati.filter((r) => r.tipo === "tavolo").length,
    entrati: 0,
    attesi: confermati.length,
    compleanniInArrivo: compleanni().length,
    attesaCapodanno: ATTESA.capodanno,
  };
}

export function richieste(stato?: StatoRichiesta): readonly RichiestaPannello[] {
  return stato === undefined ? RICHIESTE : RICHIESTE.filter((r) => r.stato === stato);
}

export function richiesta(id: string): RichiestaPannello | undefined {
  return RICHIESTE.find((r) => r.id === id);
}

/**
 * Chi è confermato per una serata.
 *
 * Con il database filtrerà anche sulla data, perché lo stesso sabato torna
 * ogni settimana; adesso gli esempi vivono in una settimana sola.
 */
export function confermatiPerSerata(codice: string): readonly RichiestaPannello[] {
  return RICHIESTE.filter((r) => r.codiceSerata === codice && r.stato === "confermata");
}

export function serate(): readonly SerataPannello[] {
  return SERATE_PANNELLO;
}

export function listeDiAttesa(): { readonly specialGuest: number; readonly capodanno: number } {
  return ATTESA;
}

export function squadra(): readonly Pr[] {
  return SQUADRA;
}

export function compleanni(): readonly Compleanno[] {
  return [
    {
      nome: "Giulia Marchetti",
      fra: "tra 3 settimane",
      annoScorso: "Tavolo misto, 8 persone, sala 2",
      telefono: "393400000000",
    },
    {
      nome: "Andrea Testa",
      fra: "tra 5 settimane",
      annoScorso: "Lista, domenica Báilame",
      telefono: "393400000005",
    },
  ];
}

export function ultimiIngressi(): readonly Ingresso[] {
  return [
    { nome: "Elisa Rinaldi", ora: "00:42", giaEntrato: false },
    { nome: "Giulia Marchetti", ora: "00:39", giaEntrato: false },
    { nome: "Marco Fanelli", ora: "00:35", giaEntrato: true },
  ];
}

/* ------------------------------ scrittura ------------------------------ */

/** L'ora di adesso come la scrivono le schermate: 18:42. */
function adesso(): string {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export function aggiornaStato(id: string, stato: StatoRichiesta): void {
  RICHIESTE = RICHIESTE.map((r) =>
    r.id === id
      ? {
          ...r,
          stato,
          ...(stato === "confermata" ? { bigliettoInviatoAlle: adesso() } : {}),
        }
      : r,
  );
}

export function impostaEtichetta(codice: string, etichetta: EtichettaSerata): void {
  SERATE_PANNELLO = SERATE_PANNELLO.map((s) => (s.codice === codice ? { ...s, etichetta } : s));
}

/** Quando ci sarà il database, da qui partirà l'avviso a chi è in attesa. */
export function aggiungiOspite(_nome: string): number {
  return ATTESA.specialGuest;
}

export function pubblicaPacchetti(): number {
  return ATTESA.capodanno;
}

/** Da "Gian Marco" a "gianmarco": è quello che finisce nel suo link. */
export function nomeCorto(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function aggiungiPr(nome: string): Pr {
  const pr: Pr = {
    nome,
    prenotazioni: 0,
    liste: 0,
    tavoli: 0,
    provvigioni: 0,
    link: `lucacalifornia.satoshiweb.it/${nomeCorto(nome)}`,
  };

  SQUADRA = [...SQUADRA, pr];
  return pr;
}
