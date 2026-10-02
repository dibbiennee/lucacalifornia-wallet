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
    ON CONFLICT DO NOTHING
  `);

  /*
   * Gli accessi. Luca (owner) entra con PANNELLO_PASSWORD e non ha una riga
   * qui: il suo accesso non cambia. Ogni PR ha un account suo, legato al
   * proprio pr_id, con una password propria di cui si conserva solo l'hash.
   *
   * sessione_v sale di uno quando la password viene rigenerata o l'account
   * viene spento: le sessioni aperte portano il numero che c'era quando sono
   * nate, e da quel momento non valgono più.
   *
   * Il vincolo finale tiene insieme le due cose: un PR ha sempre un pr_id,
   * un owner non ce l'ha mai. Una riga a metà non può esistere.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      ruolo TEXT NOT NULL CHECK (ruolo IN ('owner', 'pr')),
      pr_id TEXT UNIQUE REFERENCES pr(id) ON DELETE CASCADE,
      password_hash TEXT NOT NULL,
      sessione_v INTEGER NOT NULL DEFAULT 1,
      attivo BOOLEAN NOT NULL DEFAULT true,
      creato_alle TIMESTAMPTZ NOT NULL DEFAULT now(),
      password_cambiata_alle TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK ((ruolo = 'pr' AND pr_id IS NOT NULL) OR (ruolo = 'owner' AND pr_id IS NULL))
    )
  `);

  /*
   * Il legame vero fra una richiesta e il PR che l'ha portata. La stringa
   * "Link di Marco" in provenienza resta, ma è solo un'etichetta da leggere:
   * i permessi e i conteggi passano da qui.
   */
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS pr_id TEXT REFERENCES pr(id)`;
  await sql`CREATE INDEX IF NOT EXISTS richieste_pr_id_idx ON richieste (pr_id)`;

  /*
   * Per l'elenco filtrato: per serata e data (l'evento), solo per data, e per
   * stato e arrivo (le nuove in cima). Senza questi ogni filtro leggerebbe
   * l'intera tabella.
   */
  await sql`CREATE INDEX IF NOT EXISTS richieste_serata_data ON richieste (codice_serata, data_serata)`;
  await sql`CREATE INDEX IF NOT EXISTS richieste_data ON richieste (data_serata)`;
  await sql`CREATE INDEX IF NOT EXISTS richieste_stato_arrivo ON richieste (stato, creata_alle DESC)`;

  /*
   * Il biglietto Wallet legato alla richiesta. wallet_serial è il numero di
   * serie del biglietto: si decide una volta sola, alla prima conferma, e
   * resta lo stesso se si ripete l'operazione (un secondo clic, un'altra
   * scheda, un nuovo tentativo dopo un errore). wallet_token è il biglietto
   * vero (quello nel link): si scrive una volta sola, e finché c'è non se ne
   * genera un altro. wallet_stato dice com'è andata la preparazione:
   * 'pronto' (e allora wallet_token c'è), 'errore', oppure vuoto se non è mai
   * stata tentata. Un errore del Wallet non annulla la conferma.
   */
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS wallet_serial TEXT`;
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS wallet_stato TEXT CHECK (wallet_stato IN ('pronto', 'errore'))`;
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS wallet_token TEXT`;

  /*
   * Le richieste di prima, che avevano solo "Link di Marco". Si collegano al
   * PR solo se la corrispondenza è una e una sola: se due PR si chiamano
   * allo stesso modo, o se il PR è stato rinominato o tolto, la richiesta
   * resta con pr_id vuoto e la vede solo Luca. Mai un abbinamento a caso.
   * È idempotente: tocca solo le righe ancora senza pr_id.
   */
  await sql`
    UPDATE richieste r
    SET pr_id = p.id
    FROM pr p
    WHERE r.pr_id IS NULL
      AND r.provenienza = 'Link di ' || p.nome
      AND (SELECT COUNT(*) FROM pr q WHERE 'Link di ' || q.nome = r.provenienza) = 1
  `;

  /*
   * I tentativi di accesso sbagliati. Stanno nel database e non nella memoria
   * dell'istanza: su una funzione serverless ogni istanza ha la sua memoria,
   * e chi insiste cadrebbe ogni volta su una diversa con il conto a zero.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS tentativi_accesso (
      chiave TEXT PRIMARY KEY,
      n INTEGER NOT NULL,
      da TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  /*
   * Gli eventi speciali (special guest, Halloween, Capodanno, le due estati).
   * Non hanno una data finché Luca non la imposta: data_evento resta vuota, e
   * non se ne inventano. Quando c'è, la lista d'attesa di quell'evento la
   * eredita (vedi data_effettiva nelle query di attesa.ts), senza riscrivere
   * nessuna riga della lista.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS eventi_speciali (
      codice TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      data_evento DATE,
      aggiornato_alle TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await ignoraCorsaAllaCreazione(sql`
    INSERT INTO eventi_speciali (codice, nome) VALUES
      ('special_guest', 'Special guest'),
      ('halloween', 'Halloween'),
      ('capodanno', 'Capodanno'),
      ('ninfeo', 'Ninfeo, estate'),
      ('morgan', 'Morgan, estate')
    ON CONFLICT (codice) DO NOTHING
  `);

  /*
   * La lista d'attesa. Due categorie distinte, tenute insieme dal vincolo:
   *
   *  - serata: una notte del calendario. Ha il codice della notte
   *    (codice_serata) e la data (data_serata), gli stessi di richieste.
   *  - speciale: un evento fuori calendario. Ha il suo codice
   *    (evento_speciale) e nessuna data propria: se ne ha una, sta in
   *    eventi_speciali.
   *
   * contatto_norma è la forma per confrontare e cercare (le sole cifre col 39,
   * oppure l'email in minuscolo); contatto è quello che la persona ha scritto.
   * pr_id e provenienza come nelle richieste: chi è arrivato dal link di un PR
   * finisce nella lista di quel PR, per id e non per nome.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS lista_attesa (
      id TEXT PRIMARY KEY,
      creata_alle TIMESTAMPTZ NOT NULL DEFAULT now(),
      nome TEXT NOT NULL,
      contatto TEXT NOT NULL,
      contatto_tipo TEXT NOT NULL CHECK (contatto_tipo IN ('telefono', 'email')),
      contatto_norma TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK (categoria IN ('serata', 'speciale')),
      codice_serata TEXT CHECK (codice_serata IN ('milkshake', 'venerdi', 'sabato', 'bailame', 'ninfeo')),
      data_serata DATE,
      evento_speciale TEXT REFERENCES eventi_speciali(codice),
      pr_id TEXT REFERENCES pr(id),
      provenienza TEXT NOT NULL,
      stato TEXT NOT NULL DEFAULT 'in attesa' CHECK (stato IN ('in attesa', 'avvisata', 'chiusa')),
      CHECK (
        (categoria = 'serata' AND codice_serata IS NOT NULL AND data_serata IS NOT NULL AND evento_speciale IS NULL)
        OR (categoria = 'speciale' AND evento_speciale IS NOT NULL AND codice_serata IS NULL AND data_serata IS NULL)
      )
    )
  `);

  /*
   * La stessa persona non finisce due volte nella stessa lista: un secondo clic,
   * un secondo invio o un bot che ripete lo stesso numero cadono sul vincolo, e
   * l'inserimento (ON CONFLICT DO NOTHING) non fa niente. La stessa persona può
   * stare in liste di eventi diversi, e nella lista di due date diverse.
   */
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS lista_attesa_una_volta ON lista_attesa (
      contatto_norma,
      categoria,
      COALESCE(codice_serata, ''),
      COALESCE(evento_speciale, ''),
      COALESCE(data_serata, DATE '0001-01-01')
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS lista_attesa_evento ON lista_attesa (categoria, codice_serata, evento_speciale, data_serata)`;
  await sql`CREATE INDEX IF NOT EXISTS lista_attesa_stato ON lista_attesa (stato, creata_alle DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS lista_attesa_pr ON lista_attesa (pr_id)`;

  /*
   * Gli stati delle richieste sono tre: "in attesa", "confermata", "rifiutata".
   * "nuova" non è più uno stato: una richiesta nasce già in attesa. Le righe di
   * prima che erano ancora "nuova" passano in attesa (idempotente: dopo la
   * prima volta non c'è più niente da toccare) e il valore di partenza della
   * colonna cambia, così nessuna scrittura dimenticata può rifare "nuova".
   */
  await sql`ALTER TABLE richieste ALTER COLUMN stato SET DEFAULT 'in attesa'`;
  await sql`UPDATE richieste SET stato = 'in attesa' WHERE stato = 'nuova'`;

  /*
   * Il motivo del rifiuto: un codice dell'elenco fisso (src/lib/pannello/motivi.ts),
   * mai testo libero. C'è solo se la richiesta è rifiutata: chi la riporta in
   * attesa o la conferma lo azzera, così non restano dati che si contraddicono.
   */
  await sql`ALTER TABLE richieste ADD COLUMN IF NOT EXISTS motivo_rifiuto TEXT`;

  /*
   * Un PR si può spegnere senza cancellare niente: il link /pr/<codice> smette di
   * funzionare per nuove richieste, l'account non entra più, e le richieste e
   * lo storico restano dove sono, visibili a Luca.
   */
  await sql`ALTER TABLE pr ADD COLUMN IF NOT EXISTS attivo BOOLEAN NOT NULL DEFAULT true`;

  /*
   * Il traffico, in forma minima: una riga per sessione e per tipo di evento
   * (visita, inizio del modulo, invio). La sessione è un numero casuale che il
   * browser tiene finché la scheda resta aperta: non si salvano indirizzo IP,
   * dispositivo né altro. UNIQUE (sessione, evento) fa sì che la stessa persona
   * conti una volta sola per visita, qualunque pagina apra.
   * "nuova" dice se il browser non aveva mai visitato il sito prima.
   */
  await ignoraCorsaAllaCreazione(sql`
    CREATE TABLE IF NOT EXISTS traffico (
      id BIGSERIAL PRIMARY KEY,
      creato_alle TIMESTAMPTZ NOT NULL DEFAULT now(),
      giorno DATE NOT NULL DEFAULT ((now() AT TIME ZONE 'Europe/Rome')::date),
      sessione TEXT NOT NULL,
      evento TEXT NOT NULL CHECK (evento IN ('visita', 'inizio', 'invio')),
      nuova BOOLEAN NOT NULL DEFAULT false,
      origine TEXT NOT NULL,
      pr_id TEXT REFERENCES pr(id),
      UNIQUE (sessione, evento)
    )
  `);
  await sql`CREATE INDEX IF NOT EXISTS traffico_giorno ON traffico (giorno, evento)`;
  await sql`CREATE INDEX IF NOT EXISTS traffico_pr ON traffico (pr_id, giorno)`;

  creata = true;
  return sql;
}
