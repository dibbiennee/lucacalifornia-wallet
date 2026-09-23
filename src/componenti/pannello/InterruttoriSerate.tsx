"use client";

import { useState } from "react";

import { cambiaEtichetta } from "@/app/pannello/azioni";
import type { EtichettaSerata, SerataPannello } from "@/lib/pannello/dati";

import { Avviso } from "./Avviso";
import { Riquadro, Scelta, VoceScelta } from "./Scelta";

const ETICHETTE: readonly EtichettaSerata[] = ["Lista aperta", "Pochi tavoli", "Tutto pieno"];

/**
 * Le etichette che la gente vede sul sito, una per serata.
 *
 * Il cambio si vede subito a schermo e poi viene salvato: chi tocca non deve
 * aspettare il server per sapere di aver toccato. L'avviso dice com'e'
 * andata, e finche' non c'e' il database dice anche che non e' arrivata al
 * sito, invece di lasciarlo credere.
 */
export function InterruttoriSerate({ serate }: { readonly serate: readonly SerataPannello[] }) {
  const [scelte, setScelte] = useState<Record<string, EtichettaSerata>>(
    Object.fromEntries(serate.map((s) => [s.codice, s.etichetta])),
  );
  const [avviso, setAvviso] = useState("");

  async function scegli(serata: SerataPannello, etichetta: EtichettaSerata) {
    setScelte((prima) => ({ ...prima, [serata.codice]: etichetta }));

    try {
      setAvviso(await cambiaEtichetta(serata.codice, etichetta, serata.nome));
    } catch {
      // Torna com'era: meglio vedere il vecchio valore che crederne uno falso.
      setScelte((prima) => ({ ...prima, [serata.codice]: serata.etichetta }));
      setAvviso("Non sono riuscito a cambiarla, riprova");
    }
  }

  return (
    <>
      {serate.map((serata) => (
        <Riquadro key={serata.codice} titolo={serata.nome} id={`serata-${serata.codice}`}>
          <Scelta etichettatoDa={`serata-${serata.codice}`}>
            {ETICHETTE.map((etichetta) => (
              <VoceScelta
                key={etichetta}
                testo={etichetta}
                scelta={scelte[serata.codice] === etichetta}
                premi={() => void scegli(serata, etichetta)}
              />
            ))}
          </Scelta>
        </Riquadro>
      ))}

      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </>
  );
}
