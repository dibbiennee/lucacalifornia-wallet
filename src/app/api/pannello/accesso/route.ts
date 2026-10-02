import { accountPerCodice } from "@/lib/pannello/dati";
import {
  TENTATIVI_PER_ACCOUNT,
  TENTATIVI_PER_INDIRIZZO,
  azzera,
  chiaveAccount,
  chiaveIndirizzo,
  segnaFallito,
  statoBlocco,
} from "@/lib/pannello/blocco-tentativi";
import { HASH_FINTO, verificaPassword } from "@/lib/pannello/password";
import {
  biscottoOwner,
  biscottoPr,
  controllaConfigurazione,
  intestazioneEntrata,
  passwordGiusta,
} from "@/lib/pannello/sessione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * L'accesso al pannello, per i due ruoli.
 *
 * - Senza "codice": è Luca, e la password è PANNELLO_PASSWORD. Come sempre.
 * - Con "codice" (il nome del PR, quello del suo link): è un PR, e la
 *   password è la sua, confrontata con l'hash nel database.
 *
 * La password viaggia nel corpo della richiesta, mai nell'indirizzo. Chi
 * sbaglia riceve sempre la stessa risposta, che il PR esista o no: dalla
 * risposta non si ricava chi c'è nella squadra.
 */

function limiteTroppi(attesa: number): Response {
  return Response.json(
    { errore: `Troppi tentativi. Riprova fra ${Math.ceil(attesa / 60)} minuti.` },
    { status: 429, headers: { "Retry-After": String(attesa), "Cache-Control": "no-store" } },
  );
}

/** Il database non risponde e per i PR non c'è un ripiego: l'accesso si chiude, per tutti, finché non torna. */
function nonDisponibile(): Response {
  return Response.json(
    { errore: "Accesso dei PR temporaneamente non disponibile. Riprova fra qualche minuto." },
    { status: 503, headers: { "Retry-After": "60", "Cache-Control": "no-store" } },
  );
}

function sbagliato(owner: boolean): Response {
  return Response.json(
    { errore: owner ? "Password sbagliata" : "Nome o password sbagliati" },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

function entrato(biscotto: string): Response {
  const risposta = Response.json({ dentro: true }, { headers: { "Cache-Control": "no-store" } });
  risposta.headers.append("Set-Cookie", intestazioneEntrata(biscotto));
  return risposta;
}

export async function POST(richiesta: Request): Promise<Response> {
  // Senza SEGRETO_SESSIONE (in produzione) nessuno entra: errore chiaro nei log, non un "password sbagliata".
  try {
    controllaConfigurazione();
  } catch (errore) {
    console.error(errore instanceof Error ? errore.message : errore);
    return Response.json(
      { errore: "Configurazione del server incompleta: avvisa chi gestisce il sito." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    corpo = {};
  }

  const { password, codice } = corpo as { password?: unknown; codice?: unknown };
  const tentativo = typeof password === "string" && password.length <= 200 ? password : "";
  const codicePr = typeof codice === "string" && codice.trim() !== "" ? codice.trim().slice(0, 40) : null;

  const chiaveIp = chiaveIndirizzo(richiesta);
  const chiavePr = codicePr === null ? null : chiaveAccount(codicePr);

  /*
   * Il ripiego in memoria, se il database è giù, è solo per Luca: vedi
   * l'intestazione di blocco-tentativi.ts. Per un PR (codicePr presente)
   * `ripiego` è false: senza database il suo accesso si chiude.
   */
  const ripiego = codicePr === null;

  // Il blocco si controlla PRIMA della password: chi ha davvero dimenticato
  // deve sapere che deve aspettare, non credere di averla riscritta male.
  const perIp = await statoBlocco(chiaveIp, TENTATIVI_PER_INDIRIZZO, ripiego);
  if (perIp.nonDisponibile) {
    return nonDisponibile();
  }
  if (perIp.bloccato) {
    return limiteTroppi(perIp.attesa);
  }

  if (chiavePr !== null) {
    const perAccount = await statoBlocco(chiavePr, TENTATIVI_PER_ACCOUNT, false);
    if (perAccount.nonDisponibile) {
      return nonDisponibile();
    }
    if (perAccount.bloccato) {
      return limiteTroppi(perAccount.attesa);
    }
  }

  /* ----- Luca ----- */
  if (codicePr === null) {
    if (!passwordGiusta(tentativo)) {
      await segnaFallito(chiaveIp, true);
      return sbagliato(true);
    }

    await azzera(chiaveIp);
    return entrato(biscottoOwner());
  }

  /* ----- un PR ----- */
  let account: Awaited<ReturnType<typeof accountPerCodice>>;

  try {
    account = await accountPerCodice(codicePr);
  } catch (errore) {
    // Senza database non si può controllare la password di un PR: l'accesso si chiude.
    console.error("Accesso PR: database non raggiungibile:", errore);
    return nonDisponibile();
  }

  // Anche se l'account non esiste si fa lo stesso calcolo: il tempo che ci
  // vuole a rispondere non deve dire se quel nome c'è.
  const giusta = await verificaPassword(tentativo, account?.passwordHash ?? HASH_FINTO);

  if (account === null || !giusta) {
    await segnaFallito(chiaveIp, false);
    if (chiavePr !== null) {
      await segnaFallito(chiavePr, false);
    }
    return sbagliato(false);
  }

  /*
   * Si azzera il conto dell'account, non quello dell'indirizzo: chi ha un
   * account suo non deve poter cancellare i propri tentativi sbagliati sulla
   * password di Luca entrando ogni tanto con il proprio.
   */
  if (chiavePr !== null) {
    await azzera(chiavePr);
  }

  return entrato(biscottoPr(account.id, account.sessioneV));
}
