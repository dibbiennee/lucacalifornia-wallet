import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Il database vero, condiviso da richieste e notifiche push.
 *
 * Una connessione per richiesta HTTP: il driver di Neon parla via fetch, non
 * tiene una connessione TCP aperta, quindi va bene così in una funzione
 * serverless senza bisogno di un pool a parte.
 */
function connessione(): NeonQueryFunction<false, false> {
  const url = process.env["DATABASE_URL"];

  if (url === undefined || url === "") {
    throw new Error("Manca DATABASE_URL");
  }

  return neon(url);
}

let creata = false;

/**
 * La connessione, con le tabelle già create se non c'erano. Nessuno
 * strumento di migrazione qui: il progetto è piccolo, e "IF NOT EXISTS"
 * chiamato una volta per istanza calda costa pochissimo ed è idempotente
 * per natura.
 */
export async function db(): Promise<NeonQueryFunction<false, false>> {
  const sql = connessione();

  if (creata) {
    return sql;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS richieste (
      id TEXT PRIMARY KEY,
      creata_alle TIMESTAMPTZ NOT NULL DEFAULT now(),
      nome TEXT NOT NULL,
      telefono TEXT NOT NULL,
      serata TEXT NOT NULL,
      nome_serata TEXT NOT NULL,
      codice_serata TEXT NOT NULL,
      sala TEXT,
      tipo TEXT NOT NULL,
      gruppo TEXT,
      budget TEXT,
      occasione TEXT,
      zona TEXT,
      messaggio TEXT,
      provenienza TEXT NOT NULL,
      stato TEXT NOT NULL DEFAULT 'nuova',
      note_private TEXT,
      biglietto_inviato_alle TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS iscrizioni_push (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      creata_alle TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  creata = true;
  return sql;
}
