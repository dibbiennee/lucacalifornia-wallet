import { Buffer } from "node:buffer";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// L'estensione .ts è esplicita apposta: così questo modulo si può provare con
// "node scripts/prova-token.ts", senza passare dal costruttore del progetto.
import { isCodiceLocale, type Prenotazione } from "./tipi.ts";

/**
 * Il token che finisce dentro il QR.
 *
 * PERCHE' CIFRATO E NON SOLO FIRMATO. Senza database il token deve portarsi
 * dietro la prenotazione, e un token solo firmato si legge lo stesso: chiunque
 * inquadri il QR di un altro vedrebbe nome e cognome. Cifrando, chi non ha la
 * chiave vede una sequenza senza senso.
 *
 * AES-256-GCM fa tutte e due le cose insieme: nasconde il contenuto e lo
 * autentica. Cambiare anche un solo carattere del token fa fallire la verifica
 * del sigillo, quindi non si può né falsificare né modificare.
 *
 * La chiave sta solo sul server, ricavata da SEGRETO_BIGLIETTO. Nel browser
 * non arriva mai: la pagina di scansione manda il token e riceve solo l'esito.
 */

const ALGORITMO = "aes-256-gcm";
const LUNGHEZZA_IV = 12;
const LUNGHEZZA_SIGILLO = 16;
/** Sale fisso: la chiave deve venire uguale a ogni avvio, altrimenti i biglietti già emessi smettono di aprirsi. */
const SALE = "luca-california-biglietto-v1";

/** Forma compatta del contenuto. Nomi di un carattere per accorciare il QR. */
interface Contenuto {
  readonly i: string;
  readonly n: string;
  readonly s: string;
  readonly q: string;
  readonly t: string;
  readonly l: string;
  readonly a?: string;
}

let chiaveInMemoria: Buffer | undefined;

function chiave(): Buffer {
  if (chiaveInMemoria !== undefined) {
    return chiaveInMemoria;
  }

  const segreto = process.env["SEGRETO_BIGLIETTO"];

  if (segreto === undefined || segreto.length < 16) {
    throw new Error(
      "Manca la variabile d'ambiente SEGRETO_BIGLIETTO, o è più corta di 16 caratteri",
    );
  }

  chiaveInMemoria = scryptSync(segreto, SALE, 32);
  return chiaveInMemoria;
}

/** Genera un identificativo corto e non indovinabile per un biglietto. */
export function nuovoSerialNumber(): string {
  return randomBytes(9).toString("base64url");
}

export function creaToken(prenotazione: Prenotazione): string {
  const contenuto: Contenuto = {
    i: prenotazione.serialNumber,
    n: prenotazione.nomeCliente,
    s: prenotazione.serata,
    q: prenotazione.inizioSerata.toISOString(),
    t: prenotazione.tipo,
    l: prenotazione.locale,
    ...(prenotazione.sala !== undefined && prenotazione.sala !== ""
      ? { a: prenotazione.sala }
      : {}),
  };

  const iv = randomBytes(LUNGHEZZA_IV);
  const cifratore = createCipheriv(ALGORITMO, chiave(), iv);
  const cifrato = Buffer.concat([
    cifratore.update(JSON.stringify(contenuto), "utf8"),
    cifratore.final(),
  ]);

  return Buffer.concat([iv, cifratore.getAuthTag(), cifrato]).toString("base64url");
}

/**
 * Apre un token. Restituisce null se è stato manomesso, se è stato scritto con
 * un'altra chiave o se non è proprio un token: chi chiama deve distinguere solo
 * fra valido e non valido, non sapere perché.
 */
export function leggiToken(token: string): Prenotazione | null {
  try {
    const dati = Buffer.from(token, "base64url");

    if (dati.length <= LUNGHEZZA_IV + LUNGHEZZA_SIGILLO) {
      return null;
    }

    const decifratore = createDecifratore(dati);
    const chiaro = Buffer.concat([
      decifratore.update(dati.subarray(LUNGHEZZA_IV + LUNGHEZZA_SIGILLO)),
      decifratore.final(),
    ]).toString("utf8");

    const c: unknown = JSON.parse(chiaro);

    if (!contenutoValido(c)) {
      return null;
    }

    const inizioSerata = new Date(c.q);

    if (Number.isNaN(inizioSerata.getTime()) || !isCodiceLocale(c.l)) {
      return null;
    }

    return {
      serialNumber: c.i,
      nomeCliente: c.n,
      serata: c.s,
      inizioSerata,
      tipo: c.t,
      locale: c.l,
      ...(c.a !== undefined ? { sala: c.a } : {}),
    };
  } catch {
    return null;
  }
}

function createDecifratore(dati: Buffer) {
  const decifratore = createDecipheriv(ALGORITMO, chiave(), dati.subarray(0, LUNGHEZZA_IV));
  decifratore.setAuthTag(dati.subarray(LUNGHEZZA_IV, LUNGHEZZA_IV + LUNGHEZZA_SIGILLO));
  return decifratore;
}

function contenutoValido(c: unknown): c is Contenuto {
  if (typeof c !== "object" || c === null) {
    return false;
  }

  const o = c as Record<string, unknown>;

  return (
    typeof o["i"] === "string" &&
    typeof o["n"] === "string" &&
    typeof o["s"] === "string" &&
    typeof o["q"] === "string" &&
    typeof o["t"] === "string" &&
    typeof o["l"] === "string" &&
    (o["a"] === undefined || typeof o["a"] === "string")
  );
}
