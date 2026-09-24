import { Archivo } from "next/font/google";

/**
 * Archivo variabile, con l'asse della larghezza.
 *
 * Sta qui e non dentro un layout perché lo usano tutti: il sito, il
 * pannello, la pagina del biglietto e il lettore dello staff. Istanziarlo
 * una volta sola evita che Next scarichi più copie dello stesso file.
 */
export const carattere = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--carattere",
});
