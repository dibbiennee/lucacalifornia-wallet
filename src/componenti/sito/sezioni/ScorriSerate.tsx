"use client";

import type { MouseEvent, ReactNode } from "react";

import stili from "./Apertura.module.css";

/**
 * "4 serate a settimana" con la freccia: scorre fino alle serate con un movimento dolce.
 *
 * Lo scorrimento dolce si fa solo qui, al clic, e non per tutta la pagina: acceso
 * ovunque (scroll-behavior: smooth) rompeva il tasto indietro, perché il browser
 * ripristina la posizione con un salto che veniva animato e si fermava a metà (vedi sito.css).
 * Qui non si aggiunge nemmeno l'ancora all'indirizzo: niente voce in più nella cronologia.
 * Chi ha chiesto meno movimento ci arriva di scatto. Senza JavaScript resta il link all'ancora.
 */
export function ScorriSerate({ children }: { readonly children: ReactNode }) {
  function vai(e: MouseEvent<HTMLAnchorElement>) {
    const meta = document.getElementById("testa-serate");

    if (meta === null) {
      return;
    }

    e.preventDefault();
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    meta.scrollIntoView({ behavior: riduci ? "auto" : "smooth", block: "start" });
  }

  return (
    <a href="#testa-serate" className={stili.scorri} onClick={vai}>
      {children}
    </a>
  );
}
