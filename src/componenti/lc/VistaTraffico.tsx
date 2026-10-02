"use client";

import { useState } from "react";

import type { Conti, Periodo, PuntoSerie, Statistiche } from "@/lib/traffico";

import stili from "./Traffico.module.css";

const COLONNE: readonly { readonly chiave: Periodo | "totale"; readonly testo: string }[] = [
  { chiave: "giorno", testo: "Oggi" },
  { chiave: "settimana", testo: "Settimana" },
  { chiave: "mese", testo: "Mese" },
  { chiave: "totale", testo: "Totale" },
];

const RIGHE: readonly { readonly chiave: keyof Conti; readonly testo: string }[] = [
  { chiave: "visite", testo: "Visite" },
  { chiave: "nuove", testo: "Visite nuove" },
  { chiave: "iniziati", testo: "Moduli iniziati" },
  { chiave: "inviati", testo: "Moduli inviati" },
  { chiave: "inAttesa", testo: "In attesa" },
  { chiave: "confermate", testo: "Confermate" },
  { chiave: "rifiutate", testo: "Rifiutate" },
];

const PERIODI: readonly { readonly chiave: Periodo; readonly testo: string }[] = [
  { chiave: "giorno", testo: "Giorno" },
  { chiave: "settimana", testo: "Settimana" },
  { chiave: "mese", testo: "Mese" },
];

const GIORNO = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", day: "numeric", month: "short" });
const MESE = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", month: "short" });

function etichetta(inizio: string, periodo: Periodo): string {
  const [a, m, g] = inizio.split("-").map(Number);

  if (a === undefined || m === undefined || g === undefined) {
    return inizio;
  }

  const data = new Date(Date.UTC(a, m - 1, g));
  return (periodo === "mese" ? MESE.format(data) : GIORNO.format(data)).replace(/\./g, "");
}

/**
 * I numeri del traffico e degli esiti: una tabella con oggi, la settimana, il mese e il totale, e un
 * grafico a linee semplice (visite e moduli inviati) per giorno, settimana o mese.
 *
 * Non calcola niente: riceve le serie già fatte dal server, per l'ambito di chi guarda. Il grafico è
 * un disegno: chi non lo vede legge gli stessi numeri nella tabella.
 */
export function VistaTraffico({ statistiche, titolo }: { readonly statistiche: Statistiche; readonly titolo?: string }) {
  const [periodo, setPeriodo] = useState<Periodo>("giorno");
  const serie = statistiche.serie[periodo];

  return (
    <section className={stili.blocco} aria-label={titolo ?? "Numeri"}>
      {titolo !== undefined && <h2 className={stili.titolo}>{titolo}</h2>}

      <div className={stili.tabellaScorri}>
        <table className={stili.tabella}>
          <thead>
            <tr>
              <th scope="col">
                <span className="lc-sr">Voce</span>
              </th>
              {COLONNE.map((c) => (
                <th key={c.chiave} scope="col">
                  {c.testo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIGHE.map((r) => (
              <tr key={r.chiave}>
                <th scope="row">{r.testo}</th>
                {COLONNE.map((c) => (
                  <td key={c.chiave}>{(c.chiave === "totale" ? statistiche.totale : statistiche.corrente[c.chiave])[r.chiave]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={stili.testaGrafico}>
        <h3 className={stili.sottotitolo}>Andamento</h3>
        <div className={stili.periodi} role="group" aria-label="Periodo del grafico">
          {PERIODI.map((p) => (
            <button
              key={p.chiave}
              type="button"
              className={`lc-press ${stili.periodo} ${periodo === p.chiave ? stili.periodoAttivo : ""}`}
              aria-pressed={periodo === p.chiave}
              onClick={() => setPeriodo(p.chiave)}
            >
              {p.testo}
            </button>
          ))}
        </div>
      </div>

      <Grafico serie={serie} periodo={periodo} />
    </section>
  );
}

const LARGHEZZA = 320;
const ALTEZZA = 100;
const MARGINE = { sopra: 6, sotto: 4, sinistra: 2, destra: 2 };

/**
 * Il grafico: solo le linee sono un disegno (SVG che si adatta alla larghezza, con
 * lo spessore delle linee che non cambia), le scritte sono testo vero sotto: su uno
 * schermo largo non si ingrandiscono insieme al disegno.
 */
function Grafico({ serie, periodo }: { readonly serie: readonly PuntoSerie[]; readonly periodo: Periodo }) {
  const massimo = Math.max(1, ...serie.map((p) => Math.max(p.visite, p.inviati)));
  const area = { w: LARGHEZZA - MARGINE.sinistra - MARGINE.destra, h: ALTEZZA - MARGINE.sopra - MARGINE.sotto };
  const x = (i: number) => MARGINE.sinistra + (serie.length <= 1 ? 0 : (i / (serie.length - 1)) * area.w);
  const y = (v: number) => MARGINE.sopra + area.h - (v / massimo) * area.h;
  const linea = (campo: "visite" | "inviati") => serie.map((p, i) => `${x(i).toFixed(1)},${y(p[campo]).toFixed(1)}`).join(" ");
  const primo = serie[0];
  const ultimo = serie[serie.length - 1];
  const vuoto = serie.every((p) => p.visite === 0 && p.inviati === 0);

  return (
    <figure className={stili.figura}>
      <div className={stili.disegno}>
        <svg
          viewBox={`0 0 ${LARGHEZZA} ${ALTEZZA}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Visite e moduli inviati per ${periodo}: massimo ${massimo}`}
          className={stili.svg}
        >
          <line x1={0} x2={LARGHEZZA} y1={y(0)} y2={y(0)} className={stili.asse} />
          <line x1={0} x2={LARGHEZZA} y1={y(massimo)} y2={y(massimo)} className={stili.guida} />
          <polyline points={linea("visite")} className={stili.lineaVisite} fill="none" />
          <polyline points={linea("inviati")} className={stili.lineaInviati} fill="none" />
        </svg>
        <span className={stili.massimo} aria-hidden>
          {massimo}
        </span>
      </div>
      <div className={stili.date} aria-hidden>
        <span>{primo === undefined ? "" : etichetta(primo.inizio, periodo)}</span>
        <span>{ultimo === undefined ? "" : etichetta(ultimo.inizio, periodo)}</span>
      </div>
      <figcaption className={stili.legenda}>
        <span className={stili.chiaveVisite}>Visite</span>
        <span className={stili.chiaveInviati}>Moduli inviati</span>
        {vuoto && <span className={stili.nessuno}>Ancora nessun dato</span>}
      </figcaption>
    </figure>
  );
}
