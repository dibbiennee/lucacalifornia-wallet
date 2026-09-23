import type { StatoRichiesta } from "@/lib/pannello/dati";

import stili from "./Etichetta.module.css";

/**
 * La pillola che dice a che punto è una richiesta.
 *
 * Sta sempre a sinistra o accanto al nome, mai larga quanto la riga: è
 * un'informazione, non un pulsante, e larga sembrerebbe toccabile.
 */

const PER_STATO: Readonly<Record<StatoRichiesta, readonly [string, string]>> = {
  nuova: ["nuova", "Nuova"],
  confermata: ["confermata", "Confermata"],
  "in attesa": ["attesa", "In attesa"],
  rifiutata: ["rifiutata", "Rifiutata"],
};

export function Etichetta({ stato }: { readonly stato: StatoRichiesta }) {
  const [classe, testo] = PER_STATO[stato];
  return <span className={`${stili.etichetta} ${stili[classe]}`}>{testo}</span>;
}

/** L'etichetta della serata in corso, che non è lo stato di una richiesta. */
export function EtichettaInCorso() {
  return <span className={`${stili.etichetta} ${stili.corso}`}>In corso</span>;
}
