"use client";

import { useId } from "react";

/**
 * Un gruppo di bottoni a scelta singola.
 *
 * Sono bottoni e non un menu a tendina perché lo chiede il brief, ma per chi
 * usa un lettore di schermo devono comportarsi come i pulsanti di una radio:
 * da qui role="radiogroup" e aria-checked. Senza, si sentono come una fila di
 * bottoni scollegati e non si capisce cosa è selezionato.
 */
export function SceltaSingola({
  etichetta,
  opzioni,
  scelta,
  cambia,
  colonne,
}: {
  readonly etichetta: string;
  readonly opzioni: readonly string[];
  readonly scelta: string;
  readonly cambia: (valore: string) => void;
  readonly colonne?: number;
}) {
  const id = useId();

  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <span className="etichetta-campo" id={id}>
        {etichetta}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={id}
        style={
          colonne === undefined
            ? { display: "flex", flexWrap: "wrap", gap: "0.5rem" }
            : { display: "grid", gridTemplateColumns: `repeat(${colonne}, 1fr)`, gap: "0.5rem" }
        }
      >
        {opzioni.map((opzione) => (
          <button
            key={opzione}
            type="button"
            role="radio"
            aria-checked={scelta === opzione}
            onClick={() => cambia(opzione)}
            className={`scelta${scelta === opzione ? " scelta-attiva" : ""}`}
          >
            {opzione}
          </button>
        ))}
      </div>
    </div>
  );
}
