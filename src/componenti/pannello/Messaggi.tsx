import { DATI_DI_ESEMPIO } from "@/lib/pannello/dati";

import stili from "./Messaggi.module.css";

/**
 * Le tre righe che spiegano invece di far finta di niente.
 */

/** L'elenco vuoto. La frase dice cosa comparirà qui, non "nessun risultato". */
export function Vuoto({ children }: { readonly children: string }) {
  return <p className={stili.vuoto}>{children}</p>;
}

/** Finché i dati non sono veri, la schermata lo dichiara. Una riga, non un muro. */
export function NotaEsempio() {
  return DATI_DI_ESEMPIO ? <p className={stili.esempio}>Dati di esempio</p> : null;
}

/** L'avviso in testa a quello che non fa parte di quanto concordato. */
export function AvvisoExtra({ children }: { readonly children: string }) {
  return <p className={stili.extra}>{children}</p>;
}
