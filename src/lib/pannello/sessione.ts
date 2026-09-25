import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * L'accesso al pannello.
 *
 * Una password sola, quella che Luca dà a chi deve entrare. Nel biscotto non
 * finisce la password ma la sua firma: chi legge il biscotto non può
 * ricavarla, e chi cambia il biscotto non può fabbricarne uno valido.
 *
 * Cambiando la password scadono da sole tutte le sessioni aperte, perché la
 * firma non torna più. È il comportamento giusto: se la cambi è perché quella
 * vecchia è girata troppo.
 */

const BISCOTTO = "pannello";
const SALE = "luca-california-pannello-v1";
const DURATA = 12 * 60 * 60;

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

/** Confronto a tempo costante: due password sbagliate devono costare uguale. */
function uguali(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordGiusta(tentativo: string): boolean {
  try {
    return uguali(tentativo, passwordAttesa());
  } catch {
    return false;
  }
}

export function valoreBiscotto(): string {
  return firma(passwordAttesa());
}

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

/** Vero se chi chiede è già entrato. */
export async function sessioneAperta(): Promise<boolean> {
  try {
    const dentro = (await cookies()).get(BISCOTTO)?.value;
    return dentro !== undefined && uguali(dentro, valoreBiscotto());
  } catch {
    return false;
  }
}
