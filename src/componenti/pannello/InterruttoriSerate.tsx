"use client";

import { useState } from "react";

import type { EtichettaSerata, SerataPannello } from "@/lib/pannello/dati";

const ETICHETTE: readonly EtichettaSerata[] = ["Lista aperta", "Pochi tavoli", "Tutto pieno"];

/**
 * Gli interruttori delle etichette dal vivo.
 *
 * Funzionano a schermo, ma senza database la scelta non arriva al sito e non
 * resta dopo un aggiornamento della pagina: sotto c'è scritto, invece di far
 * credere il contrario.
 */
export function InterruttoriSerate({ serate }: { readonly serate: readonly SerataPannello[] }) {
  const [scelte, setScelte] = useState<Record<string, EtichettaSerata>>(
    Object.fromEntries(serate.map((s) => [s.codice, s.etichetta])),
  );

  return (
    <>
      {serate.map((serata) => (
        <div key={serata.codice} className="pannello-riquadro">
          <p id={`s-${serata.codice}`} style={{ margin: "0 0 0.7rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            {serata.nome}
          </p>
          <div role="radiogroup" aria-labelledby={`s-${serata.codice}`} style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ETICHETTE.map((etichetta) => {
              const attiva = scelte[serata.codice] === etichetta;
              return (
                <button
                  key={etichetta}
                  type="button"
                  role="radio"
                  aria-checked={attiva}
                  onClick={() => setScelte({ ...scelte, [serata.codice]: etichetta })}
                  className={`scelta${attiva ? " scelta-attiva" : ""}`}
                >
                  {etichetta}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="pannello-nota">
        Gli interruttori si muovono, ma senza database la scelta non arriva al sito e si perde
        aggiornando la pagina.
      </p>
    </>
  );
}
