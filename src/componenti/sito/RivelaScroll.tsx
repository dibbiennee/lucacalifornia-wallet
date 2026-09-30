"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Aggiunge ".visibile" agli elementi ".rivela" appena entrano a schermo:
 * senza, le sezioni comparivano già ferme, tutte insieme, e la pagina
 * sembrava statica anche scorrendo. Chi ha chiesto meno movimento non
 * vede nessuna differenza: ".rivela" senza ".visibile" in quel caso non
 * nasconde niente (vedi sito.css).
 *
 * Il percorso è nelle dipendenze apposta: senza, l'osservatore restava
 * quello nato al primo caricamento, che conosceva solo gli elementi di
 * allora. Cambiando pagina lato client (anche tornando indietro) le
 * sezioni della pagina nuova non venivano mai osservate, e restavano
 * invisibili per sempre: sembrava che "sparissero".
 */
export function RivelaScroll() {
  const percorso = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elementi = document.querySelectorAll(".rivela:not(.visibile)");
    if (elementi.length === 0) {
      return;
    }

    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (!voce.isIntersecting) continue;
          voce.target.classList.add("visibile");
          osservatore.unobserve(voce.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    elementi.forEach((elemento) => osservatore.observe(elemento));
    return () => osservatore.disconnect();
  }, [percorso]);

  return null;
}
