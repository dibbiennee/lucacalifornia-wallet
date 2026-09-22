"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Il video dell'apertura.
 *
 * PERCHE' LA SORGENTE LA METTE JAVASCRIPT. Il taglio verticale e quello
 * orizzontale sono due file diversi, e mettendoli tutti e due nell'HTML con
 * uno nascosto dal CSS il browser li scarica lo stesso: misurato, 1070 KB
 * invece di 519. Nascondere una cosa non impedisce di scaricarla.
 *
 * Così invece parte senza sorgenti: al primo istante c'è solo il fotogramma
 * fermo sotto, che è anche quello che vede chi ha javascript spento o ha
 * chiesto meno movimento. Poi si sceglie il taglio giusto e si scarica solo
 * quello.
 *
 * Il fotogramma fermo sta sotto e non sparisce mai: il video ci si appoggia
 * sopra quando è pronto, quindi non c'è nessun buco nero nel frattempo.
 */

const LARGO = "(min-width: 52rem)";

export function VideoApertura() {
  const video = useRef<HTMLVideoElement | null>(null);
  const [taglio, setTaglio] = useState<string | null>(null);

  useEffect(() => {
    // Chi ha chiesto meno movimento non vede il video per niente.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const largo = window.matchMedia(LARGO);
    const scegli = () => {
      setTaglio(largo.matches ? "apertura-computer" : "apertura-telefono");
    };

    scegli();
    largo.addEventListener("change", scegli);
    return () => largo.removeEventListener("change", scegli);
  }, []);

  useEffect(() => {
    if (taglio !== null) {
      video.current?.load();
    }
  }, [taglio]);

  if (taglio === null) {
    return null;
  }

  return (
    <video
      ref={video}
      className="apertura-media apertura-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    >
      <source src={`/video/${taglio}.webm`} type="video/webm" />
      <source src={`/video/${taglio}.mp4`} type="video/mp4" />
    </video>
  );
}
