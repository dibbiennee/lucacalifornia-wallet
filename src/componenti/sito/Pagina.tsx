import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Gallone } from "./Icone";
import stili from "./Pagina.module.css";

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
}: {
  readonly occhiello?: string;
  readonly colore?: string;
  readonly righe: readonly string[];
  readonly introduzione?: ReactNode;
}) {
  return (
    <div className={`wrap ${stili.testa}`}>
      {occhiello !== undefined && (
        <p className="occhiello" style={{ color: colore, margin: 0 }}>
          {occhiello}
        </p>
      )}

      <h1 className="display" tabIndex={-1}>
        {righe.map((riga, i) => (
          <span key={riga} className="cl">
            {riga}
            {i < righe.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>

      {introduzione !== undefined && <p className="introduzione">{introduzione}</p>}
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
          <strong>{v.titolo}</strong>
          <span>{v.testo}</span>
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
