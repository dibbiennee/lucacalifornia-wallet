import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/lib/db";

/**
 * L'accesso al pannello, con due ruoli.
 *
 * - **owner**: Luca. Entra con PANNELLO_PASSWORD, come sempre, e vede tutto.
 * - **pr**: un PR della squadra. Ha un account suo (tabella account), una
 *   password sua, e può vedere solo quello che porta il suo pr_id.
 *
 * Nel biscotto non finisce mai una password. C'è un pacchetto firmato
 * (HMAC-SHA256) con il ruolo, l'account, la scadenza: chi lo legge non può
 * ricavare niente di segreto, chi lo modifica non può fabbricarne uno valido,
 * perché non ha la chiave.
 *
 * Il biscotto dice "chi sono", non "cosa posso fare": i permessi si
 * controllano sul server ogni volta, con leggiSessione(), e per i PR si
 * rilegge l'account dal database. Così spegnere un account o rigenerare la
 * sua password chiude subito le sessioni aperte, senza aspettare la scadenza.
 *
 * Cambiando PANNELLO_PASSWORD scadono le sessioni di Luca e basta: i pacchetti
 * sono firmati con SEGRETO_SESSIONE, obbligatoria in produzione (vedi
 * controllaConfigurazione()), quindi la squadra non viene disconnessa.
 */

const BISCOTTO = "pannello";
const SALE = "luca-california-pannello-v1";
const SALE_CHIAVE = "luca-california-sessione-v2";
const VERSIONE = "v2";
/*
 * Un anno: chi entra una volta resta dentro, non deve rifare la password ogni
 * volta che riapre il telefono. Esce solo premendo "Esci", o se Luca cambia
 * la password (o rigenera quella del PR).
 */
const DURATA = 365 * 24 * 60 * 60;

/** Di chi chiede, per decidere cosa vedere. */
export type Sessione =
  | { readonly ruolo: "owner" }
  | {
      readonly ruolo: "pr";
      readonly accountId: string;
      readonly prId: string;
      readonly codice: string;
      readonly nome: string;
    };

/**
 * Quello che serve ai dati per sapere cosa tornare. Una Sessione ci sta
 * dentro così com'è: le funzioni di dati.ts non sanno nulla dei biscotti.
 */
export type Ambito = { readonly ruolo: "owner" } | { readonly ruolo: "pr"; readonly prId: string };

interface Pacchetto {
  /** ruolo */
  readonly r: "owner" | "pr";
  /** scadenza, secondi dall'epoca */
  readonly e: number;
  /** id dell'account (solo PR) */
  readonly a?: string;
  /** versione della sessione dell'account (solo PR) */
  readonly s?: number;
  /** impronta della password di Luca (solo owner): se cambia, la sessione non vale più */
  readonly f?: string;
}

function passwordAttesa(): string {
  const password = process.env["PANNELLO_PASSWORD"];

  if (password === undefined || password.length < 8) {
    throw new Error("Manca PANNELLO_PASSWORD, o è più corta di 8 caratteri");
  }

  return password;
}

function firma(password: string): string {
  return createHmac("sha256", SALE).update(password).digest("hex");
}

/** Una configurazione mancante o sbagliata: non si trasforma mai in "non sei entrato". */
export class ErroreConfigurazione extends Error {
  constructor(messaggio: string) {
    super(messaggio);
    this.name = "ErroreConfigurazione";
  }
}

function segretoSessione(): string | null {
  const dedicato = process.env["SEGRETO_SESSIONE"];
  return dedicato !== undefined && dedicato.length >= 32 ? dedicato : null;
}

/**
 * In produzione SEGRETO_SESSIONE è obbligatoria (almeno 32 caratteri). Se
 * manca o è troppo corta il pannello si ferma con un errore che dice cosa
 * manca: meglio una pagina rotta e un messaggio chiaro nei log che sessioni
 * firmate con una chiave che nessuno ha scelto. Si controlla a ogni lettura
 * della sessione e a ogni accesso, non una volta sola all'avvio, perché
 * l'avvio del sito (la build) non ha le variabili di produzione.
 */
export function controllaConfigurazione(): void {
  if (process.env.NODE_ENV === "production" && segretoSessione() === null) {
    throw new ErroreConfigurazione(
      "Configurazione mancante: SEGRETO_SESSIONE (almeno 32 caratteri) è obbligatoria in produzione. " +
        "Generala con: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\"",
    );
  }
}

/**
 * La chiave con cui si firmano i pacchetti: SEGRETO_SESSIONE. Cambiare la
 * password di Luca non tocca le sessioni dei PR. Solo in sviluppo, per non
 * dover configurare nulla in locale, la chiave nasce dalla password di Luca;
 * in produzione quella strada non esiste.
 */
function chiave(): Buffer {
  controllaConfigurazione();

  return createHmac("sha256", SALE_CHIAVE).update(segretoSessione() ?? passwordAttesa()).digest();
}

function uguali(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function macDi(corpo: string): string {
  return createHmac("sha256", chiave()).update(corpo).digest("base64url");
}

function impacchetta(pacchetto: Pacchetto): string {
  const corpo = Buffer.from(JSON.stringify(pacchetto)).toString("base64url");
  return `${VERSIONE}.${corpo}.${macDi(`${VERSIONE}.${corpo}`)}`;
}

/** Il pacchetto, solo se la firma torna e non è scaduto. Altrimenti null, senza dire perché. */
function disimpacchetta(valore: string): Pacchetto | null {
  const pezzi = valore.split(".");

  if (pezzi.length !== 3 || pezzi[0] !== VERSIONE) {
    return null;
  }

  const [, corpo, mac] = pezzi as [string, string, string];

  if (!uguali(mac, macDi(`${VERSIONE}.${corpo}`))) {
    return null;
  }

  try {
    const pacchetto = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as Pacchetto;

    if (typeof pacchetto.e !== "number" || pacchetto.e < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (pacchetto.r !== "owner" && pacchetto.r !== "pr") {
      return null;
    }

    return pacchetto;
  } catch {
    return null;
  }
}

/* ------------------------------- accesso owner ------------------------------- */

export function passwordGiusta(tentativo: string): boolean {
  try {
    return uguali(tentativo, passwordAttesa());
  } catch {
    return false;
  }
}

/** Il biscotto di Luca. */
export function biscottoOwner(): string {
  return impacchetta({
    r: "owner",
    e: Math.floor(Date.now() / 1000) + DURATA,
    f: firma(passwordAttesa()).slice(0, 32),
  });
}

/** Il biscotto di un PR: porta la versione della sessione dell'account com'è adesso. */
export function biscottoPr(accountId: string, sessioneV: number): string {
  return impacchetta({
    r: "pr",
    e: Math.floor(Date.now() / 1000) + DURATA,
    a: accountId,
    s: sessioneV,
  });
}

/*
 * Il biscotto che c'era prima di questa versione: la sola firma della
 * password di Luca. Si continua ad accettare, come owner, perché Luca non
 * deve rifare l'accesso solo perché il sito è stato aggiornato. Vale quanto
 * valeva: finché non cambia la password o non preme "Esci".
 */
function eBiscottoVecchio(valore: string): boolean {
  try {
    return uguali(valore, firma(passwordAttesa()));
  } catch {
    return false;
  }
}

/* --------------------------------- impostazioni --------------------------------- */

export const impostazioniBiscotto = {
  name: BISCOTTO,
  httpOnly: true,
  sameSite: "lax",
  secure: true,
  /*
   * Non "/pannello": le azioni del pannello (l'iscrizione al push, per
   * esempio) vivono sotto /api/pannello/..., un ramo diverso per il
   * browser, che confronta il percorso lettera per lettera e non sa che
   * fanno parte della stessa cosa. Con "/pannello" il biscotto non
   * arrivava su quelle richieste, e sembravano tutte "non autorizzato".
   */
  path: "/",
  maxAge: DURATA,
} as const;

/** "Secure" solo in produzione: Safari scarta un biscotto Secure su http://localhost, e in locale non si riuscirebbe a restare dentro. */
const SECURE = process.env.NODE_ENV === "production" ? "; Secure" : "";

/** La riga Set-Cookie che apre la sessione. */
export function intestazioneEntrata(valore: string): string {
  const { name, maxAge, path } = impostazioniBiscotto;
  return `${name}=${valore}; Max-Age=${maxAge}; Path=${path}; HttpOnly${SECURE}; SameSite=Lax`;
}

/** La riga Set-Cookie che la chiude: un biscotto vuoto e già scaduto. */
export function intestazioneUscita(): string {
  const { name, path } = impostazioniBiscotto;
  return `${name}=; Max-Age=0; Path=${path}; HttpOnly${SECURE}; SameSite=Lax`;
}

/* ------------------------------------ lettura ------------------------------------ */

interface RigaAccount {
  readonly id: string;
  readonly sessione_v: number;
  readonly attivo: boolean;
  readonly pr_id: string;
  readonly codice: string;
  readonly nome: string;
}

/**
 * Chi sta chiedendo, o null se non è entrato. È l'unico posto che decide il
 * ruolo: ogni pagina, azione e API passa da qui (o da richiediOwner /
 * richiediSessione), mai dal biscotto direttamente.
 *
 * Dentro la stessa richiesta il risultato si riusa (cache di React): layout e
 * pagina lo chiedono entrambi, e per un PR vuol dire una lettura sola
 * dell'account, non due.
 */
export const leggiSessione = cache(async (): Promise<Sessione | null> => {
  // Fuori dal try: una configurazione mancante non deve sembrare "non sei entrato".
  controllaConfigurazione();

  try {
    const valore = (await cookies()).get(BISCOTTO)?.value;

    if (valore === undefined || valore === "") {
      return null;
    }

    if (eBiscottoVecchio(valore)) {
      return { ruolo: "owner" };
    }

    const pacchetto = disimpacchetta(valore);

    if (pacchetto === null) {
      return null;
    }

    if (pacchetto.r === "owner") {
      return pacchetto.f !== undefined && uguali(pacchetto.f, firma(passwordAttesa()).slice(0, 32))
        ? { ruolo: "owner" }
        : null;
    }

    if (pacchetto.a === undefined || pacchetto.s === undefined) {
      return null;
    }

    const sql = await db();
    const righe = (await sql`
      SELECT a.id, a.sessione_v, a.attivo, p.id AS pr_id, p.codice, p.nome
      FROM account a
      JOIN pr p ON p.id = a.pr_id
      WHERE a.id = ${pacchetto.a} AND a.ruolo = 'pr'
    `) as unknown as RigaAccount[];
    const account = righe[0];

    if (account === undefined || !account.attivo || account.sessione_v !== pacchetto.s) {
      return null;
    }

    return { ruolo: "pr", accountId: account.id, prId: account.pr_id, codice: account.codice, nome: account.nome };
  } catch {
    return null;
  }
});

/**
 * Per le pagine: chi non è entrato finisce sull'accesso.
 *
 * Ogni pagina e ogni layout che legge dati la chiama da sé. Non basta il
 * controllo nel layout del gruppo: in Next i layout annidati e le pagine si
 * preparano in parallelo, quindi quello più in alto non "blocca" quello più
 * in basso. Il controllo che conta è quello vicino ai dati.
 */
export async function sessioneOAccesso(): Promise<Sessione> {
  const sessione = await leggiSessione();

  if (sessione === null) {
    redirect("/pannello/accesso");
  }

  return sessione;
}

/**
 * Per le pagine solo di Luca (squadra, riepilogo generale). Un PR entrato
 * viene rimandato alle sue richieste, non lasciato su un errore.
 */
export async function soloOwnerOAltrove(): Promise<void> {
  const sessione = await sessioneOAccesso();

  if (sessione.ruolo !== "owner") {
    redirect("/pannello/richieste");
  }
}

const NON_AUTORIZZATO = "Non autorizzato";

/** Per le azioni e le API: chi non è entrato esce con un errore. */
export async function richiediSessione(): Promise<Sessione> {
  const sessione = await leggiSessione();

  if (sessione === null) {
    throw new Error(NON_AUTORIZZATO);
  }

  return sessione;
}

/**
 * Per tutto quello che è solo di Luca: squadra, creazione dei PR, notifiche.
 * Un PR con una sessione valida non passa di qui: ha un ruolo, ma non questo.
 */
export async function richiediOwner(): Promise<{ readonly ruolo: "owner" }> {
  const sessione = await leggiSessione();

  if (sessione?.ruolo !== "owner") {
    throw new Error(NON_AUTORIZZATO);
  }

  return { ruolo: "owner" };
}
