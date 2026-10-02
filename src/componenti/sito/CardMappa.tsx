"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import stili from "./CardMappa.module.css";

/**
 * Il locale su una mappa: un'immagine scura fatta una volta sola da
 * OpenStreetMap (public/foto/mappa-room26.webp), con lo spillo sopra. Niente
 * servizi esterni caricati nella pagina: nessun cookie e nessuna API a
 * pagamento. Un tocco apre l'app di mappe: Apple Mappe su iPhone e iPad,
 * Google Maps ovunque altro (il link di partenza, uguale per tutti, è quello
 * di Google: così funziona anche prima che la pagina sia pronta).
 */
export function CardMappa({
  nome,
  indirizzo,
  lat,
  lon,
}: {
  readonly nome: string;
  readonly indirizzo: string;
  readonly lat: number;
  readonly lon: number;
}) {
  const google = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, ${indirizzo}`)}`;
  const [href, setHref] = useState(google);

  useEffect(() => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setHref(`https://maps.apple.com/?ll=${lat},${lon}&q=${encodeURIComponent(nome)}`);
    }
  }, [lat, lon, nome]);

  return (
    <a className={stili.mappa} href={href} target="_blank" rel="noopener" aria-label={`${nome}, ${indirizzo}: apri la mappa`}>
      <Image
        src="/foto/mappa-room26.webp"
        alt=""
        fill
        sizes="(min-width: 900px) 560px, 100vw"
        className={stili.immagine}
      />

      <span className={stili.spillo} aria-hidden>
        <span className={stili.onda} />
        <svg width="40" height="40" viewBox="0 0 24 24" focusable="false">
          <path d="M12 2c-4 0-7 3-7 7 0 5.2 7 13 7 13s7-7.8 7-13c0-4-3-7-7-7z" fill="var(--magenta)" />
          <circle cx="12" cy="9" r="2.8" fill="#fff" />
        </svg>
      </span>

      <span className={stili.velo} aria-hidden />

      <span className={stili.testo}>
        <small>Dove</small>
        <strong>{nome}</strong>
        <span>{indirizzo}</span>
      </span>

      <span className={stili.apri} aria-hidden>
        Apri la mappa
        <svg width="16" height="16" viewBox="0 0 24 24" focusable="false">
          <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}
