"use client";

import { useEffect, useRef, type ReactNode } from "react";

import stili from "./FoglioInferiore.module.css";

/**
 * Il foglio che sale dal basso sul telefono e diventa una finestra al centro
 * sul computer. Lo usano il menu, "Nuovo PR" e la conferma del rifiuto.
 *
 * Fa quello che deve fare una finestra: il fuoco entra dentro e non esce con
 * Tab, Esc la chiude, dietro la pagina non scorre, e alla chiusura il fuoco
 * torna dov'era (il pulsante che l'ha aperta).
 */
export function FoglioInferiore({
  aperto,
  chiudi,
  titolo,
  children,
}: {
  readonly aperto: boolean;
  readonly chiudi: () => void;
  /** Il nome della finestra per chi legge con la voce: non si vede a schermo. */
  readonly titolo: string;
  readonly children: ReactNode;
}) {
  const finestra = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!aperto) {
      return;
    }

    const precedente = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflowPrima = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focalizzabili = () =>
      Array.from(
        finestra.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    // Il primo campo di testo, se c'è (la tastiera si apre da sola); altrimenti la finestra
    // stessa: il lettore di schermo la annuncia, e non compare un anello di fuoco sulla
    // prima riga a chi ha aperto il foglio con un tocco.
    (finestra.current?.querySelector<HTMLElement>("input") ?? finestra.current)?.focus();

    function tasti(e: KeyboardEvent) {
      if (e.key === "Escape") {
        chiudi();
        return;
      }

      if (e.key !== "Tab") {
        return;
      }

      const dentro = focalizzabili();
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
      document.body.style.overflow = overflowPrima;
      document.removeEventListener("keydown", tasti);
      precedente?.focus();
    };
  }, [aperto, chiudi]);

  if (!aperto) {
    return null;
  }

  return (
    <div className={stili.radice}>
      <div className={stili.sfondo} onClick={chiudi} aria-hidden />
      <div className={stili.foglio} role="dialog" aria-modal="true" aria-label={titolo} ref={finestra} tabIndex={-1}>
        <span className={stili.maniglia} aria-hidden />
        {children}
      </div>
    </div>
  );
}
