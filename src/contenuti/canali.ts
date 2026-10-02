/**
 * I percorsi corti che dicono da dove arriva la gente.
 *
 * Luca mette /ig nella bio di Instagram, /s nelle storie, /tiktok nel
 * profilo TikTok. Chi apre uno di quegli indirizzi viene portato sulla home
 * pulita, ma il sito si ricorda da dove è entrato e lo allega alla richiesta
 * quando prenota (e al conteggio delle visite).
 *
 * I PR hanno un'altra strada: il loro link permanente è /pr/<codice>, una
 * pagina vera con il solo modulo. Il vecchio /<codice> resta, ma solo come
 * rimando a /pr/<codice>: non lascia nessun biscotto, e l'attribuzione della
 * richiesta al PR la decide il server dal codice della pagina da cui parte il
 * modulo, mai da un valore che manda il browser.
 *
 * I canali generici restano fissi nel codice: non cambiano mai. I PR invece
 * vivono nel database (vedi src/lib/db.ts): Luca ne crea, ne spegne e ne
 * rinomina il codice dal pannello, senza toccare il codice e distribuire di
 * nuovo il sito.
 *
 * L'elenco dei canali generici è chiuso apposta: un indirizzo non previsto,
 * e che non è nemmeno un PR attivo, deve dare pagina non trovata, altrimenti
 * qualsiasi parola dopo la barra diventerebbe un canale e i conteggi si
 * riempirebbero di spazzatura.
 */

import { db } from "@/lib/db";

export interface Canale {
  readonly codice: string;
  /** Come compare nelle richieste e nel pannello. */
  readonly nome: string;
  /** Gli altri indirizzi che portano allo stesso canale. */
  readonly anche?: readonly string[];
}

export const CANALI: readonly Canale[] = [
  { codice: "ig", nome: "Bio Instagram", anche: ["instagram"] },
  { codice: "s", nome: "Storie Instagram", anche: ["storie", "storiainstagram"] },
  { codice: "tt", nome: "TikTok", anche: ["tiktok"] },
  { codice: "wa", nome: "WhatsApp", anche: ["whatsapp"] },
];

/**
 * Le parole che un PR non può prendere come codice: i canali (che hanno la
 * precedenza), le pagine del sito e le cartelle che il sito serve. Un PR che si
 * chiamasse "Serate" avrebbe un link che non funziona mai.
 */
export const CODICI_RISERVATI: ReadonlySet<string> = new Set([
  ...CANALI.flatMap((c) => [c.codice, ...(c.anche ?? [])]),
  "pr",
  "pannello",
  "api",
  "serate",
  "tavoli",
  "prenota",
  "navetta",
  "capodanno",
  "chisono",
  "cookie",
  "privacy",
  "diventapr",
  "biglietto",
  "staff",
  "robots",
  "sitemap",
  "manifest",
  "llms",
  "favicon",
  "video",
  "foto",
  "next",
]);

/** Il nome del biscotto che si porta dietro la provenienza (solo i canali). */
export const BISCOTTO_PROVENIENZA = "da";

/** Trenta giorni: chi vede una storia oggi può prenotare fra due settimane. */
export const DURATA_PROVENIENZA = 30 * 24 * 60 * 60;

export interface PrAttivo {
  readonly id: string;
  readonly codice: string;
  readonly nome: string;
}

/** Il PR con quel codice, SE è attivo: uno spento è come se non esistesse, per chi apre il link. */
export async function prAttivoPerCodice(codice: string): Promise<PrAttivo | null> {
  if (typeof codice !== "string" || codice === "" || codice.length > 40) {
    return null;
  }

  const sql = await db();
  const righe = (await sql`
    SELECT id, codice, nome FROM pr WHERE codice = ${codice.toLowerCase()} AND attivo
  `) as unknown as PrAttivo[];

  return righe[0] ?? null;
}

export type Percorso =
  | { readonly tipo: "canale"; readonly valore: string; readonly nome: string }
  | { readonly tipo: "pr"; readonly codice: string };

export async function riconosci(percorso: string): Promise<Percorso | null> {
  const pulito = percorso.toLowerCase();

  for (const canale of CANALI) {
    if (canale.codice === pulito || canale.anche?.includes(pulito) === true) {
      return { tipo: "canale", valore: canale.codice, nome: canale.nome };
    }
  }

  const pr = await prAttivoPerCodice(pulito);
  return pr === null ? null : { tipo: "pr", codice: pr.codice };
}

/** Da "ig" a "Bio Instagram", per chi legge il pannello. Un valore non riconosciuto (o vuoto) è "Diretto". */
export function nomeProvenienza(valore: string | undefined): string {
  if (valore === undefined || valore === "") {
    return "Diretto";
  }

  const pulito = valore.toLowerCase();
  const canale = CANALI.find((c) => c.codice === pulito || c.anche?.includes(pulito) === true);
  return canale === undefined ? "Diretto" : canale.nome;
}

/** Il codice di un canale, se il biscotto ne porta uno valido; altrimenti null. */
export function canaleDaBiscotto(valore: string | undefined): string | null {
  if (valore === undefined) {
    return null;
  }

  const pulito = valore.toLowerCase();
  return CANALI.find((c) => c.codice === pulito || c.anche?.includes(pulito) === true)?.codice ?? null;
}
