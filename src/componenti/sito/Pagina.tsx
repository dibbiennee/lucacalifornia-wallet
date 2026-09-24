import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { legaParole } from "@/lib/tipografia";

import { Gallone } from "./Icone";
import stili from "./Pagina.module.css";

type Frase = string | readonly string[];

/** Il testo arriva spezzato quando dentro c'è un valore: si rimette insieme. */
const insieme = (c: Frase): string => (typeof c === "string" ? c : c.join(""));

/**
 * Un paragrafo del sito, con gli spazi indivisibili già al posto giusto.
 *
 * Nessuna riga chiude su un articolo o una preposizione, e l'ultima riga non
 * resta con una parola sola: è la regola tipografica italiana, e su uno
 * schermo stretto si vede subito quando manca.
 */
export function Introduzione({
  children,
  spazioSotto = false,
}: {
  readonly children: Frase;
  /** Quando sotto viene subito un'altra cosa e serve un po' d'aria. */
  readonly spazioSotto?: boolean;
}) {
  return (
    <p className="introduzione" style={spazioSotto ? { marginBottom: 18 } : undefined}>
      {legaParole(insieme(children), { vedova: true })}
    </p>
  );
}

/** Il titolo di una sezione, con le parole brevi legate. */
export function Titolo2({
  id,
  misura,
  children,
}: {
  readonly id: string;
  /** Alcune sezioni lo vogliono più piccolo del titolo di pagina. */
  readonly misura?: string;
  readonly children: string;
}) {
  return (
    <h2 className="display" id={id} style={misura === undefined ? undefined : { fontSize: misura }}>
      {legaParole(children, { titolo: true, vedova: false })}
    </h2>
  );
}

export function Nota({ children }: { readonly children: Frase }) {
  return <p className="nota">{legaParole(insieme(children), { vedova: true })}</p>;
}

/** Il ritorno indietro, in cima a ogni pagina interna. */
export function Indietro({ testo, dove }: { readonly testo: string; readonly dove: string }) {
  return (
    <div className={`wrap ${stili.cima}`}>
      <Link href={dove} className="indietro">
        <Gallone />
        {testo}
      </Link>
    </div>
  );
}

/**
 * La testa di una pagina: occhiello, titolo, e la frase che spiega.
 *
 * Il titolo arriva già diviso in frasi: una per riga, a capo dove lo decide
 * chi scrive e non dove capita.
 */
export function TestaPagina({
  occhiello,
  colore = "var(--muted)",
  righe,
  introduzione,
  senzaColonna = false,
}: {
  readonly occhiello?: string;
  readonly colore?: string;
  readonly righe: readonly string[];
  readonly introduzione?: ReactNode;
  /** Vero quando la testa sta già dentro una griglia che le fa da colonna. */
  readonly senzaColonna?: boolean;
}) {
  return (
    <div className={senzaColonna ? stili.testa : `wrap ${stili.testa}`}>
      {occhiello !== undefined && (
        <p className="occhiello" style={{ color: colore, margin: 0 }}>
          {occhiello}
        </p>
      )}

      <h1 className="display" tabIndex={-1}>
        {righe.map((riga, i) => (
          <span key={riga} className="cl">
            {legaParole(riga, { titolo: true, vedova: false })}
            {i < righe.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>

      {introduzione !== undefined &&
        (typeof introduzione === "string" ? (
          <Introduzione>{introduzione}</Introduzione>
        ) : (
          <p className="introduzione">{introduzione}</p>
        ))}
    </div>
  );
}

export function FotoPagina({ src, alt }: { readonly src: string; readonly alt: string }) {
  return <Image src={src} alt={alt} width={1280} height={960} sizes="(min-width: 1180px) 1140px, 100vw" className={stili.foto} priority />;
}

export function Pillole({ voci }: { readonly voci: readonly string[] }) {
  return (
    <ul className={stili.pillole}>
      {voci.map((v) => (
        <li key={v}>{v}</li>
      ))}
    </ul>
  );
}

export function Punti({ voci }: { readonly voci: readonly { readonly titolo: string; readonly testo: string }[] }) {
  return (
    <ul className={stili.punti}>
      {voci.map((v) => (
        <li key={v.titolo}>
          <strong>{legaParole(v.titolo, { vedova: false })}</strong>
          <span>{legaParole(v.testo, { vedova: true })}</span>
        </li>
      ))}
    </ul>
  );
}

export function Dati({ voci }: { readonly voci: readonly (readonly [string, string])[] }) {
  return (
    <div className={stili.dati}>
      {voci.map(([voce, valore]) => (
        <div key={voce}>
          <small>{voce}</small>
          <strong>{valore}</strong>
        </div>
      ))}
    </div>
  );
}

export function Azioni({ children }: { readonly children: ReactNode }) {
  return <div className={stili.azioni}>{children}</div>;
}

export function Altre({ children }: { readonly children: ReactNode }) {
  return <div className={stili.altre}>{children}</div>;
}

/** Le foto delle serate, che scorrono di lato. */
export function Galleria({
  foto,
}: {
  readonly foto: readonly { readonly src: string; readonly alt: string }[];
}) {
  return (
    <div className={stili.galleria} tabIndex={0} aria-label="Foto dalle storie, scorri di lato">
      {foto.map((f) => (
        <Image key={f.src} src={f.src} alt={f.alt} width={640} height={996} sizes="(min-width: 720px) 25vw, 60vw" />
      ))}
    </div>
  );
}
