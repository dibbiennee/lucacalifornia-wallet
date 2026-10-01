import Image from "next/image";
import Link from "next/link";

import { INSTAGRAM_URL, MENU } from "@/contenuti/sito";

import { Bottone } from "./Bottone";
import { Marchio } from "./Marchio";
import stili from "./PiePagina.module.css";

/** Le stesse voci del menu, più la prenotazione, in due colonne. */
const VOCI = [...MENU, { testo: "Prenota", dove: "/prenota?tipo=tavolo" }];

export function PiePagina() {
  return (
    <footer className={stili.piede}>
      <div className={`wrap ${stili.dentro}`}>
        <Link href="/" className={stili.marchio} aria-label="Luca California, home">
          <Marchio misura={48} />
          <span className={stili.testo}>
            <span className={stili.parola}>
              LUCA
              <br />
              CALIFORNIA
            </span>
          </span>
        </Link>

        <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno classe={stili.instagram}>
          <Istagram />
          Seguimi su Instagram
        </Bottone>

        <nav className={stili.voci} aria-label="Pagine del sito">
          {VOCI.map((voce) => (
            <Link key={voce.dove} href={voce.dove}>
              {voce.testo}
            </Link>
          ))}
        </nav>

        <p className={stili.locale}>
          <span>D&apos;inverno al</span>
          <Image src="/foto/room26.webp" alt="ROOM26" width={400} height={177} sizes="120px" />
        </p>

        <div className={stili.legali}>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookie">Cookie</Link>
        </div>

        <p className={stili.firma}>
          By{" "}
          <a href="https://satoshiweb.it" target="_blank" rel="noopener">
            satoshiweb.it
          </a>
        </p>
      </div>
    </footer>
  );
}

function Istagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}
