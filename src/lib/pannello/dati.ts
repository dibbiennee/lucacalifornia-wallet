/**
 * I dati del pannello.
 *
 * PUNTO UNICO DI INGRESSO. Le schermate non sanno da dove arrivano i dati:
 * chiamano queste funzioni e basta.
 *
 * Le richieste (richieste, richiesta, confermatiPerSerata, aggiornaStato,
 * creaRichiesta) sono vere, su Postgres: arrivano dal modulo del sito e le
 * vede Luca qui. Il resto (stasera oltre ai confermati, serate, squadra,
 * compleanni, ultimi ingressi, liste d'attesa) è ancora di esempio, in
 * memoria: le schermate lo dichiarano con "Dati di esempio".
 *
 * ATTENZIONE, finché quel resto è esempio: la memoria è quella dell'istanza
 * che risponde. Una modifica si vede finché quella resta calda, poi torna
 * indietro, e un'altra istanza non la vede proprio.
 */

import { db } from "@/lib/db";

export type StatoRichiesta = "nuova" | "confermata" | "in attesa" | "rifiutata";

export interface RichiestaPannello {
  readonly id: string;
  readonly nome: string;
  readonly telefono: string;
  readonly quando: string;
  /** Come si legge nelle schermate: "Sabato", "Domenica Bàilame". */
  readonly serata: string;
  /**
   * Il nome della serata, quello che va nel biglietto e nel messaggio:
   * "REGGAETON", non "SABATO". Senza, il messaggio diceva "sei dentro per
   * SABATO di sabato 27 settembre".
   */
  readonly nomeSerata: string;
  /** Per legare la richiesta alla serata senza confrontare stringhe scritte a mano. */
  readonly codiceSerata: string;
  readonly sala?: string;
  readonly tipo: "lista" | "tavolo" | "navetta";
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  /** Solo per la navetta: da dove parte. */
  readonly zona?: string;
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

/** Una riga della tabella "richieste", così come la scrive Postgres. */
interface RigaRichiesta {
  readonly id: string;
  readonly quando: Date;
  readonly nome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly nome_serata: string;
  readonly codice_serata: string;
  readonly sala: string | null;
  readonly tipo: string;
  readonly gruppo: string | null;
  readonly budget: string | null;
  readonly occasione: string | null;
  readonly zona: string | null;
  readonly messaggio: string | null;
  readonly provenienza: string;
  readonly stato: string;
  readonly note_private: string | null;
  readonly biglietto_inviato_alle: string | null;
}

/** L'ora di adesso come la scrivono le schermate: 18:42. */
function comeOra(quando: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(quando);
}

function daRiga(r: RigaRichiesta): RichiestaPannello {
  return {
    id: r.id,
    nome: r.nome,
    telefono: r.telefono,
    quando: comeOra(r.quando),
    serata: r.serata,
    nomeSerata: r.nome_serata,
    codiceSerata: r.codice_serata,
    tipo: r.tipo as RichiestaPannello["tipo"],
    provenienza: r.provenienza,
    stato: r.stato as StatoRichiesta,
    ...(r.sala === null ? {} : { sala: r.sala }),
    ...(r.gruppo === null ? {} : { gruppo: r.gruppo }),
    ...(r.budget === null ? {} : { budget: r.budget }),
    ...(r.occasione === null ? {} : { occasione: r.occasione }),
    ...(r.zona === null ? {} : { zona: r.zona }),
    ...(r.messaggio === null ? {} : { messaggio: r.messaggio }),
    ...(r.note_private === null ? {} : { notePrivate: r.note_private }),
    ...(r.biglietto_inviato_alle === null ? {} : { bigliettoInviatoAlle: r.biglietto_inviato_alle }),
  };
}

export interface NuovaRichiesta {
  readonly nome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly nomeSerata: string;
  readonly codiceSerata: string;
  readonly tipo: RichiestaPannello["tipo"];
  readonly provenienza: string;
  readonly sala?: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly zona?: string;
  readonly messaggio?: string;
}

/** Un id leggibile, che si vede anche nel link della singola richiesta. */
function nuovoId(nome: string): string {
  const base = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Scrive la richiesta vera sul database. La vede subito il pannello. */
export async function creaRichiesta(dati: NuovaRichiesta): Promise<RichiestaPannello> {
  const sql = await db();
  const id = nuovoId(dati.nome);

  await sql`
    INSERT INTO richieste (
      id, nome, telefono, serata, nome_serata, codice_serata, sala, tipo,
      gruppo, budget, occasione, zona, messaggio, provenienza, stato
    ) VALUES (
      ${id}, ${dati.nome}, ${dati.telefono}, ${dati.serata}, ${dati.nomeSerata},
      ${dati.codiceSerata}, ${dati.sala ?? null}, ${dati.tipo}, ${dati.gruppo ?? null},
      ${dati.budget ?? null}, ${dati.occasione ?? null}, ${dati.zona ?? null},
      ${dati.messaggio ?? null}, ${dati.provenienza}, 'nuova'
    )
  `;

  const creata = await richiesta(id);
  if (creata === undefined) {
    throw new Error("La richiesta appena scritta non si trova più");
  }
  return creata;
}

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
  { codice: "venerdi", nome: "Venerdì, Drip", etichetta: "Lista aperta" },
  { codice: "sabato", nome: "Sabato, International", etichetta: "Pochi tavoli" },
  { codice: "bailame", nome: "Domenica, Bàilame", etichetta: "Lista aperta" },
];

let SQUADRA: Pr[] = [
  {
    nome: "Lorenzo Fiorentino",
    prenotazioni: 18,
    liste: 12,
    tavoli: 6,
    provvigioni: 210,
    link: `lucacalifornia.satoshiweb.it/${nomeCorto("Lorenzo Fiorentino")}`,
  },
  {
    nome: "Alex Feletti",
    prenotazioni: 9,
    liste: 7,
    tavoli: 2,
    provvigioni: 95,
    link: `lucacalifornia.satoshiweb.it/${nomeCorto("Alex Feletti")}`,
  },
  {
    nome: "Alessio",
    prenotazioni: 6,
    liste: 4,
    tavoli: 2,
    provvigioni: 60,
    link: `lucacalifornia.satoshiweb.it/${nomeCorto("Alessio")}`,
  },
  {
    nome: "Sara Arciero",
    prenotazioni: 4,
    liste: 3,
    tavoli: 1,
    provvigioni: 40,
    link: `lucacalifornia.satoshiweb.it/${nomeCorto("Sara Arciero")}`,
  },
];

let ATTESA = { specialGuest: 128, capodanno: 64 };

/* ------------------------------ lettura ------------------------------ */

export async function stasera(): Promise<Stasera> {
  const confermati = await confermatiPerSerata("sabato");

  return {
    codice: "sabato",
    giorno: "Sabato 26 set",
    serata: "Sabato, International",
    inCorso: true,
    inLista: confermati.filter((r) => r.tipo === "lista").length,
    tavoli: confermati.filter((r) => r.tipo === "tavolo").length,
    entrati: 0,
    attesi: confermati.length,
    compleanniInArrivo: compleanni().length,
    attesaCapodanno: ATTESA.capodanno,
  };
}

export async function richieste(stato?: StatoRichiesta): Promise<readonly RichiestaPannello[]> {
  const sql = await db();
  const righe = (
    stato === undefined
      ? await sql`SELECT * FROM richieste ORDER BY creata_alle DESC`
      : await sql`SELECT * FROM richieste WHERE stato = ${stato} ORDER BY creata_alle DESC`
  ) as unknown as RigaRichiesta[];
  return righe.map(daRiga);
}

export async function richiesta(id: string): Promise<RichiestaPannello | undefined> {
  const sql = await db();
  const righe = (await sql`SELECT * FROM richieste WHERE id = ${id}`) as unknown as RigaRichiesta[];
  return righe[0] === undefined ? undefined : daRiga(righe[0]);
}

/**
 * Chi è confermato per una serata.
 *
 * Filtra solo sullo stato, non sulla data: lo stesso sabato torna ogni
 * settimana, e finché le serate passate non si archiviano questa vede
 * "confermata" per qualunque sabato sia stato.
 */
export async function confermatiPerSerata(codice: string): Promise<readonly RichiestaPannello[]> {
  const sql = await db();
  const righe = (await sql`
    SELECT * FROM richieste WHERE codice_serata = ${codice} AND stato = 'confermata'
    ORDER BY creata_alle DESC
  `) as unknown as RigaRichiesta[];
  return righe.map(daRiga);
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
      annoScorso: "Lista, domenica Bàilame",
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

export async function aggiornaStato(id: string, stato: StatoRichiesta): Promise<void> {
  const sql = await db();
  const bigliettoOra = stato === "confermata" ? comeOra(new Date()) : null;

  await sql`
    UPDATE richieste
    SET stato = ${stato}, biglietto_inviato_alle = COALESCE(${bigliettoOra}, biglietto_inviato_alle)
    WHERE id = ${id}
  `;
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
