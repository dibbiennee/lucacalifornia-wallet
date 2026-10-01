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

/** Es. "tavolo misto", "lista", "navetta da Trastevere", "braccialetto donna". */
function tipoBreve(r: RichiestaPannello): string {
  if (r.tipo === "tavolo") {
    return `tavolo ${(r.gruppo ?? "").toLowerCase()}`.trim();
  }
  if (r.tipo === "navetta") {
    return r.zona === undefined ? "navetta" : `navetta da ${r.zona}`;
  }
  if (r.tipo === "braccialetto") {
    return `bracciale ${(r.gruppo ?? "").toLowerCase()}`.trim();
  }
  return "lista";
}

/** "4 persone", o "1 persona" al singolare. */
function persone(r: RichiestaPannello): string | null {
  if (r.persone === undefined) {
    return null;
  }
  return r.persone === "1" ? "1 persona" : `${r.persone} persone`;
}

/** "Sabato, Sala 2, tavolo misto, 4 persone, 35–50 € a testa" */
export function riassunto(r: RichiestaPannello): string {
  return unisci([
    r.serata,
    r.sala,
    tipoBreve(r),
    persone(r),
    r.budget === undefined ? null : `${r.budget} a testa`,
  ]);
}

/** "Misto, 4 persone, 35–50 € a testa, compleanno": quello che serve sapere al tavolo. */
export function dettaglioTavolo(r: RichiestaPannello): string {
  return unisci([
    r.gruppo,
    persone(r),
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
  if (r.tipo === "tavolo") {
    return `TAVOLO, ${(r.gruppo ?? "").toUpperCase()}`;
  }
  if (r.tipo === "navetta") {
    return "NAVETTA";
  }
  if (r.tipo === "braccialetto") {
    return `BRACCIALE, ${(r.gruppo ?? "").toUpperCase()}`;
  }
  return "LISTA";
}

/** "Tavolo, misto" oppure "Lista", per la riga sotto il nome. */
export function tipoEsteso(r: RichiestaPannello): string {
  if (r.tipo === "tavolo") {
    return `Tavolo, ${(r.gruppo ?? "").toLowerCase()}`;
  }
  if (r.tipo === "navetta") {
    return r.zona === undefined ? "Navetta" : `Navetta, ${r.zona.toLowerCase()}`;
  }
  if (r.tipo === "braccialetto") {
    return `Bracciale, ${(r.gruppo ?? "").toLowerCase()}`;
  }
  return "Lista";
}
