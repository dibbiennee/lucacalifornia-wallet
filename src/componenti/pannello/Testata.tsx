import Link from "next/link";
import type { ReactNode } from "react";

import stili from "./Testata.module.css";

/**
 * La testata di ogni schermata: occhiello, titolo, e quello che serve intorno.
 *
 * Il titolo va a capo dove c'è la virgola, una frase per riga: "Sabato, due
 * sale" diventa "SABATO," e sotto "DUE SALE". I pezzi corti restano interi
 * anche se la riga è stretta, perché spezzare "DUE SALE" in mezzo è peggio
 * che rimpicciolire. Quelli lunghi possono andare a capo da soli: tenerli
 * insieme li farebbe uscire dallo schermo.
 */

/** Oltre questa misura un pezzo di titolo può andare a capo per conto suo. */
const CORTO = 12;

function inRighe(titolo: string): readonly string[] {
  return titolo
    .split(/(?<=,)\s+/)
    .map((pezzo) => pezzo.trim())
    .filter((pezzo) => pezzo !== "");
}

export function Testata({
  occhiello,
  titolo,
  titoloNascosto = false,
  sottotitolo,
  azione,
  indietro,
}: {
  readonly occhiello?: string;
  readonly titolo: string;
  /** Vero quando a schermo il titolo è sostituito da altro, come il conteggio della porta. */
  readonly titoloNascosto?: boolean;
  readonly sottotitolo?: string;
  readonly azione?: ReactNode;
  readonly indietro?: { readonly testo: string; readonly dove: string };
}) {
  const righe = inRighe(titolo);

  return (
    <div className={stili.testata}>
      {indietro !== undefined && (
        <Link href={indietro.dove} className={stili.indietro}>
          <Freccia />
          {indietro.testo}
        </Link>
      )}

      {(occhiello !== undefined || azione !== undefined) && (
        <div className={stili.riga}>
          {occhiello !== undefined ? <p className={stili.occhiello}>{occhiello}</p> : <span />}
          {azione}
        </div>
      )}

      {/*
        Il fuoco arriva qui quando si cambia schermata: chi legge con la voce
        sente il titolo nuovo invece di ripartire dall'inizio della pagina.
      */}
      <h1 className={titoloNascosto ? "sr" : stili.titolo} tabIndex={-1}>
        {righe.map((riga, i) => (
          <span
            key={riga}
            className={`${stili["riga-titolo"]}${riga.length <= CORTO ? " ph" : ""}`}
          >
            {riga}
            {i < righe.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>

      {sottotitolo !== undefined && <p className={stili.sottotitolo}>{sottotitolo}</p>}
    </div>
  );
}

/** Il gallone a sinistra del ritorno indietro. */
function Freccia() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
