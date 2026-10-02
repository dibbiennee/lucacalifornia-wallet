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
  /** L'ora in cui è arrivata, a Roma: "20:04". */
  readonly quando: string;
  /** Il momento esatto in cui è arrivata (ISO), per dire "oggi", "ieri" o la data. */
  readonly creataIso: string;
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
  /** AAAA-MM-GG: manca solo nelle richieste di prima che il modulo facesse scegliere una data vera. */
  readonly dataSerata?: string;
  readonly sala?: string;
  readonly tipo: "tavolo" | "braccialetto" | "lista" | "navetta";
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly persone?: string;
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
  /* Il nome vero della colonna: prima qui c'era "quando", che non esiste, e
     ogni richiesta mostrava l'ora di adesso invece della sua. */
  readonly creata_alle: Date | string;
  readonly nome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly nome_serata: string;
  readonly codice_serata: string;
  /* Il driver può restituire un DATE come testo o come Date: comeGiorno() li accetta entrambi. */
  readonly data_serata: Date | string | null;
  readonly sala: string | null;
  readonly tipo: string;
  readonly gruppo: string | null;
  readonly budget: string | null;
  readonly occasione: string | null;
  readonly persone: string | null;
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

/** "2026-12-12", sia che il driver abbia dato il testo sia che abbia dato una Date. */
function comeGiorno(valore: Date | string): string {
  if (typeof valore === "string") {
    return valore.slice(0, 10);
  }
  const mese = String(valore.getMonth() + 1).padStart(2, "0");
  const giorno = String(valore.getDate()).padStart(2, "0");
  return `${valore.getFullYear()}-${mese}-${giorno}`;
}

function daRiga(r: RigaRichiesta): RichiestaPannello {
  const creata = new Date(r.creata_alle);

  return {
    id: r.id,
    nome: r.nome,
    telefono: r.telefono,
    quando: comeOra(creata),
    creataIso: creata.toISOString(),
    serata: r.serata,
    nomeSerata: r.nome_serata,
    codiceSerata: r.codice_serata,
    tipo: r.tipo as RichiestaPannello["tipo"],
    provenienza: r.provenienza,
    stato: r.stato as StatoRichiesta,
    ...(r.data_serata === null ? {} : { dataSerata: comeGiorno(r.data_serata) }),
    ...(r.sala === null ? {} : { sala: r.sala }),
    ...(r.gruppo === null ? {} : { gruppo: r.gruppo }),
    ...(r.budget === null ? {} : { budget: r.budget }),
    ...(r.occasione === null ? {} : { occasione: r.occasione }),
    ...(r.persone === null ? {} : { persone: r.persone }),
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
  /** AAAA-MM-GG: la data vera scelta nel modulo. La navetta non la chiede. */
  readonly dataSerata?: string;
  readonly tipo: RichiestaPannello["tipo"];
  readonly provenienza: string;
  readonly sala?: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly persone?: string;
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
      id, nome, telefono, serata, nome_serata, codice_serata, data_serata, sala, tipo,
      gruppo, budget, occasione, persone, zona, messaggio, provenienza, stato
    ) VALUES (
      ${id}, ${dati.nome}, ${dati.telefono}, ${dati.serata}, ${dati.nomeSerata},
      ${dati.codiceSerata}, ${dati.dataSerata ?? null}, ${dati.sala ?? null}, ${dati.tipo}, ${dati.gruppo ?? null},
      ${dati.budget ?? null}, ${dati.occasione ?? null}, ${dati.persone ?? null}, ${dati.zona ?? null},
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

export interface Pr {
  readonly nome: string;
  readonly codice: string;
  readonly link: string;
  /** Richieste confermate portate da questo PR, in tutto e per tipo. */
  readonly confermate: number;
  readonly tavoli: number;
  readonly liste: number;
  readonly braccialetti: number;
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

/** "2026-10-01": il giorno di oggi all'ora di Roma, per non confondere "stasera" con un sabato di marzo. */
function oggiARoma(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" }).format(new Date());
}

/**
 * Chi è confermato per una serata.
 *
 * Filtra sullo stato e sulla data: con il modulo che fa scegliere una data
 * vera, lo stesso "sabato" può essere oggi o fra sei mesi, e "stasera" deve
 * vedere solo chi ha prenotato per oggi. Le richieste di prima che il
 * modulo chiedesse la data (data_serata vuota) restano visibili com'erano:
 * il vecchio comportamento, non sparisce nulla di già confermato.
 */
export async function confermatiPerSerata(codice: string): Promise<readonly RichiestaPannello[]> {
  const sql = await db();
  const oggi = oggiARoma();
  const righe = (await sql`
    SELECT * FROM richieste
    WHERE codice_serata = ${codice} AND stato = 'confermata'
      AND (data_serata IS NULL OR data_serata = ${oggi})
    ORDER BY creata_alle DESC
  `) as unknown as RigaRichiesta[];
  return righe.map(daRiga);
}

interface RigaPr {
  readonly codice: string;
  readonly nome: string;
}

interface RigaConteggio {
  readonly provenienza: string;
  readonly tipo: string;
  readonly conteggio: number;
}

/**
 * I PR, con le richieste vere che hanno portato: niente più numeri finti.
 *
 * Il collegamento è "provenienza = 'Link di {nome}'", la stessa stringa che
 * nomeProvenienza() scrive su ogni richiesta arrivata dal link di quel PR:
 * non serve una colonna in più, il dato per aggregare c'è già.
 */
export async function squadra(): Promise<readonly Pr[]> {
  const sql = await db();

  const pr = (await sql`SELECT codice, nome FROM pr ORDER BY creato_alle ASC`) as unknown as RigaPr[];

  const conteggi = (await sql`
    SELECT provenienza, tipo, COUNT(*)::int AS conteggio
    FROM richieste
    WHERE stato = 'confermata' AND provenienza LIKE 'Link di %'
    GROUP BY provenienza, tipo
  `) as unknown as RigaConteggio[];

  return pr.map((p) => {
    const suoi = conteggi.filter((c) => c.provenienza === `Link di ${p.nome}`);
    const per = (tipo: string) => suoi.find((c) => c.tipo === tipo)?.conteggio ?? 0;

    return {
      nome: p.nome,
      codice: p.codice,
      link: `lucacalifornia.satoshiweb.it/${p.codice}`,
      confermate: suoi.reduce((tot, c) => tot + c.conteggio, 0),
      tavoli: per("tavolo"),
      liste: per("lista"),
      braccialetti: per("braccialetto"),
    };
  });
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

/** Da "Gian Marco" a "gianmarco": è quello che finisce nel suo link. */
export function nomeCorto(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

/** Vero il link di un PR davvero riconosciuto da /[canale], non solo un'anteprima. */
export async function aggiungiPr(nome: string): Promise<Pr> {
  const sql = await db();
  const base = nomeCorto(nome);

  const occupato = (await sql`SELECT 1 FROM pr WHERE codice = ${base}`) as unknown as readonly unknown[];
  // Due PR con un nome che dà lo stesso codice (es. due "Marco"): il secondo
  // prende un codice con un paio di cifre in più, non sovrascrive il primo.
  const codice = occupato.length === 0 ? base : `${base}${Math.floor(10 + Math.random() * 90)}`;

  await sql`INSERT INTO pr (id, nome, codice) VALUES (${`pr-${codice}`}, ${nome}, ${codice})`;

  return {
    nome,
    codice,
    link: `lucacalifornia.satoshiweb.it/${codice}`,
    confermate: 0,
    tavoli: 0,
    liste: 0,
    braccialetti: 0,
  };
}
