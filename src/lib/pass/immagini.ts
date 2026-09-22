import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Immagini del pass, generate da scripts/genera-immagini.mjs.
 *
 * I nomi sono quelli che Apple si aspetta dentro il .pkpass: non sono
 * liberi. Perché Vercel le includa nella funzione, sono dichiarate anche
 * in next.config.ts (outputFileTracingIncludes).
 */
const NOMI = [
  "icon.png",
  "icon@2x.png",
  "icon@3x.png",
  "logo.png",
  "logo@2x.png",
  "logo@3x.png",
  "strip.png",
  "strip@2x.png",
  "strip@3x.png",
] as const;

export type FileImmagini = Readonly<Record<string, Buffer>>;

let inCorso: Promise<FileImmagini> | undefined;

async function caricaImmagini(): Promise<FileImmagini> {
  const cartella = path.join(process.cwd(), "assets", "pass");

  const voci = await Promise.all(
    NOMI.map(async (nome): Promise<readonly [string, Buffer]> => {
      try {
        return [nome, await readFile(path.join(cartella, nome))];
      } catch {
        throw new Error(`Immagine del pass mancante: assets/pass/${nome}. Lancia "npm run immagini".`);
      }
    }),
  );

  return Object.fromEntries(voci);
}

/** Legge le immagini una volta sola e le tiene in memoria finché la funzione resta calda. */
export function immagini(): Promise<FileImmagini> {
  inCorso ??= caricaImmagini().catch((errore: unknown) => {
    inCorso = undefined;
    throw errore;
  });

  return inCorso;
}
