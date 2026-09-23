import { legaParole } from "@/lib/tipografia";

import type { RichiestaPannello } from "./dati";

/**
 * Le frasi composte a partire da una richiesta.
 *
 * Stanno qui e non dentro le schermate perché le stesse parole compaiono in
 * più posti: se il riassunto cambia, deve cambiare dappertutto insieme.
 *
 * Escono già con gli spazi indivisibili al posto giusto: in una card stretta
 * "35–50 € a testa" andava a capo fra "a" e "testa".
 */

/** Lega le parole brevi ma non l'ultima: sono righe, non paragrafi. */
const lega = (t: string): string => legaParole(t, { vedova: false });

function unisci(pezzi: readonly (string | null | undefined)[]): string {
  return lega(pezzi.filter((p) => p !== null && p !== undefined && p !== "").join(", "));
}

/** "Sabato, Sala 2, tavolo misto, 35–50 € a testa" */
export function riassunto(r: RichiestaPannello): string {
  return unisci([
    r.serata,
    r.sala,
    r.tipo === "tavolo" ? `tavolo ${(r.gruppo ?? "").toLowerCase()}`.trim() : "lista",
    r.budget === undefined ? null : `${r.budget} a testa`,
  ]);
}

/** "Misto, 35–50 € a testa, compleanno": quello che serve sapere al tavolo. */
export function dettaglioTavolo(r: RichiestaPannello): string {
  return unisci([
    r.gruppo,
    r.budget === undefined ? null : `${r.budget} a testa`,
    r.occasione?.toLowerCase(),
  ]);
}

/** "Sabato, Sala 2" */
export function serataSala(r: RichiestaPannello): string {
  return unisci([r.serata, r.sala]);
}

/** Come finisce scritto sul biglietto: "TAVOLO, MISTO" oppure "LISTA". */
export function tipoBiglietto(r: RichiestaPannello): string {
  return r.tipo === "tavolo" ? `TAVOLO, ${(r.gruppo ?? "").toUpperCase()}` : "LISTA";
}

/** "Tavolo, misto" oppure "Lista", per la riga sotto il nome. */
export function tipoEsteso(r: RichiestaPannello): string {
  return r.tipo === "tavolo" ? `Tavolo, ${(r.gruppo ?? "").toLowerCase()}` : "Lista";
}
