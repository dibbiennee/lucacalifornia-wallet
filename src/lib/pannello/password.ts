import { randomBytes, randomInt, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Le password dei PR.
 *
 * Nel database finisce solo l'hash (scrypt, con un sale diverso per ogni
 * password): chi legge il database non può ricavare la password, nemmeno
 * Luca. La password in chiaro esiste una volta sola, nel momento in cui viene
 * generata, e Luca la vede in quel momento. Se la perde, la rigenera.
 */

/* Senza 0/O, 1/I/l: chi la ricopia da un messaggio non deve indovinare. */
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const GRUPPI = 4;
const PER_GRUPPO = 4;

/* Parametri scrypt: 2^15 costa circa 50-100 ms, abbastanza per rallentare chi indovina, poco per chi entra. */
const N = 1 << 15;
const R = 8;
const P = 1;
const LUNGHEZZA = 32;
/* scrypt chiede 128 * N * R byte: 32 MiB con questi numeri, e il limite predefinito di Node è 32 MiB esatti. */
const MEMORIA = 64 * 1024 * 1024;

function derivata(password: string, sale: Buffer, opzioni: ScryptOptions): Promise<Buffer> {
  return new Promise((risolvi, rifiuta) => {
    scrypt(password, sale, LUNGHEZZA, opzioni, (errore, chiave) => {
      if (errore === null) {
        risolvi(chiave);
      } else {
        rifiuta(errore);
      }
    });
  });
}

/**
 * Una password casuale: quattro gruppi da quattro caratteri (XXXX-XXXX-XXXX-XXXX),
 * oltre 90 bit. Si legge e si detta bene, e nessuno la indovina.
 */
export function generaPassword(): string {
  const gruppi: string[] = [];

  for (let g = 0; g < GRUPPI; g += 1) {
    let gruppo = "";
    for (let i = 0; i < PER_GRUPPO; i += 1) {
      gruppo += ALFABETO.charAt(randomInt(ALFABETO.length));
    }
    gruppi.push(gruppo);
  }

  return gruppi.join("-");
}

/** Gli spazi attorno si tolgono: chi incolla la password da un messaggio non deve inciampare. */
function normalizza(password: string): string {
  return password.trim();
}

/** "scrypt$N$r$p$sale$hash", tutto in base64: i parametri viaggiano con l'hash, così si possono alzare in futuro. */
export async function hashPassword(password: string): Promise<string> {
  const sale = randomBytes(16);
  const chiave = await derivata(normalizza(password), sale, { N, r: R, p: P, maxmem: MEMORIA });

  return ["scrypt", N, R, P, sale.toString("base64"), chiave.toString("base64")].join("$");
}

/** Confronto a tempo costante. Un hash illeggibile è una password sbagliata, mai un errore. */
export async function verificaPassword(password: string, salvato: string): Promise<boolean> {
  const pezzi = salvato.split("$");

  if (pezzi.length !== 6 || pezzi[0] !== "scrypt") {
    return false;
  }

  const [, n, r, p, sale, hash] = pezzi as [string, string, string, string, string, string];
  const atteso = Buffer.from(hash, "base64");

  try {
    const chiave = await derivata(normalizza(password), Buffer.from(sale, "base64"), {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MEMORIA,
    });

    return chiave.length === atteso.length && timingSafeEqual(chiave, atteso);
  } catch {
    return false;
  }
}

/** Un hash finto da confrontare quando l'account non esiste: il tempo di risposta non rivela chi esiste. */
export const HASH_FINTO =
  "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
