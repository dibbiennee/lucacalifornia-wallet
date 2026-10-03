import { trovaPaese } from "@/contenuti/prefissi";

/**
 * Il numero di telefono, in un posto solo.
 *
 * Lo leggono il browser (per dire "manca ancora qualcosa") e il server (per
 * salvarlo e per costruire il link WhatsApp): se le regole stessero in due
 * posti diventerebbero due regole diverse. Niente DOM né API di Node qui dentro.
 *
 * Un numero può arrivare in due modi:
 *  - con il prefisso internazionale ("+44 7911 123456", o "0044 7911 123456"):
 *    è già completo, non si aggiunge niente;
 *  - senza prefisso ("333 123 4567"): è italiano, come è sempre stato.
 */

/** Il numero come lo manda il modulo: "+39 333 123 4567". */
export function telefonoCompleto(iso: string, numero: string): string {
  const cifre = numero.replace(/\D/g, "");
  return cifre === "" ? "" : `+${trovaPaese(iso).prefisso} ${numero.trim()}`;
}

/**
 * Da quello che ha scritto la persona alle sole cifre, col prefisso (393331234567),
 * che è la forma per confrontare, cercare e costruire il link WhatsApp.
 * Null se non somiglia a un telefono.
 */
export function normalizzaTelefono(testo: string): string | null {
  const pulito = testo.trim();
  const internazionale = pulito.startsWith("+") || pulito.startsWith("00");
  let cifre = pulito.replace(/\D/g, "");

  if (pulito.startsWith("00")) {
    cifre = cifre.slice(2);
  }

  if (internazionale) {
    // Con il prefisso scritto, nessun 39 in più: un numero islandese di 7 cifre col 354 ne ha 10 in tutto.
    return cifre.length >= 8 && cifre.length <= 15 ? cifre : null;
  }

  if (cifre.length < 9 || cifre.length > 15) {
    return null;
  }

  // Senza prefisso (da 9 a 10 cifre) è un numero italiano e prende il 39. Conta la lunghezza, non l'inizio:
  // un cellulare come 393 123 4567 comincia per 39 ma è un numero senza prefisso, mentre col prefisso ne ha 12.
  return cifre.length <= 10 ? `39${cifre}` : cifre;
}

/**
 * Basta per il modulo mentre si scrive: quante cifre mancano al numero nazionale.
 * Dopo un prefisso "+39" servono almeno 9 cifre; per gli altri paesi almeno 6
 * (i numeri più corti, come quelli islandesi, ne hanno 7).
 */
export function cifreMinime(iso: string): number {
  return iso === "IT" ? 9 : 6;
}
