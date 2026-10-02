"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  filtraVoci,
  filtroDaStato,
  raggruppa,
  statoDaFiltro,
  type Filtro,
  type VoceRichiesta,
} from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { IconaSpunta } from "./Icone";
import stili from "./Richieste.module.css";
import { useToast } from "./Toast";

const FILTRI: readonly { readonly chiave: Filtro; readonly testo: string }[] = [
  { chiave: "nuove", testo: "Nuove" },
  { chiave: "confermate", testo: "Confermate" },
  { chiave: "tutte", testo: "Tutte" },
];

/**
 * L'elenco delle richieste e, accanto o sopra, quella aperta.
 *
 * Sul telefono la richiesta aperta copre tutto (e l'elenco resta sotto, dov'era:
 * tornando indietro si ritrova alla stessa altezza). Sul computer le due cose
 * stanno affiancate: elenco a sinistra, dettaglio a destra.
 *
 * Il dettaglio è una pagina vera (/pannello/richieste/[id]) e non uno stato
 * di questa schermata: l'avviso push della richiesta nuova porta dritto lì,
 * e il link si può mandare a qualcuno.
 *
 * Il filtro vive qui, nel browser, perché cambiare fra "Nuove" e "Tutte" deve
 * essere istantaneo (sotto i 400 ms l'utente resta concentrato, sopra no),
 * ma si riflette anche nell'indirizzo (?stato=nuova) per non perdersi dopo un
 * ricaricamento e perché il ritorno dal dettaglio sappia dove tornare.
 */
export function AreaRichieste({
  voci,
  children,
}: {
  readonly voci: readonly VoceRichiesta[];
  readonly children: ReactNode;
}) {
  const percorso = usePathname();
  const parametri = useSearchParams();
  const toast = useToast();

  const idAperto = /^\/pannello\/richieste\/([^/]+)/.exec(percorso)?.[1] ?? null;
  const [filtro, setFiltro] = useState<Filtro>(() => filtroDaStato(parametri.get("stato")));

  const nNuove = voci.filter((v) => v.stato === "nuova").length;
  const nConfermate = voci.filter((v) => v.stato === "confermata").length;

  const gruppi = useMemo(() => raggruppa(filtraVoci(voci, filtro)), [voci, filtro]);

  // Le richieste arrivate mentre il pannello è aperto entrano dall'alto e
  // lo dicono con un avviso. Al primo disegno non ce n'è nessuna "nuova".
  const viste = useRef<Set<string> | null>(null);
  const [fresche, setFresche] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const ids = new Set(voci.map((v) => v.id));

    if (viste.current !== null) {
      const arrivate = voci.filter((v) => !viste.current?.has(v.id));
      if (arrivate.length > 0) {
        setFresche(new Set(arrivate.map((v) => v.id)));
        const prima = arrivate[0];
        if (prima !== undefined && prima.stato === "nuova") {
          toast(`Nuova richiesta da ${prima.nome}`);
        }
      }
    }

    viste.current = ids;
  }, [voci, toast]);

  function scegli(nuovo: Filtro) {
    setFiltro(nuovo);

    const stato = statoDaFiltro(nuovo);
    const indirizzo = stato === undefined ? percorso : `${percorso}?stato=${stato}`;
    window.history.replaceState(window.history.state, "", indirizzo);
  }

  const posizione = FILTRI.findIndex((f) => f.chiave === filtro);
  const suffisso = statoDaFiltro(filtro) === undefined ? "" : `?stato=${statoDaFiltro(filtro)}`;
  let progressivo = 0;

  return (
    <div className={stili.area} data-aperto={idAperto === null ? undefined : ""}>
      <div className={stili.testaArea}>
        <section className={`lc-up ${stili.titolo}`}>
          <span className="lc-eyebrow">
            {voci.length} {voci.length === 1 ? "richiesta" : "richieste"} in tutto
          </span>
          <h1 className="lc-titolo">Richieste</h1>
        </section>

        <div className={stili.segmentato} role="group" aria-label="Filtro richieste">
          <span
            className={stili.indicatore}
            style={{ transform: `translateX(calc(${posizione * 100}% + ${posizione * 4}px))` }}
            aria-hidden
          />
          {FILTRI.map((f) => (
            <button
              key={f.chiave}
              type="button"
              className={`${stili.segmento} ${filtro === f.chiave ? stili.segmentoAttivo : ""}`}
              aria-pressed={filtro === f.chiave}
              onClick={() => scegli(f.chiave)}
            >
              {f.testo}
              {f.chiave === "nuove" && nNuove > 0 && (
                <span className={`lc-pulse ${stili.contaNuove}`}>{nNuove}</span>
              )}
              {f.chiave === "confermate" && <span className={stili.contaMono}>{nConfermate}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className={stili.corpo}>
        <div className={stili.elenco}>
          {gruppi.map((g) => (
            <section key={g.codice} className={stili.gruppo} aria-label={g.etichetta}>
              <div className={stili.testaGruppo}>
                <span className="lc-eyebrow">{g.etichetta}</span>
                <span className={stili.filo} aria-hidden />
                <span className={stili.conteggio}>{g.voci.length}</span>
              </div>

              {g.voci.map((v) => {
                const nuova = v.stato === "nuova";
                const fresca = fresche.has(v.id);
                const attiva = idAperto === v.id;
                const ritardo = fresca ? 0 : Math.min(progressivo++, 10) * 60;

                return (
                  <Link
                    key={v.id}
                    href={`/pannello/richieste/${v.id}${suffisso}`}
                    scroll={false}
                    className={`lc-press ${fresca ? "lc-new" : "lc-up"} ${stili.scheda} ${nuova ? stili.schedaNuova : ""} ${attiva ? stili.schedaAttiva : ""}`}
                    style={{ animationDelay: `${ritardo}ms` }}
                    aria-current={attiva ? "true" : undefined}
                  >
                    <span className={`${nuova ? "lc-pulse" : ""} ${stili.avatar} ${nuova ? stili.avatarNuovo : ""}`} aria-hidden>
                      {v.iniziali}
                    </span>
                    <span className={stili.testoScheda}>
                      <span className={stili.rigaNome}>
                        <span className={stili.nome}>{v.nome}</span>
                        <span className={stili.ora}>{v.ora}</span>
                      </span>
                      <span className={stili.riga}>{v.riga}</span>
                      <span className={stili.chips}>
                        <ChipStato tono={v.tono} testo={v.chip} />
                        {v.occasione !== undefined && <span className={stili.chipOccasione}>{v.occasione}</span>}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </section>
          ))}

          {gruppi.length === 0 && (
            <div className={`lc-up ${stili.vuoto}`}>
              <span className={stili.vuotoIcona}>
                <IconaSpunta misura={26} tratto={2} />
              </span>
              <span className={stili.vuotoTitolo}>Tutto in pari</span>
              <span className={stili.vuotoTesto}>
                {legaParole("Nessuna richiesta qui. Ti avvisiamo appena ne arriva una.", { vedova: true })}
              </span>
            </div>
          )}
        </div>

        <section className={stili.pannello} aria-label="Dettaglio richiesta">
          {children}
        </section>
      </div>
    </div>
  );
}

export function ChipStato({ tono, testo, grande = false }: { readonly tono: string; readonly testo: string; readonly grande?: boolean }) {
  return (
    <span className={`${stili.chip} ${stili[`chip_${tono}`] ?? ""} ${grande ? stili.chipGrande : ""}`}>
      <span className={stili.chipPunto} aria-hidden />
      {testo}
    </span>
  );
}
