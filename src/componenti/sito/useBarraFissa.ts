"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Se la barra "Prenota la tua serata" è visibile in questo momento.
 *
 * Condivisa fra BarraPrenota e il cerchietto della chat: devono muoversi
 * insieme, non ognuno per conto suo con la sua osservazione della pagina.
 *
 * In home resta falsa finché non si arriva con il fondo dello schermo alla
 * testata di "Le serate", poi resta vera per il resto della pagina, comunque
 * lunga: l'osservatore si stacca al primo scatto, apposta, perché se restasse
 * acceso la barra sparirebbe di nuovo appena quella testata (bassa, stretta)
 * esce a sua volta dalla vista scorrendo più giù. Nelle altre pagine, dove
 * quella testata non c'è, è sempre vera.
 */
export function useBarraFissa(): boolean {
  const percorso = usePathname();
  const inHome = percorso === "/";
  const [visibile, setVisibile] = useState(!inHome);

  useEffect(() => {
    if (!inHome) {
      return;
    }

    const testata = document.getElementById("testa-serate");
    if (testata === null) {
      return;
    }

    const osservatore = new IntersectionObserver(([voce]) => {
      if (voce !== undefined && voce.isIntersecting) {
        setVisibile(true);
        osservatore.disconnect();
      }
    });

    osservatore.observe(testata);
    return () => osservatore.disconnect();
  }, [inHome]);

  return visibile;
}
