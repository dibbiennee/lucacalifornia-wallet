"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MENU, percorsoSerata, SERATE } from "@/contenuti/sito";

import { Bottone } from "./Bottone";
import { Marchio } from "./Marchio";
import stili from "./Menu.module.css";

/** Quanto dura la dissolvenza: dopo questo tempo, chiuso, il menu esce dalla pagina. */
const DURATA_MS = 340;

/**
 * Il menu a tutto schermo.
 *
 * Si apre da un pulsante nella testata e copre tutto: è una schermata sua,
 * non una tendina appesa a un angolo. Esc lo chiude, il fuoco entra dentro e
 * non esce, e dietro la pagina non scorre.
 *
 * Apertura e chiusura sono una dissolvenza, non un apparire e sparire di colpo:
 * il menu resta nella pagina per il tempo della transizione, poi se ne va.
 * Chiuso non c'è nel codice della pagina (i link sono già nella testata).
 */
export function Menu({ aperto, chiudi }: { readonly aperto: boolean; readonly chiudi: () => void }) {
  const finestra = useRef<HTMLDivElement | null>(null);
  const percorso = usePathname();
  // "montato": c'è nella pagina; "visibile": ha la dissolvenza a fine corsa (aperto del tutto).
  const [montato, setMontato] = useState(false);
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    if (aperto) {
      setMontato(true);
      return;
    }

    setVisibile(false);
    const attesa = window.setTimeout(() => setMontato(false), DURATA_MS);
    return () => window.clearTimeout(attesa);
  }, [aperto]);

  useEffect(() => {
    if (!aperto || !montato) {
      return;
    }

    // Prima si fa calcolare al browser lo stato di partenza (trasparente), poi si avvia la dissolvenza:
    // senza questa lettura, se la pagina è occupata, il menu può comparire già tutto opaco, di scatto.
    finestra.current?.getBoundingClientRect();
    setVisibile(true);
  }, [aperto, montato]);

  const attivo = aperto && montato;

  useEffect(() => {
    if (!attivo) {
      return;
    }

    // Dietro il menu la pagina non deve scorrere: si perde il segno. Se togliendo la barra di scorrimento
    // la pagina si allarga, si compensa: è quello che la faceva saltare di lato all'apertura.
    const prima = document.body.style.overflow;
    const primaSpazio = document.body.style.paddingRight;
    const barra = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (barra > 0) {
      document.body.style.paddingRight = `${barra}px`;
    }

    // preventScroll: il fuoco non deve far scorrere nulla mentre il menu compare.
    finestra.current?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });

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
      document.body.style.paddingRight = primaSpazio;
      document.removeEventListener("keydown", tasti);
    };
  }, [attivo, chiudi]);

  if (!montato) {
    return null;
  }

  return (
    <div
      className={stili.menu}
      data-visibile={visibile ? "" : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!aperto}
      inert={!aperto}
      ref={finestra}
    >
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
        {MENU.map((voce) => {
          // La pagina in cui sei: in magenta (il colore di ciò che si preme, qui già premuto). Vale anche per le sue sottopagine.
          const corrente = percorso === voce.dove || percorso.startsWith(`${voce.dove}/`);

          return (
            <li key={voce.dove}>
              <Link href={voce.dove} onClick={chiudi} aria-current={corrente ? "page" : undefined}>
                {voce.testo}
              </Link>

              {/* L'unico punto del menu con i colori: qui si impara il codice dei quattro giorni. */}
              {voce.dove === "/serate" && (
                <div className={stili.giorni}>
                  {SERATE.map((s) => (
                    <Link
                      key={s.codice}
                      href={percorsoSerata(s)}
                      onClick={chiudi}
                      className={stili.giorno}
                      style={{ background: `var(--${s.colore})` }}
                      aria-label={`${s.giorno}, ${s.nome}`}
                    >
                      {s.breve}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Bottone non ha un suo onClick: il clic risale fin qui e chiude il menu, come per le voci sopra. */}
      <div className={stili.piede} onClick={chiudi}>
        <Bottone href="/prenota?tipo=tavolo">Tavolo</Bottone>
        <Bottone href="/prenota?tipo=braccialetto" aspetto="contorno">
          Bracciale
        </Bottone>
        <Bottone href="/prenota?tipo=lista" aspetto="contorno">
          Lista
        </Bottone>
      </div>
    </div>
  );
}
