"use client";

import { useEffect, useRef } from "react";

import { Pulsante } from "./Pulsante";
import stili from "./Conferma.module.css";
import { Testo } from "./Messaggi";

/**
 * La domanda prima di rifiutare.
 *
 * Rifiutare una richiesta non si annulla, e il pulsante sta accanto a "In
 * attesa": di notte, di fretta, si sbaglia. Usa <dialog>, così il fuoco
 * resta dentro e Esc chiude, senza scrivere niente a mano.
 */
export function Conferma({
  aperta,
  titolo,
  testo,
  azione,
  procedi,
  annulla,
}: {
  readonly aperta: boolean;
  readonly titolo: string;
  readonly testo: string;
  readonly azione: string;
  readonly procedi: () => void;
  readonly annulla: () => void;
}) {
  const finestra = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const f = finestra.current;
    if (f === null) {
      return;
    }

    if (aperta && !f.open) {
      f.showModal();
    } else if (!aperta && f.open) {
      f.close();
    }
  }, [aperta]);

  return (
    <dialog
      ref={finestra}
      className={stili.finestra}
      onCancel={(e) => {
        e.preventDefault();
        annulla();
      }}
      /* Toccare il fondo scuro, cioè fuori dal foglio, chiude come Annulla. */
      onClick={(e) => {
        if (e.target === finestra.current) {
          annulla();
        }
      }}
    >
      <div className={stili.dentro}>
        <h2>{titolo}</h2>
        <Testo>{testo}</Testo>
        <Pulsante onClick={procedi}>{azione}</Pulsante>
        <Pulsante aspetto="vuoto" onClick={annulla}>
          Annulla
        </Pulsante>
      </div>
    </dialog>
  );
}
