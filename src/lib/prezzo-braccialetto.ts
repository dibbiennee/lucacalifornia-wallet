import type { NotteSerata } from "@/lib/calendario-serate";

/**
 * I prezzi del braccialetto, in numeri: solo venerdì e sabato, e solo sabato
 * cambia fra donna e uomo. Le altre notti non c'è un prezzo confermato: si
 * definisce su WhatsApp come per lista e tavolo.
 *
 * Un posto solo: li leggono il modulo, le pagine delle serate e il chatbot.
 */
export const PREZZI_BRACCIALETTO = {
  venerdi: { donna: 25, uomo: 25 },
  sabato: { donna: 25, uomo: 30 },
} as const;

export const DRINK_INCLUSI = 2;

export function prezzoBraccialetto(notte: NotteSerata | undefined, genere: string): string | null {
  if (notte === "venerdi") {
    return `${PREZZI_BRACCIALETTO.venerdi.donna} € a testa, con ${DRINK_INCLUSI} drink inclusi.`;
  }
  if (notte === "sabato") {
    const { donna, uomo } = PREZZI_BRACCIALETTO.sabato;
    return genere === "Uomo"
      ? `${uomo} € a testa, con ${DRINK_INCLUSI} drink inclusi.`
      : genere === "Donna"
        ? `${donna} € a testa, con ${DRINK_INCLUSI} drink inclusi.`
        : `${donna} € donna, ${uomo} € uomo, con ${DRINK_INCLUSI} drink inclusi.`; // "Misti", o ancora da scegliere
  }
  return null;
}
