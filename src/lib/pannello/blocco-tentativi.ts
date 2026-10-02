import { db } from "@/lib/db";

/**
 * Blocco dei tentativi sulle password del pannello.
 *
 * Adattato da ~/.claude/strumenti/blocco-tentativi.js, che è scritto per le
 * funzioni con req/res: qui arriva una Request, ma la logica e i numeri sono
 * gli stessi. Cinque tentativi per indirizzo, poi dieci minuti fuori, e
 * durante il blocco non passa nemmeno la password giusta. È voluto.
 *
 * QUESTO NON PROTEGGE I LIMITI DEL PIANO: la richiesta arriva comunque alla
 * funzione, quindi l'invocazione la paghi. Per quello c'è la regola sul bordo
 * (proteggi-api.py): 60 al minuto per IP.
 *
 * ## Dove sta il conteggio, e cosa succede se il database è giù
 *
 * Il conteggio sta nel database (tabella tentativi_accesso). Su serverless
 * ogni istanza ha la sua memoria: un conto tenuto lì ripartirebbe da zero a
 * ogni istanza nuova, e chi insiste lo aggirerebbe semplicemente
 * continuando. Per questo il database è la sola fonte di verità.
 *
 *   - Database disponibile: il limite lo applica il database, per tutti.
 *
 *   - Database NON disponibile, accesso dei PR: il login dei PR si BLOCCA
 *     (fallisce chiuso). Non esiste un ripiego in memoria per i PR: un
 *     ripiego sarebbe un limite aggirabile proprio quando serve. Del resto
 *     per controllare la password di un PR serve leggere il suo account dal
 *     database, quindi senza database non entrerebbe nessuno comunque.
 *
 *   - Database NON disponibile, accesso di Luca (owner): si usa un ripiego
 *     in memoria dell'istanza, con gli stessi numeri. Luca per entrare non ha
 *     bisogno del database (la sua password sta nell'ambiente), e un guasto
 *     del database non deve lasciarlo fuori dal pannello. Il ripiego è più
 *     debole (ogni istanza conta per sé, quindi in quel periodo chi tenta di
 *     indovinare la password di Luca ha più tentativi), ma riguarda solo la
 *     password di Luca, mai quella dei PR: le due chiavi non si mescolano
 *     (il ripiego conta solo i tentativi fatti SENZA un nome di PR, e un
 *     tentativo con un nome di PR non lo tocca mai).
 *
 * Le chiavi sono due per ogni accesso di un PR: l'indirizzo (5 tentativi) e
 * l'account (20). Il secondo conto ferma chi prova la stessa password da
 * molti indirizzi diversi, senza permettere a uno sconosciuto di chiudere
 * fuori un PR con cinque tentativi sbagliati.
 */

export const TENTATIVI_PER_INDIRIZZO = 5;
export const TENTATIVI_PER_ACCOUNT = 20;
const FINESTRA_SECONDI = 10 * 60;

interface Voce {
  n: number;
  da: number;
}

/** Il ripiego di Luca: stessa logica, memoria dell'istanza. Mai usato per i PR. */
const ripiegoOwner = new Map<string, Voce>();

export function indirizzo(richiesta: Request): string {
  const inoltrato = (richiesta.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim();
  return inoltrato !== undefined && inoltrato !== ""
    ? inoltrato
    : (richiesta.headers.get("x-real-ip") ?? "ignoto");
}

export const chiaveIndirizzo = (richiesta: Request): string => `ip:${indirizzo(richiesta)}`;
export const chiaveAccount = (codice: string): string => `pr:${codice.toLowerCase().slice(0, 40)}`;

export interface StatoBlocco {
  readonly bloccato: boolean;
  /** Secondi che mancano alla fine del blocco, 0 se non c'è. */
  readonly attesa: number;
  /**
   * Il database non ha risposto e non c'è un ripiego ammesso per questa
   * richiesta: chi chiama deve rifiutare l'accesso, non lasciarlo passare.
   */
  readonly nonDisponibile: boolean;
}

const LIBERO: StatoBlocco = { bloccato: false, attesa: 0, nonDisponibile: false };
/** Senza database e senza ripiego: si chiude, e si dice di riprovare fra poco. */
const CHIUSO: StatoBlocco = { bloccato: true, attesa: 60, nonDisponibile: true };

interface RigaTentativi {
  readonly n: number;
  readonly resta: number;
}

function statoInMemoria(chiave: string, massimo: number): StatoBlocco {
  const voce = ripiegoOwner.get(chiave);
  const resta = voce === undefined ? 0 : Math.ceil(FINESTRA_SECONDI - (Date.now() - voce.da) / 1000);

  return voce !== undefined && resta > 0 && voce.n >= massimo
    ? { bloccato: true, attesa: resta, nonDisponibile: false }
    : LIBERO;
}

/**
 * Com'è messa una chiave adesso: bloccata (e per quanto) o libera.
 *
 * `ripiego` dice se, a database giù, si può ripiegare sulla memoria. Solo
 * l'accesso di Luca lo chiede; per i PR è sempre false, e a database giù la
 * risposta è CHIUSO.
 */
export async function statoBlocco(chiave: string, massimo: number, ripiego: boolean): Promise<StatoBlocco> {
  try {
    const sql = await db();
    const righe = (await sql`
      SELECT n, GREATEST(0, CEIL(EXTRACT(EPOCH FROM (da + interval '10 minutes' - now()))))::int AS resta
      FROM tentativi_accesso
      WHERE chiave = ${chiave}
    `) as unknown as RigaTentativi[];
    const riga = righe[0];

    return riga !== undefined && riga.resta > 0 && riga.n >= massimo
      ? { bloccato: true, attesa: riga.resta, nonDisponibile: false }
      : LIBERO;
  } catch {
    return ripiego ? statoInMemoria(chiave, massimo) : CHIUSO;
  }
}

/**
 * Un tentativo sbagliato in più. Un'unica istruzione atomica: due richieste
 * arrivate insieme non si pestano i piedi, e il conteggio non perde colpi.
 * Se la finestra è scaduta il conto riparte da uno.
 *
 * A database giù: con `ripiego` si conta in memoria (solo Luca), senza non si
 * conta niente, perché per i PR l'accesso è comunque chiuso.
 */
export async function segnaFallito(chiave: string, ripiego: boolean): Promise<void> {
  try {
    const sql = await db();

    await sql`
      INSERT INTO tentativi_accesso (chiave, n, da) VALUES (${chiave}, 1, now())
      ON CONFLICT (chiave) DO UPDATE SET
        n = CASE
          WHEN tentativi_accesso.da + interval '10 minutes' < now() THEN 1
          ELSE tentativi_accesso.n + 1
        END,
        da = CASE
          WHEN tentativi_accesso.da + interval '10 minutes' < now() THEN now()
          ELSE tentativi_accesso.da
        END
    `;
  } catch {
    if (!ripiego) {
      return;
    }

    const voce = ripiegoOwner.get(chiave);

    if (voce === undefined || Date.now() - voce.da > FINESTRA_SECONDI * 1000) {
      ripiegoOwner.set(chiave, { n: 1, da: Date.now() });
    } else {
      voce.n += 1;
    }
  }
}

/** Un accesso riuscito azzera il conto di quella chiave. */
export async function azzera(chiave: string): Promise<void> {
  ripiegoOwner.delete(chiave);

  try {
    const sql = await db();
    await sql`DELETE FROM tentativi_accesso WHERE chiave = ${chiave}`;
  } catch {
    // Il conto in memoria è già azzerato; quello nel database scade da solo.
  }
}
