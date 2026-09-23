/**
 * Un interruttore solo per passare da anteprima a sito vero.
 *
 * Finché SITO_PUBBLICO non vale 1, il sito dice a tutti di non indicizzarlo:
 * lo dicono insieme i metadati delle pagine e robots.txt. Tenerli legati a
 * una variabile sola evita il caso peggiore, cioè togliere il noindex dalle
 * pagine e lasciare robots.txt che blocca tutto.
 */
export const SITO_PUBBLICO = process.env["SITO_PUBBLICO"] === "1";

/** L'indirizzo del sito, usato per i link assoluti di condivisione. */
export const INDIRIZZO = process.env["INDIRIZZO_SITO"] ?? "https://lucacalifornia.satoshiweb.it";
