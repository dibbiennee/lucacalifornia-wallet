"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Gli sfondi fotografici della parte bassa si scaricano solo quando servono.
 *
 * Una foto messa come sfondo in CSS (background-image) il browser la scarica
 * subito, anche se sta a cinque schermate di distanza: non esiste un
 * "loading=lazy" per gli sfondi. Sulla home erano circa 1,7 MB di foto che
 * partivano insieme al video della prima schermata e si dividevano la rete:
 * con una connessione lenta il video partiva dopo 15 secondi invece che dopo 3.
 *
 * Qui l'elemento dichiara la sua foto con data-sfondo, e il CSS la usa come
 * var(--foto, none). Questo componente imposta --foto quando l'elemento è a
 * meno di 900px dallo schermo, quindi la foto c'è già quando ci si arriva.
 * Senza JavaScript restano il velo scuro e i testi: la foto è decorativa.
 */
export function SfondiPigri() {
  const percorso = usePathname();

  useEffect(() => {
    let osservatore: IntersectionObserver | undefined;
    let timer: number | undefined;
    let video: HTMLVideoElement | null = null;
    let avviato = false;

    const avvia = () => {
      if (avviato) {
        return;
      }
      avviato = true;
      window.clearTimeout(timer);
      video?.removeEventListener("playing", avvia);

      const elementi = document.querySelectorAll<HTMLElement>("[data-sfondo]");

      osservatore = new IntersectionObserver(
        (voci) => {
          for (const voce of voci) {
            if (!voce.isIntersecting) {
              continue;
            }

            const el = voce.target as HTMLElement;
            const foto = el.dataset["sfondo"];

            if (foto !== undefined) {
              el.style.setProperty("--foto", `url("${foto}")`);
            }

            osservatore?.unobserve(el);
          }
        },
        { rootMargin: "900px 0px" },
      );

      elementi.forEach((el) => {
        if (!el.style.getPropertyValue("--foto")) {
          osservatore?.observe(el);
        }
      });
    };

    /*
     * Prima il video. Le foto delle sezioni subito sotto la prima schermata
     * (circa 1 MB) rientrano nel margine dei 900px e partirebbero insieme al
     * video, dividendosi la rete: su una connessione lenta il video partiva
     * dopo 11 secondi invece che dopo 4. Quindi si aspetta che il video sia in
     * riproduzione, con un limite di 6 secondi (rete lentissima o autoplay
     * rifiutato), e subito se il video non c'è o è nascosto (meno movimento,
     * risparmio dati). Su una rete buona il video parte in meno di un secondo
     * e le foto arrivano subito dopo, senza che nessuno se ne accorga.
     */
    video = document.querySelector<HTMLVideoElement>("video.apertura-video");
    const inRiproduzione = video !== null && !video.paused && video.readyState >= 3;
    const assente = video === null || window.getComputedStyle(video).display === "none";

    if (assente || inRiproduzione) {
      avvia();
    } else {
      video?.addEventListener("playing", avvia, { once: true });
      timer = window.setTimeout(avvia, 6000);
    }

    return () => {
      window.clearTimeout(timer);
      video?.removeEventListener("playing", avvia);
      osservatore?.disconnect();
    };
  }, [percorso]);

  return null;
}
