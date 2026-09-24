import { DATI_DI_ESEMPIO } from "@/lib/pannello/dati";
import { legaParole } from "@/lib/tipografia";

import stili from "./Messaggi.module.css";

/**
 * Le righe che spiegano invece di far finta di niente.
 *
 * Tutte passano dalla legatura delle parole brevi: su uno schermo stretto
 * una riga non deve chiudersi su "la", "di" o "un", e l'ultima riga non deve
 * restare con una parola sola.
 */

type Frase = string | readonly string[];

/** Il testo arriva spezzato quando dentro c'è un valore: si rimette insieme. */
const insieme = (c: Frase): string => (typeof c === "string" ? c : c.join(""));

/** Un paragrafo del pannello. */
export function Testo({ children }: { readonly children: Frase }) {
  return <p className="testo">{legaParole(insieme(children), { vedova: true })}</p>;
}

/** Lo stesso, piccolo: le note in fondo alle schermate. */
export function TestoPiccolo({ children }: { readonly children: Frase }) {
  return <p className="testo-piccolo">{legaParole(insieme(children), { vedova: true })}</p>;
}

/** L'elenco vuoto. La frase dice cosa comparirà qui, non "nessun risultato". */
export function Vuoto({ children }: { readonly children: Frase }) {
  return <p className={stili.vuoto}>{legaParole(insieme(children), { vedova: true })}</p>;
}

/** Finché i dati non sono veri, la schermata lo dichiara. Una riga, non un muro. */
export function NotaEsempio() {
  return DATI_DI_ESEMPIO ? <p className={stili.esempio}>Dati di esempio</p> : null;
}

/** L'avviso in testa a quello che non fa parte di quanto concordato. */
export function AvvisoExtra({ children }: { readonly children: Frase }) {
  return <p className={stili.extra}>{legaParole(insieme(children), { vedova: true })}</p>;
}
