"use client";

import { useEffect } from "react";

import stili from "./Avviso.module.css";

/** Quanto resta a schermo: il tempo di leggerlo, non di doverlo chiudere. */
const DURATA = 2600;

/**
 * La riga che conferma che una cosa è andata a buon fine.
 *
 * Si annuncia da sola a chi legge con la voce (aria-live sul contenitore) e
 * se ne va dopo pochi secondi: non ha una crocetta perché niente di
 * importante passa da qui, e una crocetta in più è una cosa in più da toccare.
 */
export function Avviso({
  testo,
  chiudi,
  senzaBarra = false,
}: {
  readonly testo: string;
  readonly chiudi: () => void;
  readonly senzaBarra?: boolean;
}) {
  useEffect(() => {
    if (testo === "") {
      return;
    }

    const attesa = window.setTimeout(chiudi, DURATA);
    return () => window.clearTimeout(attesa);
  }, [testo, chiudi]);

  return (
    <div aria-live="polite">
      {testo !== "" && (
        <p className={`${stili.avviso}${senzaBarra ? ` ${stili["senza-barra"]}` : ""}`}>{testo}</p>
      )}
    </div>
  );
}
