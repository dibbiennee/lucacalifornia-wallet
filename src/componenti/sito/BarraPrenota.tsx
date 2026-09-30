"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Bottone } from "./Bottone";
import stili from "./BarraPrenota.module.css";

/**
 * La barra in basso: un solo invito, sempre a portata di pollice.
 *
 * In home resta nascosta sull'apertura, dove i due pulsanti dell'hero fanno
 * già il loro lavoro: sbuca appena la sezione "Le serate" comincia a
 * comparire dal basso, e torna a sparire se si risale sopra di lei. Nelle
 * altre pagine, dove l'apertura non c'è, resta sempre visibile.
 *
 * Sulla pagina del modulo sparisce del tutto: sei già arrivato.
 */
export function BarraPrenota() {
  const percorso = usePathname();
  const inHome = percorso === "/";
  const [visibile, setVisibile] = useState(!inHome);

  useEffect(() => {
    if (!inHome) {
      return;
    }

    const serate = document.getElementById("le-serate");
    if (serate === null) {
      return;
    }

    const osservatore = new IntersectionObserver(
      ([voce]) => setVisibile(voce !== undefined && voce.isIntersecting)
    );

    osservatore.observe(serate);
    return () => osservatore.disconnect();
  }, [inHome]);

  if (percorso === "/prenota") {
    return null;
  }

  return (
    <div className={`${stili.barra} ${visibile ? "" : stili.nascosta}`}>
      <Bottone href="/prenota" pieno>
        Prenota la tua serata
      </Bottone>
    </div>
  );
}
