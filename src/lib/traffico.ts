import { db } from "@/lib/db";

/**
 * Il traffico, in forma minima.
 *
 * Tre eventi, una riga ciascuno per sessione (UNIQUE sessione + evento):
 *  - visita: la persona ha aperto il sito o il link di un PR. Una persona che
 *    apre dieci pagine nella stessa sessione conta una visita;
 *  - inizio: ha cominciato davvero a compilare il modulo (non solo aperto la pagina);
 *  - invio: la richiesta è stata salvata. Lo scrive il server nel momento in cui
 *    la richiesta esiste, non il browser: conta solo gli invii riusciti.
 *
 * Non si salvano indirizzo IP, dispositivo, browser né altro che identifichi
 * una persona: la sessione è un numero casuale che sta nella scheda del browser
 * finché resta aperta. "Nuova" dice solo se quel browser non era mai stato sul
 * sito prima.
 */

export type EventoTraffico = "visita" | "inizio" | "invio";

export const EVENTI_TRAFFICO: readonly EventoTraffico[] = ["visita", "inizio", "invio"];

export function eEventoTraffico(valore: unknown): valore is EventoTraffico {
  return typeof valore === "string" && (EVENTI_TRAFFICO as readonly string[]).includes(valore);
}

/** La forma della sessione che manda il browser: un numero casuale, niente di più. */
export const FORMA_SESSIONE = /^[A-Za-z0-9_-]{8,64}$/;

export interface NuovoEvento {
  readonly sessione: string;
  readonly evento: EventoTraffico;
  /** Vero se il browser non aveva mai visitato il sito. Conta per la visita, non per gli altri eventi. */
  readonly nuova: boolean;
  /** "diretto", il codice di un canale ("ig", "tt"...) o "pr". */
  readonly origine: string;
  readonly prId: string | null;
}

/**
 * Scrive l'evento se quella sessione non l'ha già fatto. Ripeterlo (la stessa
 * visita, un secondo clic) non cambia niente: l'INSERT cade sul vincolo.
 */
export async function registraEvento(e: NuovoEvento): Promise<void> {
  const sql = await db();

  await sql`
    INSERT INTO traffico (sessione, evento, nuova, origine, pr_id)
    VALUES (${e.sessione}, ${e.evento}, ${e.nuova}, ${e.origine}, ${e.prId})
    ON CONFLICT (sessione, evento) DO NOTHING
  `;
}

/* ------------------------------ statistiche ------------------------------ */

export interface Conti {
  readonly visite: number;
  readonly nuove: number;
  readonly iniziati: number;
  readonly inviati: number;
  readonly inAttesa: number;
  readonly confermate: number;
  readonly rifiutate: number;
}

const VUOTI: Conti = { visite: 0, nuove: 0, iniziati: 0, inviati: 0, inAttesa: 0, confermate: 0, rifiutate: 0 };

export type Periodo = "giorno" | "settimana" | "mese";

export interface PuntoSerie extends Conti {
  /** AAAA-MM-GG: il primo giorno del periodo (il giorno, il lunedì, il primo del mese). */
  readonly inizio: string;
}

export interface Statistiche {
  readonly totale: Conti;
  /** L'ultimo periodo di ogni serie: oggi, questa settimana, questo mese. */
  readonly corrente: Readonly<Record<Periodo, Conti>>;
  readonly serie: Readonly<Record<Periodo, readonly PuntoSerie[]>>;
}

/**
 * A chi si riferiscono i numeri. Il chiamante decide, e per un PR decide sempre
 * il suo id preso dalla sessione, mai da un parametro: un PR non ha modo di
 * chiedere i numeri di un altro.
 *  - { tutto: true }: tutto il sito (solo per Luca);
 *  - { diretto: true }: le richieste senza PR e le visite senza PR (solo per Luca);
 *  - { prId }: un PR.
 */
export type AmbitoTraffico = { readonly tutto: true } | { readonly diretto: true } | { readonly prId: string };

const PUNTI: Readonly<Record<Periodo, { readonly unita: "day" | "week" | "month"; readonly quanti: number }>> = {
  giorno: { unita: "day", quanti: 30 },
  settimana: { unita: "week", quanti: 12 },
  mese: { unita: "month", quanti: 12 },
};

function parametriAmbito(ambito: AmbitoTraffico): { readonly prId: string | null; readonly diretto: boolean } {
  if ("prId" in ambito) {
    if (typeof ambito.prId !== "string" || ambito.prId === "") {
      throw new Error("Ambito del PR non valido");
    }
    return { prId: ambito.prId, diretto: false };
  }
  return { prId: null, diretto: "diretto" in ambito };
}

/** La condizione sullo scope, uguale per le due tabelle (entrambe hanno pr_id). */
const SCOPE = "(($2::boolean AND pr_id IS NULL) OR (NOT $2::boolean AND ($1::text IS NULL OR pr_id = $1::text)))";

interface RigaConti {
  readonly visite: number;
  readonly nuove: number;
  readonly iniziati: number;
  readonly inviati: number;
  readonly in_attesa: number;
  readonly confermate: number;
  readonly rifiutate: number;
}

const daRiga = (r: Partial<RigaConti> | undefined): Conti =>
  r === undefined
    ? VUOTI
    : {
        visite: Number(r.visite ?? 0),
        nuove: Number(r.nuove ?? 0),
        iniziati: Number(r.iniziati ?? 0),
        inviati: Number(r.inviati ?? 0),
        inAttesa: Number(r.in_attesa ?? 0),
        confermate: Number(r.confermate ?? 0),
        rifiutate: Number(r.rifiutate ?? 0),
      };

/** Le colonne dei conti sul traffico e sulle richieste, scritte una volta sola. */
const CONTI_TRAFFICO = `
  COUNT(*) FILTER (WHERE evento = 'visita')::int AS visite,
  COUNT(*) FILTER (WHERE evento = 'visita' AND nuova)::int AS nuove,
  COUNT(*) FILTER (WHERE evento = 'inizio')::int AS iniziati,
  COUNT(*) FILTER (WHERE evento = 'invio')::int AS inviati`;
const CONTI_RICHIESTE = `
  COUNT(*) FILTER (WHERE stato = 'in attesa')::int AS in_attesa,
  COUNT(*) FILTER (WHERE stato = 'confermata')::int AS confermate,
  COUNT(*) FILTER (WHERE stato = 'rifiutata')::int AS rifiutate`;

/**
 * Visite, moduli iniziati e inviati, e come sono andate a finire le richieste
 * (in attesa, confermate, rifiutate): in totale, e per giorno, settimana e mese.
 *
 * Il traffico viene dalla tabella traffico, gli esiti da richieste per giorno di
 * arrivo (a Roma): una richiesta arrivata lunedì e confermata giovedì conta
 * lunedì, nello stato in cui è adesso. Lo scope entra in entrambe le query.
 */
export async function statisticheTraffico(ambito: AmbitoTraffico, oggi: string): Promise<Statistiche> {
  const sql = await db();
  const { prId, diretto } = parametriAmbito(ambito);

  const [totTraffico, totRichieste] = await Promise.all([
    sql.query(`SELECT ${CONTI_TRAFFICO} FROM traffico WHERE ${SCOPE}`, [prId, diretto]),
    sql.query(`SELECT ${CONTI_RICHIESTE} FROM richieste WHERE ${SCOPE}`, [prId, diretto]),
  ]);

  const t = (totTraffico as unknown as readonly Partial<RigaConti>[])[0];
  const r = (totRichieste as unknown as readonly Partial<RigaConti>[])[0];
  const totale = daRiga({ ...(t ?? {}), ...(r ?? {}) });

  const serie: Partial<Record<Periodo, readonly PuntoSerie[]>> = {};

  for (const periodo of Object.keys(PUNTI) as Periodo[]) {
    const { unita, quanti } = PUNTI[periodo];

    const righe = (await sql.query(
      `WITH serie AS (
         SELECT generate_series(
           date_trunc($3, $5::date::timestamp) - (($4::int - 1) * ('1 ' || $3)::interval),
           date_trunc($3, $5::date::timestamp),
           ('1 ' || $3)::interval
         )::date AS inizio
       )
       SELECT to_char(s.inizio, 'YYYY-MM-DD') AS inizio,
              COALESCE(t.visite, 0) AS visite, COALESCE(t.nuove, 0) AS nuove,
              COALESCE(t.iniziati, 0) AS iniziati, COALESCE(t.inviati, 0) AS inviati,
              COALESCE(q.in_attesa, 0) AS in_attesa, COALESCE(q.confermate, 0) AS confermate,
              COALESCE(q.rifiutate, 0) AS rifiutate
       FROM serie s
       LEFT JOIN (
         SELECT date_trunc($3, giorno::timestamp)::date AS b, ${CONTI_TRAFFICO}
         FROM traffico WHERE ${SCOPE} GROUP BY 1
       ) t ON t.b = s.inizio
       LEFT JOIN (
         SELECT date_trunc($3, (creata_alle AT TIME ZONE 'Europe/Rome')::date::timestamp)::date AS b, ${CONTI_RICHIESTE}
         FROM richieste WHERE ${SCOPE} GROUP BY 1
       ) q ON q.b = s.inizio
       ORDER BY s.inizio`,
      [prId, diretto, unita, quanti, oggi],
    )) as unknown as readonly (RigaConti & { readonly inizio: string })[];

    serie[periodo] = righe.map((x) => ({ inizio: x.inizio, ...daRiga(x) }));
  }

  const completa = serie as Record<Periodo, readonly PuntoSerie[]>;
  const ultimo = (p: Periodo): Conti => completa[p][completa[p].length - 1] ?? VUOTI;

  return {
    totale,
    corrente: { giorno: ultimo("giorno"), settimana: ultimo("settimana"), mese: ultimo("mese") },
    serie: completa,
  };
}

export interface ConOrigine extends Conti {
  /** "diretto", il codice di un canale ("ig", "s", "tt", "wa") oppure "pr". */
  readonly origine: string;
}

/** Da dove arrivano le visite e i moduli: un canale per riga. Solo per Luca: è sempre tutto il sito. */
export async function trafficoPerOrigine(): Promise<readonly ConOrigine[]> {
  const sql = await db();
  const righe = (await sql.query(
    `SELECT origine, ${CONTI_TRAFFICO} FROM traffico GROUP BY origine ORDER BY COUNT(*) FILTER (WHERE evento = 'visita') DESC, origine`,
  )) as unknown as readonly (Partial<RigaConti> & { readonly origine: string })[];

  return righe.map((x) => ({ origine: x.origine, ...daRiga(x) }));
}

export interface ConPr extends Conti {
  readonly id: string;
  readonly nome: string;
  readonly codice: string;
  readonly attivo: boolean;
}

/** Il quadro di ogni PR, uno per riga, anche quelli spenti. Solo per Luca. */
export async function trafficoPerPr(): Promise<readonly ConPr[]> {
  const sql = await db();
  const righe = (await sql.query(
    `SELECT p.id, p.nome, p.codice, p.attivo,
            COALESCE(t.visite, 0) AS visite, COALESCE(t.nuove, 0) AS nuove,
            COALESCE(t.iniziati, 0) AS iniziati, COALESCE(t.inviati, 0) AS inviati,
            COALESCE(q.in_attesa, 0) AS in_attesa, COALESCE(q.confermate, 0) AS confermate,
            COALESCE(q.rifiutate, 0) AS rifiutate
     FROM pr p
     LEFT JOIN (SELECT pr_id, ${CONTI_TRAFFICO} FROM traffico WHERE pr_id IS NOT NULL GROUP BY pr_id) t ON t.pr_id = p.id
     LEFT JOIN (SELECT pr_id, ${CONTI_RICHIESTE} FROM richieste WHERE pr_id IS NOT NULL GROUP BY pr_id) q ON q.pr_id = p.id
     ORDER BY p.nome`,
  )) as unknown as readonly (Partial<RigaConti> & {
    readonly id: string;
    readonly nome: string;
    readonly codice: string;
    readonly attivo: boolean;
  })[];

  return righe.map((x) => ({ id: x.id, nome: x.nome, codice: x.codice, attivo: x.attivo, ...daRiga(x) }));
}
