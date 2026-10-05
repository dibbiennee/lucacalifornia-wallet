import type { MouseEvent } from "react";

/**
 * Il clic sul marchio in alto a sinistra: se si è già in home, si torna su fino alla prima schermata (la hero)
 * scorrendo, invece di restare fermi perché il link porta dove si è già. Dalle altre pagine il link fa quello
 * che deve: porta alla home. Lo scorrimento dolce è solo qui, al clic: acceso su tutta la pagina rompeva il tasto
 * indietro (vedi sito.css). Con "meno movimento" si torna su di scatto.
 *
 * `dopo` serve al menu a tutto schermo: finché è aperto la pagina sotto non scorre (è bloccata), quindi si
 * aspetta che si sia chiuso.
 */
export function tornaInCima(e: MouseEvent<HTMLAnchorElement>, percorso: string, dopo = 0): void {
  if (percorso !== "/") {
    return;
  }

  e.preventDefault();

  const vai = () => {
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: riduci ? "auto" : "smooth" });
  };

  if (dopo > 0) {
    window.setTimeout(vai, dopo);
  } else {
    vai();
  }
}
