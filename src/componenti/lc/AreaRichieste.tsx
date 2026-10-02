"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cercaRichieste } from "@/app/pannello/azioni";
import type { DatasetElenco } from "@/lib/pannello/elenco";
import {
  NOME_NOTTE_FILTRO,
  NOME_TIPO_FILTRO,
  NOTTI_FILTRO,
  TIPI_FILTRO,
  MAX_RICERCA,
  chiaveFiltri,
  filtriAttiviNelPannello,
  filtriDaParametri,
  sonoPredefiniti,
  suffissoDaFiltri,
  FILTRI_PREDEFINITI,
  type FiltriRichieste,
  type NotteFiltro,
  type QuandoFiltro,
  type TipoFiltro,
} from "@/lib/pannello/filtri-richieste";
import { giornoLungo, raggruppaPerSerata, type VoceRichiesta } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { IconaSpunta } from "./Icone";
import stili from "./Richieste.module.css";
import { useToast } from "./Toast";

/** I quattro pulsanti dello stato: ognuno è un filtro "stato" per il server (o nessuno, per "Tutte"). */
const STATI: readonly { readonly chiave: string; readonly testo: string; readonly stato: FiltriRichieste["stato"] }[] = [
  { chiave: "attesa", testo: "In attesa", stato: "in attesa" },
  { chiave: "confermate", testo: "Confermate", stato: "confermata" },
  { chiave: "rifiutate", testo: "Rifiutate", stato: "rifiutata" },
  { chiave: "tutte", testo: "Tutte", stato: undefined },
];

const DESCRIZIONE_QUANDO: Readonly<Record<QuandoFiltro, string>> = {
  futuri: "da oggi in poi",
  passate: "già passate",
  tutte: "in tutto",
};

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
 * I FILTRI SI APPLICANO NEL SERVER. Stato, serata, data, tipo e ricerca sono
 * parametri di una query (vedi elencoRichieste in dati.ts): a ogni cambio
 * l'elenco chiede al server la pagina giusta (cercaRichieste), che li
 * incrocia con l'ambito di chi guarda. Il layout porta soltanto la prima
 * schermata, coi filtri di partenza (da oggi in poi); il browser non riceve
 * mai tutte le richieste e non filtra niente da solo, se non per far
 * sembrare istantaneo il cambio di stato mentre la risposta arriva.
 *
 * I filtri stanno anche nell'indirizzo (?stato=nuova&data=2026-12-12), per non
 * perdersi dopo un ricaricamento e perché il ritorno dal dettaglio sappia
 * dove tornare.
 */
export function AreaRichieste({
  iniziali,
  comeLuca,
  children,
}: {
  readonly iniziali: DatasetElenco;
  /** Solo Luca vede da quale PR arriva una richiesta e può filtrare per PR. */
  readonly comeLuca: boolean;
  readonly children: ReactNode;
}) {
  const percorso = usePathname();
  const parametri = useSearchParams();
  const toast = useToast();

  const idAperto = /^\/pannello\/richieste\/([^/]+)/.exec(percorso)?.[1] ?? null;

  const [filtri, setFiltri] = useState<FiltriRichieste>(() => filtriDaParametri((k) => parametri.get(k)));
  /*
   * Il layout prepara l'elenco coi filtri di partenza. Se l'indirizzo ne porta altri, quell'elenco
   * sarebbe quello sbagliato sotto controlli già filtrati, e la sostituzione dopo l'idratazione
   * farebbe saltare la pagina: si parte senza schede, in caricamento, tenendo i conti e le date.
   */
  const [dati, setDati] = useState<DatasetElenco>(() =>
    sonoPredefiniti(filtriDaParametri((k) => parametri.get(k))) ? iniziali : { ...iniziali, voci: [], totale: 0 },
  );
  const [caricamento, setCaricamento] = useState(() => !sonoPredefiniti(filtriDaParametri((k) => parametri.get(k))));
  const [caricoAltre, setCaricoAltre] = useState(false);
  const [aperti, setAperti] = useState(() => filtriAttiviNelPannello(filtriDaParametri((k) => parametri.get(k))) > 0);

  const chiave = chiaveFiltri(filtri);
  const filtriRef = useRef(filtri);
  filtriRef.current = filtri;

  /* Un numero per ogni risposta: una risposta arrivata in ritardo, di un filtro già cambiato, si scarta. */
  const sequenza = useRef(0);
  const primoGiro = useRef(true);
  const ultimeIniziali = useRef(iniziali);

  /*
   * Le richieste arrivate mentre il pannello è aperto entrano dall'alto e lo
   * dicono con un avviso. Si confronta solo con l'elenco PRECEDENTE DELLO
   * STESSO FILTRO: cambiando filtro compaiono richieste diverse, ma non sono
   * "nuove arrivate" e non devono far scattare l'avviso.
   */
  const viste = useRef<{ readonly chiave: string; readonly ids: Set<string> }>({
    chiave: iniziali.chiave,
    ids: new Set(iniziali.voci.map((v) => v.id)),
  });
  const [fresche, setFresche] = useState<ReadonlySet<string>>(new Set());

  function applica(nuovo: DatasetElenco, controllaNuove: boolean) {
    if (controllaNuove && viste.current.chiave === nuovo.chiave) {
      const arrivate = nuovo.voci.filter((v) => !viste.current.ids.has(v.id));

      if (arrivate.length > 0) {
        setFresche(new Set(arrivate.map((v) => v.id)));
        const prima = arrivate[0];
        if (prima !== undefined && prima.stato === "in attesa") {
          toast(`Nuova richiesta da ${prima.nome}`);
        }
      }
    }

    const ids = new Set(viste.current.chiave === nuovo.chiave ? viste.current.ids : []);
    nuovo.voci.forEach((v) => ids.add(v.id));
    viste.current = { chiave: nuovo.chiave, ids };
    setDati(nuovo);
  }

  async function carica(per: FiltriRichieste, numero: number, controllaNuove: boolean) {
    try {
      const risposta = await cercaRichieste(per, 0);
      if (numero === sequenza.current) {
        applica(risposta, controllaNuove);
      }
    } catch {
      if (numero === sequenza.current) {
        toast("Non sono riuscito a caricare l'elenco");
      }
    } finally {
      if (numero === sequenza.current) {
        setCaricamento(false);
      }
    }
  }

  /* A ogni cambio di filtro: si chiede la pagina al server (la ricerca per testo aspetta un attimo che si finisca di scrivere). */
  useEffect(() => {
    // La prima volta, coi filtri di partenza, l'elenco è già quello che ha preparato il layout.
    if (primoGiro.current) {
      primoGiro.current = false;
      if (sonoPredefiniti(filtri)) {
        return;
      }
    }

    const numero = ++sequenza.current;
    setCaricamento(true);
    const attesa = filtri.q !== undefined && filtri.q !== "" ? 250 : 0;
    const timer = window.setTimeout(() => void carica(filtri, numero, false), attesa);

    return () => window.clearTimeout(timer);
    // Solo la chiave dei filtri: gli altri valori si leggono al momento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chiave]);

  /* Dopo un'azione (router.refresh) il layout manda un elenco nuovo: coi filtri di partenza si usa quello, altrimenti si richiede il proprio. */
  useEffect(() => {
    if (ultimeIniziali.current === iniziali) {
      return;
    }
    ultimeIniziali.current = iniziali;

    if (sonoPredefiniti(filtriRef.current)) {
      applica(iniziali, true);
    } else {
      const numero = ++sequenza.current;
      void carica(filtriRef.current, numero, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iniziali]);

  /* I filtri si riflettono nell'indirizzo, per non perderli e per il ritorno dal dettaglio. */
  useEffect(() => {
    window.history.replaceState(window.history.state, "", `${percorso}${suffissoDaFiltri(filtriRef.current)}`);
  }, [chiave, percorso]);

  /** Imposta un filtro; con undefined lo toglie (con exactOptionalPropertyTypes una chiave si toglie, non si azzera). */
  function imposta<K extends keyof FiltriRichieste>(chiaveFiltro: K, valore: FiltriRichieste[K] | undefined) {
    setFiltri((prima) => {
      const { [chiaveFiltro]: _tolto, ...resto } = prima;
      return (valore === undefined ? resto : { ...resto, [chiaveFiltro]: valore }) as FiltriRichieste;
    });
  }

  async function caricaAltre() {
    if (caricoAltre) {
      return;
    }

    setCaricoAltre(true);
    const per = filtri;

    try {
      const risposta = await cercaRichieste(per, dati.voci.length);

      // Se nel frattempo il filtro è cambiato, la pagina in più non c'entra più.
      if (chiaveFiltri(filtriRef.current) === risposta.chiave) {
        setDati((prima) => {
          const note = new Set(prima.voci.map((v) => v.id));
          return { ...prima, voci: [...prima.voci, ...risposta.voci.filter((v) => !note.has(v.id))], totale: risposta.totale };
        });
        risposta.voci.forEach((v) => viste.current.ids.add(v.id));
      }
    } catch {
      toast("Non sono riuscito a caricare altre richieste");
    } finally {
      setCaricoAltre(false);
    }
  }

  /* Mentre la risposta arriva si mostrano le righe già in mano, filtrate per stato: il cambio di stato resta istantaneo. */
  const visibili: readonly VoceRichiesta[] = useMemo(
    () => (filtri.stato === undefined ? dati.voci : dati.voci.filter((v) => v.stato === filtri.stato)),
    [dati.voci, filtri.stato],
  );
  const gruppi = useMemo(() => raggruppaPerSerata(visibili), [visibili]);

  const posizione = Math.max(
    0,
    STATI.findIndex((s) => s.stato === filtri.stato),
  );
  const suffisso = suffissoDaFiltri(filtri);
  const nPannello = filtriAttiviNelPannello(filtri);
  const conFiltri = !sonoPredefiniti(filtri);
  const altreDaCaricare = dati.voci.length < dati.totale;
  let progressivo = 0;

  const conto = (stato: FiltriRichieste["stato"]): number | null =>
    stato === undefined ? null : dati.perStato[stato];

  return (
    <div className={stili.area} data-aperto={idAperto === null ? undefined : ""}>
      <div className={stili.testaArea}>
        <section className={`lc-up ${stili.titolo}`}>
          <span className="lc-eyebrow">
            {caricamento && dati.voci.length === 0 ? "…" : dati.totale} {dati.totale === 1 ? "richiesta" : "richieste"}{" "}
            {filtri.data === undefined ? DESCRIZIONE_QUANDO[filtri.quando] : `del ${giornoLungo(filtri.data).toLowerCase()}`}
          </span>
          <h1 className="lc-titolo">Richieste</h1>
        </section>

        <div
          className={stili.segmentato}
          role="group"
          aria-label="Stato delle richieste"
          style={{ "--n": STATI.length } as CSSProperties}
        >
          <span
            className={stili.indicatore}
            style={{ transform: `translateX(calc(${posizione * 100}% + ${posizione * 4}px))` }}
            aria-hidden
          />
          {STATI.map((s) => {
            const n = conto(s.stato);
            const attivo = filtri.stato === s.stato;

            return (
              <button
                key={s.chiave}
                type="button"
                className={`${stili.segmento} ${attivo ? stili.segmentoAttivo : ""}`}
                aria-pressed={attivo}
                onClick={() => imposta("stato", s.stato)}
              >
                {s.testo}
                {s.stato === "in attesa" && n !== null && n > 0 && (
                  <span className={`lc-pulse ${stili.contaNuove}`}>{n}</span>
                )}
                {s.stato !== undefined && s.stato !== "in attesa" && n !== null && n > 0 && (
                  <span className={stili.contaMono}>{n}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={stili.corpo}>
        <div className={stili.elenco} aria-busy={caricamento}>
          {/* ------------------------------ ricerca e filtri ------------------------------ */}
          <div className={`lc-up ${stili.barraFiltri}`}>
            <div className={stili.rigaRicerca}>
              <label htmlFor="r-cerca" className="lc-sr">
                Cerca per nome o telefono
              </label>
              <input
                id="r-cerca"
                type="search"
                value={filtri.q ?? ""}
                onChange={(e) => imposta("q", e.target.value.slice(0, MAX_RICERCA))}
                placeholder="Cerca nome o telefono"
                autoComplete="off"
                enterKeyHint="search"
                maxLength={MAX_RICERCA}
                className={stili.ricerca}
              />
              <button
                type="button"
                className={`lc-press ${stili.apriFiltri}`}
                aria-expanded={aperti}
                aria-controls="r-pannello-filtri"
                onClick={() => setAperti((a) => !a)}
              >
                Filtri
                {nPannello > 0 && <span className={stili.numeroFiltri}>{nPannello}</span>}
              </button>
            </div>

            {aperti && (
              <div id="r-pannello-filtri" className={stili.pannelloFiltri}>
                <div className={stili.campoFiltro}>
                  <label htmlFor="r-notte">Serata</label>
                  <select
                    id="r-notte"
                    value={filtri.notte ?? ""}
                    onChange={(e) => imposta("notte", e.target.value === "" ? undefined : (e.target.value as NotteFiltro))}
                    className={stili.selezione}
                  >
                    <option value="">Tutte le serate</option>
                    {NOTTI_FILTRO.map((n) => (
                      <option key={n} value={n}>
                        {NOME_NOTTE_FILTRO[n]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={stili.campoFiltro}>
                  <label htmlFor="r-tipo">Tipo</label>
                  <select
                    id="r-tipo"
                    value={filtri.tipo ?? ""}
                    onChange={(e) => imposta("tipo", e.target.value === "" ? undefined : (e.target.value as TipoFiltro))}
                    className={stili.selezione}
                  >
                    <option value="">Tutti i tipi</option>
                    {TIPI_FILTRO.map((t) => (
                      <option key={t} value={t}>
                        {NOME_TIPO_FILTRO[t]}
                      </option>
                    ))}
                  </select>
                </div>

                {comeLuca && (
                  <div className={stili.campoFiltro}>
                    <label htmlFor="r-pr">Provenienza</label>
                    <select
                      id="r-pr"
                      value={filtri.pr ?? ""}
                      onChange={(e) => imposta("pr", e.target.value === "" ? undefined : e.target.value)}
                      className={stili.selezione}
                    >
                      <option value="">Tutte</option>
                      <option value="diretto">Dirette, senza PR</option>
                      {dati.elencoPr.map((p) => (
                        <option key={p.id} value={p.id}>
                          PR {p.nome}
                          {p.attivo ? "" : " (disattivato)"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={stili.campoFiltro}>
                  <label htmlFor="r-data">Data</label>
                  <input
                    id="r-data"
                    type="date"
                    value={filtri.data ?? ""}
                    onChange={(e) => imposta("data", e.target.value === "" ? undefined : e.target.value)}
                    className={stili.selezione}
                  />
                </div>

                <div className={stili.campoFiltro}>
                  <label htmlFor="r-quando">Quando</label>
                  <select
                    id="r-quando"
                    value={filtri.quando}
                    onChange={(e) => imposta("quando", e.target.value as QuandoFiltro)}
                    disabled={filtri.data !== undefined}
                    className={stili.selezione}
                  >
                    <option value="futuri">Da oggi in poi</option>
                    <option value="passate">Già passate</option>
                    <option value="tutte">Tutte</option>
                  </select>
                </div>

                <button
                  type="button"
                  className={`lc-press ${stili.azzeraTutto}`}
                  onClick={() => setFiltri({ ...FILTRI_PREDEFINITI })}
                  disabled={sonoPredefiniti(filtri)}
                >
                  Azzera i filtri
                </button>
              </div>
            )}

            {/* ------------------------- le prossime serate con richieste ------------------------- */}
            {dati.date.length > 0 && (
              <div className={stili.rail} role="group" aria-label="Serate con richieste">
                <button
                  type="button"
                  className={`lc-press ${stili.chipData} ${filtri.data === undefined ? stili.chipDataAttiva : ""}`}
                  aria-pressed={filtri.data === undefined}
                  onClick={() => imposta("data", undefined)}
                >
                  <span className={stili.chipDataTesto}>Tutte</span>
                </button>
                {dati.date.map((d) => {
                  const attiva = filtri.data === d.dataIso;

                  return (
                    <button
                      key={d.dataIso}
                      type="button"
                      className={`lc-press ${stili.chipData} ${attiva ? stili.chipDataAttiva : ""}`}
                      aria-pressed={attiva}
                      onClick={() => imposta("data", attiva ? undefined : d.dataIso)}
                    >
                      <span className={stili.chipDataTesto}>{d.breve}</span>
                      <span className={stili.chipDataNotte}>{d.notte}</span>
                      <span className={`${stili.chipDataNumero} ${d.daGestire > 0 ? stili.chipDataDaGestire : ""}`}>
                        {d.daGestire > 0 ? `${d.daGestire} da gestire` : `${d.totale}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={caricamento ? stili.sfumato : undefined}>
            {gruppi.map((g) => (
              <section key={g.chiave} className={stili.gruppo} aria-label={g.etichetta}>
                <div className={stili.testaGruppo}>
                  <span className="lc-eyebrow">{g.etichetta}</span>
                  <span className={stili.filo} aria-hidden />
                  <span className={stili.conteggio}>{g.voci.length}</span>
                </div>

                {g.voci.map((v) => {
                  const nuova = v.stato === "in attesa";
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
                          {comeLuca && (
                            <span className={v.prNome === undefined ? stili.chipDiretta : stili.chipPr}>
                              {v.prNome === undefined ? "Diretta" : `PR ${v.prNome}`}
                            </span>
                          )}
                          {v.occasione !== undefined && <span className={stili.chipOccasione}>{v.occasione}</span>}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </section>
            ))}

            {gruppi.length === 0 && !caricamento && (
              <div className={`lc-up ${stili.vuoto}`}>
                <span className={stili.vuotoIcona}>
                  <IconaSpunta misura={26} tratto={2} />
                </span>
                <span className={stili.vuotoTitolo}>{conFiltri ? "Nessuna richiesta con questi filtri" : "Tutto in pari"}</span>
                <span className={stili.vuotoTesto}>
                  {legaParole(
                    conFiltri
                      ? "Prova ad allargare la ricerca o ad azzerare i filtri."
                      : "Nessuna richiesta qui. Ti avvisiamo appena ne arriva una.",
                    { vedova: true },
                  )}
                </span>
                {conFiltri && (
                  <button type="button" className={`lc-press ${stili.azzeraTutto}`} onClick={() => setFiltri({ ...FILTRI_PREDEFINITI })}>
                    Azzera i filtri
                  </button>
                )}
              </div>
            )}

            {altreDaCaricare && (
              <button type="button" className={`lc-press ${stili.altre}`} onClick={() => void caricaAltre()} disabled={caricoAltre}>
                {caricoAltre ? "Un attimo…" : `Mostra altre ${Math.min(100, dati.totale - dati.voci.length)} di ${dati.totale - dati.voci.length}`}
              </button>
            )}
          </div>
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
