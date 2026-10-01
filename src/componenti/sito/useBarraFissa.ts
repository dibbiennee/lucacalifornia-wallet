"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Se la barra "Prenota la tua serata" è visibile in questo momento.
 *
 * Condivisa fra BarraPrenota e il cerchietto della chat: devono muoversi
 * insieme, non ognuno per conto suo con la sua osservazione della pagina.
 *
 * DUE REGOLE, NON UNA.
 *
 * 1. La soglia: in home resta nascosta finché non si arriva con il fondo
 *    dello schermo alla testata di "Le serate". Qui serve la posizione vera,
 *    non "è visibile adesso": un IntersectionObserver sulla sola testata
 *    tornava a nascondere la barra scorrendo più giù (quando la testata,
 *    bassa e stretta, usciva a sua volta dalla vista) e un osservatore che
 *    si staccava al primo scatto la lasciava accesa anche tornando su,
 *    dentro l'apertura, dove non deve esserci. Calcolando a ogni scroll se
 *    il bordo sopra della testata ha superato il fondo dello schermo si
 *    risolve tutto insieme: resta nascosta finché non ci si arriva, resta
 *    accesa anche quando la testata è ormai sopra lo schermo, e torna a
 *    nascondersi se si risale sopra quel punto. Nelle altre pagine, dove
 *    quella testata non c'è, la soglia è sempre superata.
 *
 * 2. La sovrapposizione: alcune pagine hanno già un pulsante che dice la
 *    stessa cosa ("Prenota il tavolo", "Entra in lista"...). Con la barra
 *    sempre accesa sotto, quando quel pulsante scorre vicino al fondo dello
 *    schermo i due finiscono uno sopra l'altro, la stessa scritta ripetuta
 *    due volte senza un filo di spazio. Quei pulsanti portano la classe
 *    "cta-prenota": finché uno è a schermo, la barra si spegne, e torna da
 *    sola appena non lo è più.
 */
export function useBarraFissa(): boolean {
  const percorso = usePathname();
  const inHome = percorso === "/";
  const [oltreSoglia, setOltreSoglia] = useState(!inHome);
  const [sovrapposta, setSovrapposta] = useState(false);

  useEffect(() => {
    if (!inHome) {
      return;
    }

    const testata = document.getElementById("testa-serate");
    if (testata === null) {
      return;
    }

    let programmato = false;

    const calcola = () => {
      programmato = false;
      setOltreSoglia(testata.getBoundingClientRect().top <= window.innerHeight);
    };

    const chiedi = () => {
      if (!programmato) {
        programmato = true;
        requestAnimationFrame(calcola);
      }
    };

    calcola();
    window.addEventListener("scroll", chiedi, { passive: true });
    window.addEventListener("resize", chiedi);

    return () => {
      window.removeEventListener("scroll", chiedi);
      window.removeEventListener("resize", chiedi);
    };
  }, [inHome]);

  useEffect(() => {
    const pulsanti = document.querySelectorAll(".cta-prenota");
    if (pulsanti.length === 0) {
      setSovrapposta(false);
      return;
    }

    const osservatore = new IntersectionObserver((voci) => {
      setSovrapposta(voci.some((v) => v.isIntersecting));
    });

    pulsanti.forEach((p) => osservatore.observe(p));
    return () => osservatore.disconnect();
  }, [percorso]);

  return oltreSoglia && !sovrapposta;
}
