"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { MENU } from "@/contenuti/sito";

import { Bottone } from "./Bottone";
import { Marchio } from "./Marchio";
import stili from "./Menu.module.css";

/** Un colore per voce: l'occhio la ritrova prima di aver letto la parola. */
const COLORI: Readonly<Record<string, string>> = {
  "/serate": "var(--milk)",
  "/tavoli": "var(--sun)",
  "/navetta": "var(--cyan)",
  "/capodanno": "var(--acid)",
  "/diventa-pr": "var(--red)",
  "/chi-sono": "var(--text)",
};

/**
 * Il menu a tutto schermo.
 *
 * Si apre da un pulsante nella testata e copre tutto: è una schermata sua,
 * non una tendina appesa a un angolo. Esc lo chiude, il fuoco entra dentro e
 * non esce, e dietro la pagina non scorre.
 */
export function Menu({ chiudi }: { readonly chiudi: () => void }) {
  const finestra = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Dietro il menu la pagina non deve scorrere: si perde il segno.
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    finestra.current?.querySelector<HTMLElement>("a, button")?.focus();

    function tasti(e: KeyboardEvent) {
      if (e.key === "Escape") {
        chiudi();
        return;
      }

      if (e.key !== "Tab" || finestra.current === null) {
        return;
      }

      // Il fuoco gira dentro il menu: con Tab non si finisce nella pagina sotto.
      const dentro = finestra.current.querySelectorAll<HTMLElement>("a[href], button");
      const primo = dentro[0];
      const ultimo = dentro[dentro.length - 1];

      if (primo === undefined || ultimo === undefined) {
        return;
      }

      if (e.shiftKey && document.activeElement === primo) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primo.focus();
      }
    }

    document.addEventListener("keydown", tasti);

    return () => {
      document.body.style.overflow = prima;
      document.removeEventListener("keydown", tasti);
    };
  }, [chiudi]);

  return (
    <div className={stili.menu} role="dialog" aria-modal="true" aria-label="Menu" ref={finestra}>
      <div className={stili.testa}>
        <Link href="/" className={stili.marchio} onClick={chiudi}>
          <Marchio />
          <span>
            LUCA
            <br />
            CALIFORNIA
          </span>
        </Link>

        <button type="button" className={stili.chiudi} onClick={chiudi} aria-label="Chiudi il menu">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <ul className={stili.voci}>
        {MENU.map((voce) => (
          <li key={voce.dove}>
            <Link href={voce.dove} onClick={chiudi}>
              {voce.testo}
              <i className={stili.pallino} style={{ background: COLORI[voce.dove] }} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className={stili.piede}>
        <Bottone href="/prenota?tipo=tavolo">Tavolo</Bottone>
        <Bottone href="/prenota?tipo=braccialetto" aspetto="nero">
          Bracciale
        </Bottone>
        <Bottone href="/prenota?tipo=lista" aspetto="contorno">
          Lista
        </Bottone>
      </div>
    </div>
  );
}
