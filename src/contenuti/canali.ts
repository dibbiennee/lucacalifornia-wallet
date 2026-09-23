/**
 * I percorsi corti che dicono da dove arriva la gente.
 *
 * Luca mette /ig nella bio di Instagram, /s nelle storie, /tiktok nel
 * profilo TikTok, e a ogni PR dà il suo nome. Chi apre uno di quei
 * indirizzi viene portato sulla home pulita, ma il sito si ricorda da dove
 * è entrato e lo allega alla richiesta quando prenota.
 *
 * L'elenco è chiuso apposta: un indirizzo non previsto deve dare pagina non
 * trovata, altrimenti qualsiasi parola dopo la barra diventerebbe un canale
 * e i conteggi si riempirebbero di spazzatura.
 */

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

/** I PR della squadra: ognuno ha il suo link personale. */
export const PR: readonly Canale[] = [
  { codice: "marco", nome: "Marco" },
  { codice: "sara", nome: "Sara" },
  { codice: "davide", nome: "Davide" },
];

/** Il nome del biscotto che si porta dietro la provenienza. */
export const BISCOTTO_PROVENIENZA = "da";

/** Trenta giorni: chi vede una storia oggi può prenotare fra due settimane. */
export const DURATA_PROVENIENZA = 30 * 24 * 60 * 60;

export function riconosci(percorso: string): { readonly valore: string; readonly nome: string } | null {
  const pulito = percorso.toLowerCase();

  for (const canale of CANALI) {
    if (canale.codice === pulito || canale.anche?.includes(pulito) === true) {
      return { valore: canale.codice, nome: canale.nome };
    }
  }

  for (const pr of PR) {
    if (pr.codice === pulito) {
      return { valore: `pr:${pr.codice}`, nome: `Link di ${pr.nome}` };
    }
  }

  return null;
}

/** Da "pr:marco" a "Link di Marco", per chi legge il pannello. */
export function nomeProvenienza(valore: string | undefined): string {
  if (valore === undefined || valore === "") {
    return "Diretto";
  }

  const trovato = riconosci(valore.startsWith("pr:") ? valore.slice(3) : valore);
  return trovato === null ? "Diretto" : trovato.nome;
}
