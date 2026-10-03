import type { NotteSerata } from "@/lib/calendario-serate";

/**
 * Il prezzo del braccialetto, dove c'è: solo venerdì e sabato, e solo sabato
 * cambia fra donna e uomo. Le altre notti si definisce su WhatsApp come per
 * lista e tavolo, perché il prezzo non c'è ancora.
 *
 * Un posto solo: lo leggono il modulo e le pagine delle serate.
 */
export function prezzoBraccialetto(notte: NotteSerata | undefined, genere: string): string | null {
  if (notte === "venerdi") {
    return "25 € a testa, con 2 drink inclusi.";
  }
  if (notte === "sabato") {
    return genere === "Uomo"
      ? "30 € a testa, con 2 drink inclusi."
      : genere === "Donna"
        ? "25 € a testa, con 2 drink inclusi."
        : "25 € donna, 30 € uomo, con 2 drink inclusi."; // "Misti", o ancora da scegliere
  }
  return null;
}
