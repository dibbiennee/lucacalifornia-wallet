"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Le scritte nei riquadri, l'elemento che si ripete in tutte le pagine:
 * un riquadro piccolo e scuro sopra, uno o più riquadri bianchi col titolo
 * grande sotto.
 *
 * Il testo è già nell'HTML che esce dal server. L'animazione aggiunge un
 * rimbalzo quando la sezione entra nello schermo, ma non è lei a far
 * comparire il contenuto: senza javascript si legge lo stesso.
 */
export function Pila({
  occhiello,
  righe,
  scuro = false,
  livello = 2,
}: {
  readonly occhiello?: string;
  readonly righe: readonly string[];
  readonly scuro?: boolean;
  /** 1, 2 o 3: il titolo esce come h1, h2 o h3. L'aspetto non cambia. */
  readonly livello?: 1 | 2 | 3;
}) {
  const Titolo = `h${livello}` as "h1" | "h2" | "h3";
  const rif = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = rif.current;

    if (elemento === null || !("IntersectionObserver" in window)) {
      return;
    }

    const osservatore = new IntersectionObserver(
      (voci) => {
        for (const voce of voci) {
          if (voce.isIntersecting) {
            elemento.classList.add("entrata");
            osservatore.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );

    osservatore.observe(elemento);
    return () => osservatore.disconnect();
  }, []);

  return (
    <div className="pila" ref={rif}>
      {occhiello !== undefined && (
        <span className="pila-riga occhiello" style={ritardo(0)}>
          {occhiello}
        </span>
      )}
      <Titolo className="pila-titolo">
        {righe.map((riga, i) => (
          <span
            key={riga}
            className={`pila-riga titolo${scuro ? " titolo-scuro" : ""}`}
            style={ritardo(i + (occhiello === undefined ? 0 : 1))}
          >
            {riga}
          </span>
        ))}
      </Titolo>
    </div>
  );
}

function ritardo(posizione: number): CSSProperties {
  return { animationDelay: `${posizione * 85}ms` };
}
