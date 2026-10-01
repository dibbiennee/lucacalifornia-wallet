/**
 * I percorsi corti che dicono da dove arriva la gente.
 *
 * Luca mette /ig nella bio di Instagram, /s nelle storie, /tiktok nel
 * profilo TikTok, e a ogni PR dà il suo nome. Chi apre uno di quei
 * indirizzi viene portato sulla home pulita (i PR, dritti al modulo), ma il
 * sito si ricorda da dove è entrato e lo allega alla richiesta quando
 * prenota.
 *
 * I canali generici restano fissi nel codice: sono quattro, non cambiano
 * mai. I PR invece vivono nel database (vedi src/lib/db.ts): "Aggiungi PR"
 * dal pannello ne crea uno vero, con un link che funziona subito, senza
 * bisogno di toccare il codice e distribuire di nuovo il sito.
 *
 * L'elenco dei canali generici è chiuso apposta: un indirizzo non previsto,
 * e che non è nemmeno un PR vero, deve dare pagina non trovata, altrimenti
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
  { codice: "s", nome: "Storie Instagram", anche: ["storie"] },
  { codice: "tt", nome: "TikTok", anche: ["tiktok"] },
  { codice: "wa", nome: "WhatsApp", anche: ["whatsapp"] },
];

/** Il nome del biscotto che si porta dietro la provenienza. */
export const BISCOTTO_PROVENIENZA = "da";

/** Trenta giorni: chi vede una storia oggi può prenotare fra due settimane. */
export const DURATA_PROVENIENZA = 30 * 24 * 60 * 60;

interface RigaPr {
  readonly codice: string;
  readonly nome: string;
}

/** Il PR con quel codice, o null se non esiste. */
async function prConCodice(codice: string): Promise<RigaPr | null> {
  const sql = await db();
  const righe = (await sql`SELECT codice, nome FROM pr WHERE codice = ${codice}`) as unknown as RigaPr[];
  return righe[0] ?? null;
}

export async function riconosci(percorso: string): Promise<{ readonly valore: string; readonly nome: string } | null> {
  const pulito = percorso.toLowerCase();

  for (const canale of CANALI) {
    if (canale.codice === pulito || canale.anche?.includes(pulito) === true) {
      return { valore: canale.codice, nome: canale.nome };
    }
  }

  const pr = await prConCodice(pulito);
  return pr === null ? null : { valore: `pr:${pr.codice}`, nome: `Link di ${pr.nome}` };
}

/** Da "pr:marco" a "Link di Marco", per chi legge il pannello. */
export async function nomeProvenienza(valore: string | undefined): Promise<string> {
  if (valore === undefined || valore === "") {
    return "Diretto";
  }

  const trovato = await riconosci(valore.startsWith("pr:") ? valore.slice(3) : valore);
  return trovato === null ? "Diretto" : trovato.nome;
}
