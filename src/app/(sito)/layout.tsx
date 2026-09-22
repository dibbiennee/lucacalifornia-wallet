import type { ReactNode } from "react";

import { BarraFissa } from "@/componenti/BarraFissa";
import { Intestazione } from "@/componenti/Intestazione";
import { PiePagina } from "@/componenti/PiePagina";

/**
 * Il guscio del sito: intestazione, piè di pagina e barra fissa.
 * Le pagine del prototipo del biglietto stanno fuori da questo gruppo,
 * perché non sono sito: sono strumenti.
 */
export default function LayoutSito({ children }: { children: ReactNode }) {
  return (
    <>
      <Intestazione />
      {children}
      <PiePagina />
      <BarraFissa />
    </>
  );
}
