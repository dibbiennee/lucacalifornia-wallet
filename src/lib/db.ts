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
 * "IF NOT EXISTS" non basta da solo: due richieste arrivate insieme su
 * un'istanza appena partita possono controllare entrambe "non esiste" prima
 * che la prima finisca di crearla, e Postgres risponde a una delle due con
 * "duplicate key" sul catalogo. Non è un errore vero, è la tabella che
 * c'era già: si ignora solo questo codice preciso (23505), non altri.
 */
async function ignoraCorsaAllaCreazione(promessa: Promise<unknown>): Promise<void> {
  try {
    await promessa;
  } catch (errore) {
    if ((errore as { code?: string }).code !== "23505") {
      throw errore;
    }
  }
}

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

  await ignoraCorsaAllaCreazione(sql`
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
  `);

  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS iscrizioni_push (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      creata_alle TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  creata = true;
  return sql;
}
