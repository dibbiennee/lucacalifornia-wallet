"use client";

import { useEffect, useRef, useState } from "react";

import stili from "./TastoAudio.module.css";

/**
 * Il tasto che accende il suono del video dell'apertura.
 *
 * Il video parte sempre muto: i browser non fanno partire un video col suono
 * da solo, e non va fatto nemmeno dove si potrebbe. Il suono lo accende chi lo
 * vuole, toccando qui (un tocco vero, quindi anche iPhone lo accetta).
 *
 * Il suono non deve restare acceso dove non si guarda più: si spegne da solo
 * quando l'apertura esce dallo schermo e quando la scheda va in secondo piano.
 *
 * Sta dentro il riquadro del video e cerca il video accanto a sé. Non compare
 * se il video è nascosto (chi ha chiesto meno movimento): senza video, niente suono.
 */
export function TastoAudio() {
  const tasto = useRef<HTMLButtonElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [presente, setPresente] = useState(false);
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    const v = tasto.current?.parentElement?.querySelector("video") ?? null;
    if (v === null || getComputedStyle(v).display === "none") {
      return;
    }

    video.current = v;
    setPresente(true);

    const aggiorna = () => setAcceso(!v.muted);
    v.addEventListener("volumechange", aggiorna);

    function spegni() {
      v!.muted = true;
    }

    function suNascondi() {
      if (document.hidden) {
        spegni();
      }
    }

    document.addEventListener("visibilitychange", suNascondi);

    const sezione = v.closest("section");
    const osservatore =
      sezione === null
        ? null
        : new IntersectionObserver(
            ([voce]) => {
              if (voce !== undefined && voce.intersectionRatio < 0.35) {
                spegni();
              }
            },
            { threshold: [0, 0.35, 1] },
          );
    if (sezione !== null) {
      osservatore?.observe(sezione);
    }

    return () => {
      v.removeEventListener("volumechange", aggiorna);
      document.removeEventListener("visibilitychange", suNascondi);
      osservatore?.disconnect();
    };
  }, []);

  function tocca() {
    const v = video.current;
    if (v === null) {
      return;
    }

    if (!v.muted) {
      v.muted = true;
      return;
    }

    v.muted = false;
    v.volume = 1;
    // Se il browser non lo permette, si torna muto: il tasto non deve dire "acceso" quando non lo è.
    void v.play().catch(() => {
      v.muted = true;
    });
  }

  return (
    <button
      ref={tasto}
      type="button"
      className={stili.tasto}
      onClick={tocca}
      hidden={!presente}
      aria-pressed={acceso}
      aria-label={acceso ? "Spegni l'audio del video" : "Attiva l'audio del video"}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor" stroke="none" />
        {acceso ? (
          <>
            <path d="M15.5 9a4 4 0 0 1 0 6" />
            <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
          </>
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
      <span>{acceso ? "Audio acceso" : "Attiva l'audio"}</span>
    </button>
  );
}
