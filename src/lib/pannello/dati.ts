/**
 * I dati del pannello.
 *
 * PUNTO UNICO DI INGRESSO. Le schermate non sanno da dove arrivano i dati:
 * chiamano queste funzioni e basta.
 *
 * Tutto è vero, su Postgres: le richieste (richieste, richiesta, transizione,
 * creaRichiesta, elencoRichieste) arrivano dal modulo del sito e le vede Luca
 * qui; la squadra (PR, accessi) vive nelle tabelle pr e account. Non c'è più
 * nessun dato di esempio in memoria.
 */

import { randomUUID } from "node:crypto";

import { db } from "@/lib/db";

import { escapaLike } from "@/lib/lista-attesa";

import { MAX_RICERCA, type FiltriRichieste } from "./filtri-richieste";
import { eMotivoRifiuto, type CodiceMotivo } from "./motivi";
import { generaPassword, hashPassword } from "./password";
import { CODICI_RISERVATI } from "@/contenuti/canali";
import { linkPr } from "@/lib/pubblico";
import type { Ambito } from "./sessione";

/**
 * Gli stati di una richiesta. Nasce "in attesa"; Luca la conferma o la rifiuta, e
 * può cambiare idea in qualsiasi momento. "Nuova" non esiste più come stato.
 */
export type StatoRichiesta = "in attesa" | "confermata" | "rifiutata";

export interface RichiestaPannello {
  readonly id: string;
  readonly nome: string;
  /**
   * C'è solo per Luca. Per un PR il database non lo legge nemmeno (vedi
   * COLONNE_PR): non è nascosto in pagina, non esiste in nessun dato che
   * arrivi al suo browser.
   */
  readonly telefono?: string;
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
  /** Il PR che l'ha portata, per Luca ("Antonio"). Vuoto per le richieste dirette. */
  readonly prNome?: string;
  /** Il PR, per id: serve a Luca per filtrare. */
  readonly prId?: string;
  readonly stato: StatoRichiesta;
  /** Il codice del motivo, solo se rifiutata. L'etichetta sta in motivi.ts. */
  readonly motivoRifiuto?: CodiceMotivo;
  readonly notePrivate?: string;
  readonly bigliettoInviatoAlle?: string;
  /** Com'è andata la preparazione del Wallet: vuoto se non è mai stata tentata. */
  readonly walletStato?: "pronto" | "errore";
}

/** Una riga della tabella "richieste", così come la scrive Postgres. */
interface RigaRichiesta {
  readonly id: string;
  /* Il nome vero della colonna: prima qui c'era "quando", che non esiste, e
     ogni richiesta mostrava l'ora di adesso invece della sua. */
  readonly creata_alle: Date | string;
  readonly nome: string;
  /* Dal telefono in giù (fino a provenienza) e note_private: per un PR non si leggono dal database. */
  readonly telefono?: string;
  readonly serata: string;
  readonly nome_serata: string;
  readonly codice_serata: string;
  /* Il driver può restituire un DATE come testo o come Date: comeGiorno() li accetta entrambi. */
  readonly data_serata: Date | string | null;
  readonly sala: string | null;
  readonly tipo: string;
  readonly gruppo: string | null;
  readonly budget?: string | null;
  readonly occasione?: string | null;
  readonly persone: string | null;
  readonly zona: string | null;
  readonly messaggio?: string | null;
  readonly provenienza?: string;
  readonly stato: string;
  readonly motivo_rifiuto?: string | null;
  readonly pr_id?: string | null;
  readonly pr_nome?: string | null;
  readonly note_private?: string | null;
  readonly biglietto_inviato_alle?: string | null;
  /* Opzionali: su un database non ancora migrato queste colonne non ci sono. */
  readonly wallet_serial?: string | null;
  readonly wallet_stato?: string | null;
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
    ...(r.telefono === undefined ? {} : { telefono: r.telefono }),
    quando: comeOra(creata),
    creataIso: creata.toISOString(),
    serata: r.serata,
    nomeSerata: r.nome_serata,
    codiceSerata: r.codice_serata,
    tipo: r.tipo as RichiestaPannello["tipo"],
    provenienza: r.provenienza ?? "",
    // "nuova" non esiste più: se un database non ancora migrato ne ha ancora, si legge come "in attesa".
    stato: (r.stato === "confermata" || r.stato === "rifiutata" ? r.stato : "in attesa") as StatoRichiesta,
    ...(r.pr_nome == null ? {} : { prNome: r.pr_nome }),
    ...(r.pr_id == null ? {} : { prId: r.pr_id }),
    ...(r.stato === "rifiutata" && eMotivoRifiuto(r.motivo_rifiuto) ? { motivoRifiuto: r.motivo_rifiuto } : {}),
    ...(r.data_serata === null ? {} : { dataSerata: comeGiorno(r.data_serata) }),
    ...(r.sala === null ? {} : { sala: r.sala }),
    ...(r.gruppo === null ? {} : { gruppo: r.gruppo }),
    ...(r.budget == null ? {} : { budget: r.budget }),
    ...(r.occasione == null ? {} : { occasione: r.occasione }),
    ...(r.persone === null ? {} : { persone: r.persone }),
    ...(r.zona === null ? {} : { zona: r.zona }),
    ...(r.messaggio == null ? {} : { messaggio: r.messaggio }),
    ...(r.note_private == null ? {} : { notePrivate: r.note_private }),
    ...(r.biglietto_inviato_alle == null ? {} : { bigliettoInviatoAlle: r.biglietto_inviato_alle }),
    ...(r.wallet_stato === "pronto" || r.wallet_stato === "errore" ? { walletStato: r.wallet_stato } : {}),
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
  /** Il PR che l'ha portata, per id: è questo, non il nome, a decidere chi la può vedere. */
  readonly prId?: string;
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
      gruppo, budget, occasione, persone, zona, messaggio, provenienza, pr_id, stato
    ) VALUES (
      ${id}, ${dati.nome}, ${dati.telefono}, ${dati.serata}, ${dati.nomeSerata},
      ${dati.codiceSerata}, ${dati.dataSerata ?? null}, ${dati.sala ?? null}, ${dati.tipo}, ${dati.gruppo ?? null},
      ${dati.budget ?? null}, ${dati.occasione ?? null}, ${dati.persone ?? null}, ${dati.zona ?? null},
      ${dati.messaggio ?? null}, ${dati.provenienza}, ${dati.prId ?? null}, 'in attesa'
    )
  `;

  // Appena scritta: si rilegge senza filtri, perché l'ha creata questa stessa funzione.
  const creata = await richiestaPerId(id);
  if (creata === undefined) {
    throw new Error("La richiesta appena scritta non si trova più");
  }
  return creata;
}

export interface Pr {
  readonly id: string;
  readonly nome: string;
  readonly codice: string;
  /** Vero se il PR ha un account con cui entrare (la password gliela dà Luca). */
  readonly haAccesso: boolean;
  /** Spento: il link non funziona più per nuove richieste e l'account non entra. Lo storico resta. */
  readonly attivo: boolean;
  /** Il link permanente, intero: https://dominio/pr/<codice>. */
  readonly link: string;
  /** Richieste confermate portate da questo PR, in tutto e per tipo. */
  readonly confermate: number;
  readonly tavoli: number;
  readonly liste: number;
  readonly braccialetti: number;
}

/* ------------------------------ lettura ------------------------------ */

/*
 * LE COLONNE CHE SI LEGGONO, per ruolo. È la chiusura vera della privacy.
 *
 * Luca legge tutto. Un PR legge solo quello che gli serve a seguire le persone
 * che ha portato: nome, serata, tipo, stato e motivo del rifiuto. Il telefono,
 * il messaggio libero (dove un cliente può aver scritto un numero), il budget,
 * le note e il Wallet non vengono nemmeno chiesti al database: non c'è nessun
 * oggetto, in nessuna pagina, azione o risposta, che li possa portare al
 * browser di un PR.
 */
const COLONNE_OWNER = "*, (SELECT nome FROM pr WHERE id = richieste.pr_id) AS pr_nome";
const COLONNE_PR =
  "id, creata_alle, nome, serata, nome_serata, codice_serata, data_serata, sala, tipo, gruppo, persone, zona, stato, motivo_rifiuto";

export function colonne(ambito: Ambito): string {
  return ambito.ruolo === "owner" ? COLONNE_OWNER : COLONNE_PR;
}

/** Un ambito PR senza id non è "nessun limite": è un errore. */
function idDelPr(ambito: Ambito): string | null {
  if (ambito.ruolo === "owner") {
    return null;
  }
  if (typeof ambito.prId !== "string" || ambito.prId === "") {
    throw new Error("Ambito del PR non valido");
  }
  return ambito.prId;
}

/**
 * Le richieste che chi guarda può vedere. È qui, e non nella pagina, che si
 * decide: Luca (owner) le vede tutte, anche quelle senza un PR; un PR vede
 * solo quelle col suo pr_id, e senza i dati personali (vedi COLONNE_PR).
 * Nascondere un pulsante non basta: questa è la chiusura vera.
 */
export async function richieste(ambito: Ambito, stato?: StatoRichiesta): Promise<readonly RichiestaPannello[]> {
  const sql = await db();
  const pr = idDelPr(ambito);

  const righe = (await sql.query(
    `SELECT ${colonne(ambito)} FROM richieste
     WHERE ($1::text IS NULL OR pr_id = $1::text) AND ($2::text IS NULL OR stato = $2::text)
     ORDER BY creata_alle DESC`,
    [pr, stato ?? null],
  )) as unknown as RigaRichiesta[];

  return righe.map(daRiga);
}

/**
 * Una richiesta, se chi guarda può vederla. Per un PR, la richiesta di un
 * altro PR e una che non esiste sono la stessa cosa: undefined, senza dire
 * quale delle due. Cambiare l'id nell'indirizzo non rivela niente.
 */
export async function richiesta(ambito: Ambito, id: string): Promise<RichiestaPannello | undefined> {
  const sql = await db();
  const pr = idDelPr(ambito);

  const righe = (await sql.query(
    `SELECT ${colonne(ambito)} FROM richieste WHERE id = $1 AND ($2::text IS NULL OR pr_id = $2::text)`,
    [id, pr],
  )) as unknown as RigaRichiesta[];

  return righe[0] === undefined ? undefined : daRiga(righe[0]);
}

/** Senza filtri: solo per creaRichiesta, che la richiesta l'ha appena scritta. Non esportata apposta. */
async function richiestaPerId(id: string): Promise<RichiestaPannello | undefined> {
  const sql = await db();
  const righe = (await sql.query(`SELECT ${COLONNE_OWNER} FROM richieste WHERE id = $1`, [id])) as unknown as RigaRichiesta[];
  return righe[0] === undefined ? undefined : daRiga(righe[0]);
}

interface RigaPr {
  readonly id: string;
  readonly codice: string;
  readonly nome: string;
  readonly ha_accesso: boolean;
  readonly attivo: boolean;
}

interface RigaConteggio {
  readonly pr_id: string;
  readonly tipo: string;
  readonly conteggio: number;
}

/**
 * I PR, con le richieste vere che hanno portato: niente più numeri finti.
 *
 * Il collegamento è richieste.pr_id, l'id vero del PR. La stringa "Link di
 * Marco" che stava in provenienza era solo un'etichetta, e due PR con lo
 * stesso nome si sarebbero sommati: ora no. Le richieste senza pr_id (le
 * vecchie non abbinabili con certezza) non contano per nessun PR.
 *
 * Solo Luca vede la squadra intera: a un PR questa funzione risponde con un
 * errore, qualunque pagina la chiami.
 */
export async function squadra(ambito: Ambito): Promise<readonly Pr[]> {
  if (ambito.ruolo !== "owner") {
    throw new Error("Non autorizzato");
  }

  const sql = await db();

  const pr = (await sql`
    SELECT p.id, p.codice, p.nome, p.attivo, (a.id IS NOT NULL) AS ha_accesso
    FROM pr p
    LEFT JOIN account a ON a.pr_id = p.id AND a.ruolo = 'pr'
    ORDER BY p.creato_alle ASC
  `) as unknown as RigaPr[];

  const conteggi = (await sql`
    SELECT pr_id, tipo, COUNT(*)::int AS conteggio
    FROM richieste
    WHERE stato = 'confermata' AND pr_id IS NOT NULL
    GROUP BY pr_id, tipo
  `) as unknown as RigaConteggio[];

  return pr.map((p) => {
    const suoi = conteggi.filter((c) => c.pr_id === p.id);
    const per = (tipo: string) => suoi.find((c) => c.tipo === tipo)?.conteggio ?? 0;

    return {
      id: p.id,
      nome: p.nome,
      codice: p.codice,
      haAccesso: p.ha_accesso,
      attivo: p.attivo,
      link: linkPr(p.codice),
      confermate: suoi.reduce((tot, c) => tot + c.conteggio, 0),
      tavoli: per("tavolo"),
      liste: per("lista"),
      braccialetti: per("braccialetto"),
    };
  });
}

/* ------------------------------ scrittura ------------------------------ */

/**
 * Il flusso di una richiesta, e l'unico posto che lo decide:
 *
 *   (nasce)  ->  in attesa  <->  confermata
 *                           <->  rifiutata (con un motivo)
 *                confermata <->  rifiutata
 *
 * Decide SOLO Luca. Un PR non mette in attesa, non conferma, non rifiuta e non
 * cambia niente: transizione() con un ambito diverso da owner lancia un
 * errore, qualunque pagina, azione o route la chiami. Luca può cambiare una
 * decisione già presa, quante volte vuole.
 *
 * Telefonare non cambia lo stato: non passa da qui.
 *
 * Nel database lo stato "in attesa" si scrive con lo spazio, com'è sempre
 * stato: cambiarlo vorrebbe dire riscrivere le righe esistenti per niente.
 */
export type EsitoTransizione =
  | { readonly ok: true; readonly richiesta: RichiestaPannello }
  /** Non esiste. */
  | { readonly ok: false; readonly motivo: "inesistente" }
  /** Esiste, ma è già in quello stato (e, per il rifiuto, già con quel motivo): niente da cambiare. */
  | { readonly ok: false; readonly motivo: "gia_cosi"; readonly statoAttuale: StatoRichiesta }
  /** Si rifiuta senza un motivo dell'elenco. */
  | { readonly ok: false; readonly motivo: "serve_motivo" };

/**
 * Porta una richiesta a un nuovo stato, in un solo colpo.
 *
 * Una sola istruzione UPDATE: "è già così?" è la condizione della stessa
 * istruzione che scrive, quindi due clic o due schede nello stesso istante non
 * si pestano i piedi (uno cambia, l'altro non trova niente da cambiare e
 * riceve "gia_cosi"). Non c'è una finestra fra "leggo lo stato" e "lo scrivo".
 *
 * Il motivo del rifiuto va con lo stato: si scrive solo se il nuovo stato è
 * "rifiutata", e in ogni altro caso si azzera. Rifiutare di nuovo con un motivo
 * diverso lo cambia; rifiutare di nuovo con lo stesso non fa niente.
 */
export async function transizione(
  ambito: Ambito,
  id: string,
  verso: StatoRichiesta,
  motivo?: CodiceMotivo,
): Promise<EsitoTransizione> {
  if (ambito.ruolo !== "owner") {
    throw new Error("Non autorizzato");
  }

  if (verso === "rifiutata" && !eMotivoRifiuto(motivo)) {
    return { ok: false, motivo: "serve_motivo" };
  }

  const sql = await db();
  const motivoScritto = verso === "rifiutata" ? (motivo ?? null) : null;
  // L'ora in cui il biglietto è stato preparato si scrive solo alla conferma, e solo la prima volta.
  const bigliettoOra = verso === "confermata" ? comeOra(new Date()) : null;

  const righe = (await sql`
    UPDATE richieste
    SET stato = ${verso},
        motivo_rifiuto = ${motivoScritto},
        biglietto_inviato_alle = COALESCE(biglietto_inviato_alle, ${bigliettoOra})
    WHERE id = ${id}
      AND (stato <> ${verso} OR motivo_rifiuto IS DISTINCT FROM ${motivoScritto})
    RETURNING id
  `) as unknown as readonly { readonly id: string }[];

  if (righe.length > 0) {
    const aggiornata = await richiesta(ambito, id);

    if (aggiornata !== undefined) {
      return { ok: true, richiesta: aggiornata };
    }
  }

  // Niente di cambiato: o non c'è, o era già così.
  const attuale = await richiesta(ambito, id);

  return attuale === undefined
    ? { ok: false, motivo: "inesistente" }
    : { ok: false, motivo: "gia_cosi", statoAttuale: attuale.stato };
}

/** Il biglietto Wallet legato a una richiesta, com'è adesso nel database. */
export interface WalletSalvato {
  readonly stato: "pronto" | "errore" | null;
  readonly serial: string | null;
  /** Il biglietto vero (quello che sta nel link). C'è se e solo se lo stato è "pronto". */
  readonly token: string | null;
}

interface RigaWallet {
  readonly wallet_stato: string | null;
  readonly wallet_serial: string | null;
  readonly wallet_token: string | null;
}

/**
 * Il Wallet di una richiesta confermata, dentro l'ambito di chi chiede.
 * Serve a /api/conferma per decidere se c'è già un biglietto da restituire:
 * se è "pronto" non se ne genera un altro.
 */
export async function walletDi(ambito: Ambito, id: string): Promise<WalletSalvato | null> {
  const sql = await db();
  const righe = (
    ambito.ruolo === "owner"
      ? await sql`SELECT wallet_stato, wallet_serial, wallet_token FROM richieste WHERE id = ${id} AND stato = 'confermata'`
      : await sql`SELECT wallet_stato, wallet_serial, wallet_token FROM richieste WHERE id = ${id} AND stato = 'confermata' AND pr_id = ${ambito.prId}`
  ) as unknown as RigaWallet[];
  const r = righe[0];

  if (r === undefined) {
    return null;
  }

  return {
    stato: r.wallet_stato === "pronto" || r.wallet_stato === "errore" ? r.wallet_stato : null,
    serial: r.wallet_serial ?? null,
    token: r.wallet_token ?? null,
  };
}

/**
 * Il numero di serie del biglietto di una richiesta confermata.
 *
 * La prima volta lo scrive, le volte dopo restituisce quello che c'è già:
 * due schede che confermano insieme, o un nuovo tentativo dopo un errore,
 * finiscono con lo stesso numero. COALESCE dentro l'UPDATE lo rende atomico,
 * senza un "leggi e poi scrivi" in mezzo. Vale solo per le confermate e solo
 * dentro l'ambito di chi chiede; altrimenti null.
 */
export async function riservaSerialWallet(ambito: Ambito, id: string, nuovo: string): Promise<string | null> {
  const sql = await db();
  const righe = (
    ambito.ruolo === "owner"
      ? await sql`
          UPDATE richieste SET wallet_serial = COALESCE(wallet_serial, ${nuovo})
          WHERE id = ${id} AND stato = 'confermata'
          RETURNING wallet_serial
        `
      : await sql`
          UPDATE richieste SET wallet_serial = COALESCE(wallet_serial, ${nuovo})
          WHERE id = ${id} AND stato = 'confermata' AND pr_id = ${ambito.prId}
          RETURNING wallet_serial
        `
  ) as unknown as readonly { readonly wallet_serial: string | null }[];

  return righe[0]?.wallet_serial ?? null;
}

/**
 * Salva il biglietto e segna il Wallet "pronto", in una sola istruzione.
 *
 * Restituisce il biglietto che resta nel database, che può non essere quello
 * appena generato: se due schede arrivano insieme, il COALESCE tiene il
 * primo che è stato scritto e la seconda riceve quello. Così a ogni
 * richiesta corrisponde un solo biglietto, qualunque cosa succeda nel
 * mezzo. Il token generato e scartato non ha effetti: è solo un calcolo.
 */
export async function salvaWalletPronto(ambito: Ambito, id: string, token: string): Promise<string | null> {
  const sql = await db();
  const righe = (
    ambito.ruolo === "owner"
      ? await sql`
          UPDATE richieste SET wallet_token = COALESCE(wallet_token, ${token}), wallet_stato = 'pronto'
          WHERE id = ${id} AND stato = 'confermata'
          RETURNING wallet_token
        `
      : await sql`
          UPDATE richieste SET wallet_token = COALESCE(wallet_token, ${token}), wallet_stato = 'pronto'
          WHERE id = ${id} AND stato = 'confermata' AND pr_id = ${ambito.prId}
          RETURNING wallet_token
        `
  ) as unknown as readonly { readonly wallet_token: string | null }[];

  return righe[0]?.wallet_token ?? null;
}

/**
 * Segna che il Wallet non si è generato. Non tocca lo stato della
 * prenotazione, e non scavalca un Wallet già "pronto": se un'altra scheda
 * ce l'ha fatta un istante prima, quello resta.
 */
export async function segnaWalletInErrore(ambito: Ambito, id: string): Promise<void> {
  const sql = await db();

  if (ambito.ruolo === "owner") {
    await sql`
      UPDATE richieste SET wallet_stato = 'errore'
      WHERE id = ${id} AND stato = 'confermata' AND wallet_stato IS DISTINCT FROM 'pronto'
    `;
  } else {
    await sql`
      UPDATE richieste SET wallet_stato = 'errore'
      WHERE id = ${id} AND stato = 'confermata' AND wallet_stato IS DISTINCT FROM 'pronto' AND pr_id = ${ambito.prId}
    `;
  }
}

/**
 * Il biglietto con questo numero di serie vale ancora?
 *
 * Luca può cambiare decisione: una richiesta confermata e poi rifiutata (o rimessa
 * in attesa) non deve più dare un biglietto scaricabile. Il numero di serie sta in
 * richieste.wallet_serial; se la riga non esiste il biglietto è di prima che il
 * numero si salvasse (emesso dal vecchio flusso) e resta valido: non lo si può
 * confrontare con niente, e invalidarlo vorrebbe dire togliere il biglietto a chi
 * l'ha già ricevuto per una conferma vera.
 */
export async function bigliettoValido(serial: string): Promise<boolean> {
  const sql = await db();
  const righe = (await sql`SELECT stato FROM richieste WHERE wallet_serial = ${serial}`) as unknown as readonly { readonly stato: string }[];
  const riga = righe[0];

  return riga === undefined || riga.stato === "confermata";
}

/** Da "Gian Marco" a "gianmarco": è quello che finisce nel suo link. */
export function nomeCorto(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

/** L'esito di una creazione o di una rigenerazione: la password in chiaro esiste solo qui, una volta. */
export interface AccessoPr {
  readonly pr: Pr;
  /** Da mostrare a Luca subito e mai più: nel database resta solo l'hash. */
  readonly password: string;
}

/**
 * Un PR nuovo, col suo link e il suo accesso.
 *
 * Il link è davvero riconosciuto da /[canale]. La password è casuale, la
 * crea questa funzione e la restituisce una volta sola; nel database va
 * l'hash. Il PR e il suo account nascono insieme: se la seconda scrittura
 * fallisce, la prima si toglie, e non resta un PR senza modo di entrare
 * di cui nessuno si accorge.
 */
export async function aggiungiPr(nome: string): Promise<AccessoPr> {
  const sql = await db();
  const base = nomeCorto(nome);

  if (base === "") {
    throw new Error("Il nome non ha lettere né cifre");
  }

  const occupato = (await sql`SELECT 1 FROM pr WHERE codice = ${base}`) as unknown as readonly unknown[];
  // Due PR con un nome che dà lo stesso codice (es. due "Marco"), o un nome che
  // coincide con una pagina del sito (es. "Serate"): il PR prende un codice con
  // un paio di cifre in più, non sovrascrive niente e il suo link funziona.
  const codice = occupato.length === 0 && !CODICI_RISERVATI.has(base) ? base : `${base}${Math.floor(10 + Math.random() * 90)}`;
  const id = `pr-${codice}`;

  await sql`INSERT INTO pr (id, nome, codice) VALUES (${id}, ${nome}, ${codice})`;

  try {
    const password = await creaOAggiornaAccesso(id);

    return {
      password,
      pr: {
        id,
        nome,
        codice,
        haAccesso: true,
        attivo: true,
        link: linkPr(codice),
        confermate: 0,
        tavoli: 0,
        liste: 0,
        braccialetti: 0,
      },
    };
  } catch (errore) {
    await sql`DELETE FROM pr WHERE id = ${id}`;
    throw errore;
  }
}

/**
 * Una password nuova per un PR, che esista già o no il suo account.
 *
 * Serve a due cose: rigenerare la password di chi l'ha persa, e dare un
 * accesso ai PR che c'erano prima degli account (marco, sara, davide).
 * Rigenerare chiude subito tutte le sessioni di quel PR: sessione_v sale di
 * uno, e i biscotti già in giro portano il numero vecchio.
 */
export async function rigeneraAccessoPr(prId: string): Promise<AccessoPr> {
  const sql = await db();
  const trovati = (await sql`SELECT id, codice, nome, attivo FROM pr WHERE id = ${prId}`) as unknown as readonly {
    readonly id: string;
    readonly codice: string;
    readonly nome: string;
    readonly attivo: boolean;
  }[];
  const p = trovati[0];

  if (p === undefined) {
    throw new Error("PR inesistente");
  }

  const password = await creaOAggiornaAccesso(p.id);

  return {
    password,
    pr: {
      id: p.id,
      nome: p.nome,
      codice: p.codice,
      haAccesso: true,
      attivo: p.attivo,
      link: linkPr(p.codice),
      confermate: 0,
      tavoli: 0,
      liste: 0,
      braccialetti: 0,
    },
  };
}

/**
 * Spegne o riaccende un PR. Non cancella niente: le richieste, la lista e lo
 * storico restano dove sono, visibili a Luca. Spento, il suo link /pr/<codice>
 * non si apre più, il suo account non entra, e le sessioni già aperte si chiudono
 * subito (sessione_v sale di uno, come quando si rigenera la password).
 */
export async function impostaAttivoPr(prId: string, attivo: boolean): Promise<boolean> {
  const sql = await db();

  const trovati = (await sql`UPDATE pr SET attivo = ${attivo} WHERE id = ${prId} RETURNING id`) as unknown as readonly unknown[];

  if (trovati.length === 0) {
    return false;
  }

  await sql`UPDATE account SET attivo = ${attivo}, sessione_v = sessione_v + 1 WHERE pr_id = ${prId}`;
  return true;
}

export type EsitoCodice =
  | { readonly ok: true; readonly codice: string }
  | { readonly ok: false; readonly motivo: "inesistente" | "non_valido" | "riservato" | "occupato" };

/**
 * Cambia il codice di un PR, cioè la parte finale del suo link (/pr/<codice>) e
 * il suo nome utente per entrare. Lettere e cifre, da 2 a 30; non una parola
 * riservata del sito; non quello di un altro PR. Il vecchio link smette di
 * funzionare: Luca lo dice al PR insieme al nuovo.
 */
export async function cambiaCodicePr(prId: string, grezzo: string): Promise<EsitoCodice> {
  const nuovo = nomeCorto(typeof grezzo === "string" ? grezzo.slice(0, 80) : "");

  if (nuovo.length < 2 || nuovo.length > 30) {
    return { ok: false, motivo: "non_valido" };
  }
  if (CODICI_RISERVATI.has(nuovo)) {
    return { ok: false, motivo: "riservato" };
  }

  const sql = await db();

  try {
    const righe = (await sql`UPDATE pr SET codice = ${nuovo} WHERE id = ${prId} RETURNING id`) as unknown as readonly unknown[];
    return righe.length === 0 ? { ok: false, motivo: "inesistente" } : { ok: true, codice: nuovo };
  } catch (errore) {
    // Il vincolo UNIQUE sul codice: un altro PR lo ha già (anche per una corsa fra due richieste).
    if (typeof errore === "object" && errore !== null && (errore as { code?: string }).code === "23505") {
      return { ok: false, motivo: "occupato" };
    }
    throw errore;
  }
}

/** Genera la password, ne salva l'hash, e restituisce quella in chiaro. Un solo account per PR (pr_id è UNIQUE). */
async function creaOAggiornaAccesso(prId: string): Promise<string> {
  const sql = await db();
  const password = generaPassword();
  const hash = await hashPassword(password);

  // "attivo" segue il PR: rigenerare la password a un PR spento non lo riaccende.
  await sql`
    INSERT INTO account (id, ruolo, pr_id, password_hash, attivo)
    VALUES (${`acc-${randomUUID()}`}, 'pr', ${prId}, ${hash}, COALESCE((SELECT attivo FROM pr WHERE id = ${prId}), true))
    ON CONFLICT (pr_id) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      sessione_v = account.sessione_v + 1,
      attivo = COALESCE((SELECT attivo FROM pr WHERE id = account.pr_id), true),
      password_cambiata_alle = now()
  `;

  return password;
}

/**
 * L'account di un PR, per il login: lo trova dal codice (il "nome utente",
 * quello che sta nel link). Un account spento non si trova.
 */
export async function accountPerCodice(codice: string): Promise<{
  readonly id: string;
  readonly passwordHash: string;
  readonly sessioneV: number;
} | null> {
  const sql = await db();
  const righe = (await sql`
    SELECT a.id, a.password_hash, a.sessione_v
    FROM account a
    JOIN pr p ON p.id = a.pr_id
    WHERE p.codice = ${codice.toLowerCase()} AND a.ruolo = 'pr' AND a.attivo AND p.attivo
  `) as unknown as readonly { readonly id: string; readonly password_hash: string; readonly sessione_v: number }[];
  const riga = righe[0];

  return riga === undefined ? null : { id: riga.id, passwordHash: riga.password_hash, sessioneV: riga.sessione_v };
}


/* ------------------------ elenco con filtri (lato server) ------------------------ */

/**
 * Le condizioni dell'elenco, costruite in UN solo punto: l'elenco, i conteggi
 * per stato e (nello stesso modo) ogni altra lettura filtrata usano questa
 * funzione, così il filtro è lo stesso dappertutto.
 *
 * I valori non finiscono mai dentro il testo SQL: solo segnaposti ($1, $2...),
 * e i valori viaggiano a parte. Il testo contiene soltanto frammenti fissi
 * scritti qui.
 *
 * L'ambito è obbligatorio e va PER PRIMO: un PR vede solo le richieste col
 * suo pr_id, e un ambito PR senza id è un errore, non "nessun limite".
 */
function condizioniRichieste(
  ambito: Ambito,
  f: FiltriRichieste,
  oggi: string,
  conStato: boolean,
): { readonly dove: string; readonly valori: unknown[] } {
  const valori: unknown[] = [];
  const cond: string[] = [];
  const p = (v: unknown): string => {
    valori.push(v);
    return `$${valori.length}`;
  };

  if (ambito.ruolo === "pr") {
    if (typeof ambito.prId !== "string" || ambito.prId === "") {
      throw new Error("Ambito del PR non valido");
    }
    cond.push(`pr_id = ${p(ambito.prId)}`);
  }

  // Il filtro per PR è di Luca. Un PR è già chiuso nel suo pr_id (sopra): un valore qui non allarga niente.
  if (ambito.ruolo === "owner" && f.pr !== undefined) {
    cond.push(f.pr === "diretto" ? "pr_id IS NULL" : `pr_id = ${p(f.pr)}`);
  }

  if (conStato && f.stato !== undefined) {
    cond.push(`stato = ${p(f.stato)}`);
  }

  if (f.notte === "altro") {
    cond.push("codice_serata NOT IN ('milkshake', 'venerdi', 'sabato', 'bailame', 'ninfeo')");
  } else if (f.notte !== undefined) {
    cond.push(`codice_serata = ${p(f.notte)}`);
  }

  if (f.data !== undefined) {
    // Una serata scelta a mano vale anche se è passata: chi la cerca la vuole vedere.
    cond.push(`data_serata = ${p(f.data)}::date`);
  } else if (f.quando === "futuri") {
    cond.push(`(data_serata IS NULL OR data_serata >= ${p(oggi)}::date)`);
  } else if (f.quando === "passate") {
    cond.push(`data_serata < ${p(oggi)}::date`);
  }

  if (f.tipo !== undefined) {
    cond.push(`tipo = ${p(f.tipo)}`);
  }

  if (f.q !== undefined && f.q.trim() !== "") {
    const ricerca = p(escapaLike(f.q.trim().slice(0, MAX_RICERCA)));

    if (ambito.ruolo === "owner") {
      const cifre = f.q.replace(/\D/g, "");
      // Da tre cifre in su si cerca anche il telefono senza spazi né prefisso scritto in modi diversi.
      const sulleCifre = cifre.length >= 3 ? ` OR regexp_replace(telefono, '\\D', '', 'g') LIKE '%' || ${p(cifre)} || '%'` : "";
      cond.push(`(nome ILIKE '%' || ${ricerca} || '%' OR telefono ILIKE '%' || ${ricerca} || '%'${sulleCifre})`);
    } else {
      // Un PR cerca solo per nome: cercare per telefono, anche senza mostrarlo, direbbe quali numeri ci sono.
      cond.push(`nome ILIKE '%' || ${ricerca} || '%'`);
    }
  }

  return { dove: cond.length === 0 ? "" : `WHERE ${cond.join(" AND ")}`, valori };
}

export interface RisultatoElenco {
  readonly righe: readonly RichiestaPannello[];
  /** Quante richieste corrispondono ai filtri in tutto, anche oltre questa pagina. */
  readonly totale: number;
  /** Quante per stato, con tutti i filtri tranne lo stato: sono i numeri accanto ai pulsanti. */
  readonly perStato: Readonly<Record<StatoRichiesta, number>>;
}

const LIMITE_PAGINA = 100;
const LIMITE_MASSIMO = 200;

/**
 * Una pagina di richieste, filtrata nella query (mai dal browser).
 *
 * Ordine: per data della serata (le più vicine in alto; le passate, dalla più
 * recente), le senza data in fondo, poi per chi è arrivato per ultimo, poi per
 * id: l'ordine è deterministico, quindi "carica altre" non salta né ripete.
 */
export async function elencoRichieste(
  ambito: Ambito,
  filtri: FiltriRichieste,
  oggi: string,
  opzioni: { readonly limite?: number; readonly offset?: number } = {},
): Promise<RisultatoElenco> {
  const sql = await db();
  const limite = Math.min(Math.max(Math.trunc(opzioni.limite ?? LIMITE_PAGINA), 1), LIMITE_MASSIMO);
  const offset = Math.max(Math.trunc(opzioni.offset ?? 0), 0);

  const con = condizioniRichieste(ambito, filtri, oggi, true);
  const senza = condizioniRichieste(ambito, filtri, oggi, false);
  const verso = filtri.data === undefined && filtri.quando === "passate" ? "DESC" : "ASC";

  const [righeGrezze, contiGrezzi] = await Promise.all([
    sql.query(
      `SELECT ${colonne(ambito)} FROM richieste ${con.dove}
       ORDER BY data_serata ${verso} NULLS LAST, creata_alle DESC, id
       LIMIT $${con.valori.length + 1} OFFSET $${con.valori.length + 2}`,
      [...con.valori, limite, offset],
    ),
    sql.query(`SELECT stato, COUNT(*)::int AS n FROM richieste ${senza.dove} GROUP BY stato`, senza.valori),
  ]);
  const righe = righeGrezze as unknown as RigaRichiesta[];
  const conti = contiGrezzi as unknown as readonly { readonly stato: string; readonly n: number }[];

  const perStato: Record<StatoRichiesta, number> = { "in attesa": 0, confermata: 0, rifiutata: 0 };
  for (const c of conti) {
    if (c.stato in perStato) {
      perStato[c.stato as StatoRichiesta] = c.n;
    }
  }

  const totale =
    filtri.stato === undefined
      ? perStato["in attesa"] + perStato.confermata + perStato.rifiutata
      : perStato[filtri.stato];

  return { righe: righe.map(daRiga), totale, perStato };
}

export interface SerataConRichieste {
  readonly dataIso: string;
  readonly codiceSerata: string;
  /** In attesa. */
  readonly daGestire: number;
  readonly totale: number;
}

/**
 * Le prossime serate (da oggi in poi) che hanno richieste, nell'ambito di chi
 * guarda, con quante ce ne sono e quante aspettano risposta: le righette delle
 * date, per trovare "chi viene sabato" con un tocco.
 */
export async function serateConRichieste(ambito: Ambito, oggi: string, massimo = 14): Promise<readonly SerataConRichieste[]> {
  const sql = await db();
  const pr = ambito.ruolo === "owner" ? null : ambito.prId;

  if (ambito.ruolo === "pr" && (typeof pr !== "string" || pr === "")) {
    throw new Error("Ambito del PR non valido");
  }

  const righe = (await sql`
    SELECT to_char(data_serata, 'YYYY-MM-DD') AS data_iso, codice_serata,
           (COUNT(*) FILTER (WHERE stato = 'in attesa'))::int AS da_gestire,
           COUNT(*)::int AS totale
    FROM richieste
    WHERE data_serata >= ${oggi}::date AND (${pr}::text IS NULL OR pr_id = ${pr}::text)
    GROUP BY data_serata, codice_serata
    ORDER BY data_serata, codice_serata
    LIMIT ${Math.min(Math.max(Math.trunc(massimo), 1), 60)}
  `) as unknown as readonly {
    readonly data_iso: string;
    readonly codice_serata: string;
    readonly da_gestire: number;
    readonly totale: number;
  }[];

  return righe.map((r) => ({ dataIso: r.data_iso, codiceSerata: r.codice_serata, daGestire: r.da_gestire, totale: r.totale }));
}

/**
 * Quante richieste ci sono in un certo stato, nell'ambito di chi guarda:
 * un COUNT, senza caricare le righe. Serve al numero sulla voce "Richieste".
 */
export async function contaRichieste(ambito: Ambito, stato: StatoRichiesta): Promise<number> {
  const sql = await db();
  const pr = ambito.ruolo === "owner" ? null : ambito.prId;

  if (ambito.ruolo === "pr" && (typeof pr !== "string" || pr === "")) {
    throw new Error("Ambito del PR non valido");
  }

  const righe = (await sql`
    SELECT COUNT(*)::int AS n FROM richieste WHERE stato = ${stato} AND (${pr}::text IS NULL OR pr_id = ${pr}::text)
  `) as unknown as readonly { readonly n: number }[];

  return righe[0]?.n ?? 0;
}

export interface PrPerFiltro {
  readonly id: string;
  readonly nome: string;
  readonly attivo: boolean;
}

/** I PR fra cui Luca può filtrare l'elenco, anche quelli spenti (le loro richieste restano). Un PR non ne vede nessuno. */
export async function elencoPrPerFiltro(ambito: Ambito): Promise<readonly PrPerFiltro[]> {
  if (ambito.ruolo !== "owner") {
    return [];
  }

  const sql = await db();
  return (await sql`SELECT id, nome, attivo FROM pr ORDER BY nome`) as unknown as readonly PrPerFiltro[];
}
