/**
 * I dati del pannello.
 *
 * PUNTO UNICO DI INGRESSO. Le schermate non sanno da dove arrivano i dati:
 * chiamano queste funzioni e basta. Oggi restituiscono esempi, domani
 * interrogano Supabase, e le schermate non cambiano di una riga.
 *
 * Gli esempi sono quelli dei mockup approvati, che dichiarano loro stessi
 * "i dati nelle schermate del pannello sono di esempio". Tenerli qui, tutti
 * insieme e dichiarati, è diverso dal seminarli dentro le pagine.
 */

export type StatoRichiesta = "nuova" | "confermata" | "in attesa" | "rifiutata";

export interface RichiestaPannello {
  readonly id: string;
  readonly nome: string;
  readonly telefono: string;
  readonly quando: string;
  readonly serata: string;
  readonly sala?: string;
  readonly tipo: "lista" | "tavolo";
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly messaggio?: string;
  readonly provenienza: string;
  readonly stato: StatoRichiesta;
  readonly notePrivate?: string;
  readonly bigliettoInviatoAlle?: string;
}

const RICHIESTE: readonly RichiestaPannello[] = [
  {
    id: "giulia-marchetti",
    nome: "Giulia Marchetti",
    telefono: "340 000 0000",
    quando: "18:42",
    serata: "Sabato",
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
    sala: "Sala 1",
    tipo: "tavolo",
    gruppo: "Solo ragazzi",
    budget: "25–30 €",
    provenienza: "Link di Marco PR",
    stato: "nuova",
  },
  {
    id: "sara-conti",
    nome: "Sara Conti",
    telefono: "340 000 0002",
    quando: "17:55",
    serata: "Domenica Báilame",
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
    sala: "Sala 2",
    tipo: "lista",
    provenienza: "Google",
    stato: "confermata",
    bigliettoInviatoAlle: "15:40",
  },
];

export interface Stasera {
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

export interface Provenienza {
  readonly nome: string;
  readonly quota: number;
}

export interface Ingresso {
  readonly nome: string;
  readonly ora: string;
  readonly giaEntrato: boolean;
}

/** Vero finché i dati sono di esempio: le schermate lo dichiarano a schermo. */
export const DATI_DI_ESEMPIO = true;

export function stasera(): Stasera {
  return {
    giorno: "Sabato 26 set",
    serata: "Sabato, due sale",
    inCorso: true,
    inLista: 42,
    tavoli: 7,
    entrati: 0,
    attesi: 49,
    compleanniInArrivo: 2,
    attesaCapodanno: 64,
  };
}

export function richieste(stato?: StatoRichiesta): readonly RichiestaPannello[] {
  return stato === undefined ? RICHIESTE : RICHIESTE.filter((r) => r.stato === stato);
}

export function richiesta(id: string): RichiestaPannello | undefined {
  return RICHIESTE.find((r) => r.id === id);
}

export function serate(): readonly SerataPannello[] {
  return [
    { codice: "milkshake", nome: "Giovedì, Milkshake", etichetta: "Lista aperta" },
    { codice: "venerdi", nome: "Venerdì", etichetta: "Lista aperta" },
    { codice: "sabato", nome: "Sabato, due sale", etichetta: "Pochi tavoli" },
    { codice: "bailame", nome: "Domenica, Báilame", etichetta: "Lista aperta" },
  ];
}

export function listeDiAttesa(): { readonly specialGuest: number; readonly capodanno: number } {
  return { specialGuest: 128, capodanno: 64 };
}

export function squadra(): readonly Pr[] {
  return [
    { nome: "Marco", prenotazioni: 18, liste: 12, tavoli: 6, provvigioni: 210, link: "lucacalifornia.satoshiweb.it/marco" },
    { nome: "Sara", prenotazioni: 9, liste: 7, tavoli: 2, provvigioni: 95, link: "lucacalifornia.satoshiweb.it/sara" },
    { nome: "Davide", prenotazioni: 4, liste: 3, tavoli: 1, provvigioni: 40, link: "lucacalifornia.satoshiweb.it/davide" },
  ];
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

export function provenienze(): readonly Provenienza[] {
  return [
    { nome: "Storie Instagram", quota: 58 },
    { nome: "Bio Instagram", quota: 21 },
    { nome: "Link dei PR", quota: 14 },
    { nome: "Google e altro", quota: 7 },
  ];
}

export function ultimiIngressi(): readonly Ingresso[] {
  return [
    { nome: "Elisa Rinaldi", ora: "00:42", giaEntrato: false },
    { nome: "Giulia Marchetti", ora: "00:39", giaEntrato: false },
    { nome: "Marco Fanelli", ora: "00:35", giaEntrato: true },
  ];
}
