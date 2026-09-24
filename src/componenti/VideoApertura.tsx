"use client";

import { useEffect, useRef } from "react";

/**
 * Il video dell'apertura.
 *
 * NEL SORGENTE C'È IL TAGLIO DA TELEFONO, e non è un ripiego: da telefono
 * arriva il 99% della gente, quindi quello è il caso normale. Sta scritto
 * nell'HTML con le sue sorgenti, quindi parte anche se javascript non gira,
 * e si legge nel sorgente senza eseguire niente.
 *
 * Su schermo largo javascript scambia le sorgenti col taglio orizzontale,
 * perché il filmato è verticale e allargato si sgrana. Il prezzo è che su
 * computer il taglio verticale comincia a scaricarsi prima dello scambio:
 * qualche decina di kilobyte sprecati sull'1% delle visite, che è molto
 * meno di quanto costava mettere tutti e due i video nell'HTML e
 * nasconderne uno col CSS (1070 KB invece di 519, misurati).
 *
 * Chi ha chiesto meno movimento nelle impostazioni non lo vede per niente:
 * lo nasconde il CSS, e sotto resta il fotogramma fermo.
 *
 * PARTE DOPO, non subito. Il tag e le sue sorgenti stanno nell'HTML, così si
 * leggono senza eseguire niente, ma il browser non le scarica finché la
 * pagina non ha finito: scaricandole insieme rubava banda alla foto della
 * prima schermata, e quella ci metteva 4,2 secondi a comparire invece di 1,5.
 */

const LARGO = "(min-width: 52rem)";

export function VideoApertura() {
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const elemento = video.current;

    if (elemento === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const largo = window.matchMedia(LARGO);

    const scambia = () => {
      const taglio = largo.matches ? "apertura-computer" : "apertura-telefono";

      if (elemento.dataset["taglio"] === taglio) {
        return;
      }

      elemento.dataset["taglio"] = taglio;
      elemento.querySelectorAll("source").forEach((sorgente) => {
        const tipo = sorgente.type === "video/webm" ? "webm" : "mp4";
        sorgente.src = `/video/${taglio}.${tipo}`;
      });
      elemento.load();
    };

    const avvia = () => {
      elemento.dataset["taglio"] = "apertura-telefono";
      scambia();
      // Il play può essere rifiutato (batteria bassa, impostazioni): sotto
      // resta la foto, che è quello che si vede comunque.
      void elemento.play().catch(() => undefined);
      largo.addEventListener("change", scambia);
    };

    if (document.readyState === "complete") {
      avvia();
    } else {
      window.addEventListener("load", avvia, { once: true });
    }

    return () => {
      window.removeEventListener("load", avvia);
      largo.removeEventListener("change", scambia);
    };
  }, []);

  return (
    <video
      ref={video}
      className="apertura-media apertura-video"
      muted
      loop
      playsInline
      preload="none"
      /* Niente poster: sotto c'è già la foto della prima schermata, e due
         immagini di sfondo sono trenta kilobyte buttati. */
      aria-hidden
      tabIndex={-1}
    >
      <source src="/video/apertura-telefono.webm" type="video/webm" />
      <source src="/video/apertura-telefono.mp4" type="video/mp4" />
    </video>
  );
}
