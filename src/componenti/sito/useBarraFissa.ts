"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Se la barra "Prenota la tua serata" è visibile in questo momento.
 *
 * Condivisa fra BarraPrenota e il cerchietto della chat: devono muoversi
 * insieme, non ognuno per conto suo con la sua osservazione della pagina.
 *
 * In home resta falsa solo sull'apertura, e vera per tutto il resto della
 * pagina, comunque lunga: si agganciava a "Le serate" invece che
 * all'apertura, e più giù, appena quella sezione usciva dalla vista, la barra
 * spariva di nuovo. Nelle altre pagine, dove l'apertura non c'è, è sempre
 * vera.
 */
export function useBarraFissa(): boolean {
  const percorso = usePathname();
  const inHome = percorso === "/";
  const [visibile, setVisibile] = useState(!inHome);

  useEffect(() => {
    if (!inHome) {
      return;
    }

    const apertura = document.getElementById("apertura");
    if (apertura === null) {
      return;
    }

    const osservatore = new IntersectionObserver(
      ([voce]) => setVisibile(voce !== undefined && !voce.isIntersecting)
    );

    osservatore.observe(apertura);
    return () => osservatore.disconnect();
  }, [inHome]);

  return visibile;
}
