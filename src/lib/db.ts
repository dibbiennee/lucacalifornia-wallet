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
      data_serata DATE,
      sala TEXT,
      tipo TEXT NOT NULL,
      gruppo TEXT,
      budget TEXT,
      occasione TEXT,
      persone TEXT,
      zona TEXT,
      messaggio TEXT,
      provenienza TEXT NOT NULL,
      stato TEXT NOT NULL DEFAULT 'nuova',
      note_private TEXT,
      biglietto_inviato_alle TEXT
    )
  `);

  /*
   * Le due colonne sopra sono arrivate dopo: su un database che aveva già
   * la tabella, "CREATE TABLE IF NOT EXISTS" non le aggiunge da solo.
   * "ADD COLUMN IF NOT EXISTS" è già idempotente di suo in Postgres.
   */
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS data_serata DATE`;
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS persone TEXT`;

  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS iscrizioni_push (
      endpoint TEXT PRIMARY KEY,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      creata_alle TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  /*
   * I PR, prima fissi nel codice (src/contenuti/canali.ts): "Aggiungi PR" dal
   * pannello generava solo un link finto, mai davvero riconosciuto da
   * /[canale]. Ora la squadra vive qui, e il link che esce da "Aggiungi PR"
   * funziona davvero.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS pr (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      codice TEXT UNIQUE NOT NULL,
      creato_alle TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // I tre PR che c'erano già fissi nel codice: seminati una volta sola,
  // così i link che Luca ha già girato continuano a funzionare.
  await ignoraCorsaAllaCreazione(sql`
    INSERT INTO pr (id, nome, codice) VALUES
      ('pr-marco', 'Marco', 'marco'),
      ('pr-sara', 'Sara', 'sara'),
      ('pr-davide', 'Davide', 'davide')
    ON CONFLICT (codice) DO NOTHING
  `);

  creata = true;
  return sql;
}
