import type { ReactNode } from "react";

import { BarraPrenota } from "@/componenti/sito/BarraPrenota";
import { PiePagina } from "@/componenti/sito/PiePagina";
import { Testata } from "@/componenti/sito/Testata";
import { carattere } from "@/lib/carattere";

import "@/stili/sito.css";

/**
 * Il guscio del sito: testata in alto, barra in basso, piè di pagina.
 *
 * Il carattere è lo stesso del pannello, istanziato una volta sola: sito e
 * strumento sono due facce della stessa cosa, e chi passa dall'uno all'altro
 * non deve accorgersi di un cambio di mondo.
 */
export default function LayoutSito({ children }: { children: ReactNode }) {
  return (
    <div className={`sito ${carattere.variable}`}>
      <Testata />
      <main id="principale">{children}</main>
      <PiePagina />
      <BarraPrenota />
    </div>
  );
}
