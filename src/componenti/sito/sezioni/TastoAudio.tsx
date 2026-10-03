"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HERO_VIDEO } from "@/contenuti/hero-video";

import stili from "./TastoAudio.module.css";

/**
 * Il tasto che accende la musica dell'apertura.
 *
 * Il video è un loop muto di 6 secondi che finisce appena prima del drop: il
 * suono è un file a parte (vedi scripts/genera-apertura.mjs), che parte dalla
 * salita e va oltre il drop. Non si scarica finché qualcuno non tocca il tasto,
 * e parte da un tocco vero (così anche l'iPhone lo accetta).
 *
 * La musica NON si spegne quando si scorre la pagina: chi la accende la vuole
 * mentre guarda il resto. Per spegnerla da lontano il tasto, quando l'apertura
 * esce dallo schermo, resta fisso sotto la testata. Si ferma da sola se si
 * cambia pagina (il componente sparisce) o se la scheda va in secondo piano.
 *
 * Non compare se il video è nascosto (chi ha chiesto meno movimento).
 */
export function TastoAudio() {
  const tasto = useRef<HTMLButtonElement | null>(null);
  const suono = useRef<HTMLAudioElement | null>(null);
  const [presente, setPresente] = useState(false);
  const [acceso, setAcceso] = useState(false);
  const [lontano, setLontano] = useState(false);

  useEffect(() => {
    const v = tasto.current?.parentElement?.querySelector("video") ?? null;
    if (v === null || getComputedStyle(v).display === "none") {
      return;
    }

    setPresente(true);

    function suNascondi() {
      if (document.hidden) {
        suono.current?.pause();
      }
    }

    document.addEventListener("visibilitychange", suNascondi);

    // Quando l'apertura non si vede più, il tasto si sposta sotto la testata.
    const sezione = v.closest("section");
    const osservatore =
      sezione === null
        ? null
        : new IntersectionObserver(([voce]) => {
            if (voce !== undefined) {
              setLontano(voce.intersectionRatio < 0.35);
            }
          }, { threshold: [0, 0.35, 1] });
    if (sezione !== null) {
      osservatore?.observe(sezione);
    }

    return () => {
      document.removeEventListener("visibilitychange", suNascondi);
      osservatore?.disconnect();
      suono.current?.pause();
      suono.current = null;
    };
  }, []);

  function tocca() {
    if (suono.current !== null && !suono.current.paused) {
      suono.current.pause();
      return;
    }

    if (suono.current === null) {
      const a = new Audio(HERO_VIDEO.audio);
      a.loop = true;
      a.addEventListener("play", () => setAcceso(true));
      a.addEventListener("pause", () => setAcceso(false));
      suono.current = a;
    }

    // Se il browser non lo permette il tasto resta com'era: non deve dire "acceso" quando non lo è.
    void suono.current.play().catch(() => setAcceso(false));
  }

  const aspetto = (
    <>
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
      <span>{acceso ? "Musica accesa" : "Attiva l'audio"}</span>
    </>
  );

  const etichetta = acceso ? "Spegni la musica" : "Accendi la musica";
  const fisso = lontano && acceso;

  return (
    <>
      {/* Nel video. Quando il tasto diventa fisso si ritira: sotto, nel corpo della pagina, resterebbe coperto dalle sezioni dopo. */}
      <button
        ref={tasto}
        type="button"
        className={stili.tasto}
        onClick={tocca}
        hidden={!presente || lontano}
        aria-pressed={acceso}
        aria-label={etichetta}
      >
        {aspetto}
      </button>

      {/* Fisso sotto la testata: fuori dall'apertura (porta nel body), per stare sopra a tutto il resto. */}
      {fisso &&
        createPortal(
          <button type="button" className={`${stili.tasto} ${stili.fisso}`} onClick={tocca} aria-pressed={acceso} aria-label={etichetta}>
            {aspetto}
          </button>,
          document.body,
        )}
    </>
  );
}
