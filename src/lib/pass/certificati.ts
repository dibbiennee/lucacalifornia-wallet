import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Certificati per firmare il pass.
 *
 * Due strade, nell'ordine:
 *  1. variabili d'ambiente in base64 (è così su Vercel);
 *  2. file PEM nella cartella certs/ (è così sul Mac mentre sviluppi).
 *
 * La cartella certs/ è esclusa da git. Il contenuto dei certificati non
 * viene mai stampato nei log: negli errori compare solo il nome che manca.
 */
export interface Certificati {
  readonly wwdr: Buffer;
  readonly signerCert: Buffer;
  readonly signerKey: Buffer;
  readonly signerKeyPassphrase?: string;
}

async function leggiPem(variabile: string, nomeFile: string): Promise<Buffer> {
  const base64 = process.env[variabile];

  if (base64 !== undefined && base64.trim() !== "") {
    return Buffer.from(base64, "base64");
  }

  const percorso = path.join(process.cwd(), "certs", nomeFile);

  try {
    return await readFile(percorso);
  } catch {
    throw new Error(
      `Certificato non trovato: imposta la variabile ${variabile} (PEM in base64) ` +
        `oppure metti il file in certs/${nomeFile}`,
    );
  }
}

let inCorso: Promise<Certificati> | undefined;

async function caricaCertificati(): Promise<Certificati> {
  const [wwdr, signerCert, signerKey] = await Promise.all([
    leggiPem("PASS_WWDR_BASE64", "wwdr.pem"),
    leggiPem("PASS_SIGNER_CERT_BASE64", "signerCert.pem"),
    leggiPem("PASS_SIGNER_KEY_BASE64", "signerKey.pem"),
  ]);

  const passphrase = process.env["PASS_SIGNER_KEY_PASSPHRASE"];

  return passphrase !== undefined && passphrase !== ""
    ? { wwdr, signerCert, signerKey, signerKeyPassphrase: passphrase }
    : { wwdr, signerCert, signerKey };
}

/** Legge i certificati una volta sola e li tiene in memoria finché la funzione resta calda. */
export function certificati(): Promise<Certificati> {
  inCorso ??= caricaCertificati().catch((errore: unknown) => {
    // Un errore non deve restare memorizzato: al prossimo tentativo si riprova.
    inCorso = undefined;
    throw errore;
  });

  return inCorso;
}
