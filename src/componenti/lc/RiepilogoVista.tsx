"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { GruppoData, Statistiche } from "@/lib/pannello/vista";

import { IconaAvanti } from "./Icone";
import stili from "./Riepilogo.module.css";

export interface VocePr {
  readonly nome: string;
  readonly iniziali: string;
  readonly confermate: number;
}

/**
 * Il riepilogo: quattro numeri, due grafici, la classifica dei PR e, sotto,
 * le prenotazioni confermate divise per data.
 *
 * I numeri partono da zero e salgono in 900 ms ogni volta che si apre la
 * schermata (la pagina si ricarica a ogni ingresso, quindi riparte da sé).
 * Chi ha chiesto meno movimento li vede già al valore finale.
 */
export function RiepilogoVista({
  stat,
  classifica,
  gruppiData,
}: {
  readonly stat: Statistiche;
  readonly classifica: readonly VocePr[];
  readonly gruppiData: readonly GruppoData[];
}) {
  const massimoSerata = Math.max(1, ...stat.perSerata.map((s) => s.conteggio));
  const nTipi = stat.perTipo.reduce((tot, t) => tot + t.conteggio, 0);
  const primo = classifica[0];

  return (
    <div className={stili.pagina}>
      <section className={`lc-up ${stili.testa}`}>
        <span className="lc-eyebrow">Tutte le prenotazioni</span>
        <h1 className="lc-titolo">Riepilogo</h1>
      </section>

      <div className={stili.kpi}>
        <Kpi etichetta="Richieste" valore={stat.totale} accento ritardo={0} />
        <Kpi etichetta="Confermate" valore={stat.confermate} ritardo={60} />
        <Kpi etichetta="Da gestire" valore={stat.daGestire} ritardo={120} />
        <Kpi etichetta="Tavoli" valore={stat.tavoli} ritardo={180} />
      </div>

      <div className={stili.dueColonne}>
        <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "150ms" }} aria-labelledby="per-serata">
          <h2 className={stili.etichetta} id="per-serata">
            Per serata
          </h2>
          {stat.perSerata.map((s, i) => (
            <div key={s.nome} className={stili.rigaSerata}>
              <span className={stili.nomeSerata}>
                {s.nome} {s.giorno !== "" && <span className={stili.giorno}>{s.giorno}</span>}
              </span>
              <span className={stili.conta}>{s.conteggio}</span>
              <div className={stili.pista}>
                <div
                  className={`lc-grow ${stili.barra}`}
                  style={{
                    width: `${Math.max(2, (s.conteggio / massimoSerata) * 100)}%`,
                    background: s.conteggio === massimoSerata && s.conteggio > 0 ? "var(--lc-accent)" : "var(--lc-text)",
                    animationDelay: `${200 + i * 90}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "250ms" }} aria-labelledby="per-tipo">
          <h2 className={stili.etichetta} id="per-tipo">
            Per tipo
          </h2>
          {nTipi === 0 ? (
            <p className={stili.vuoto}>Nessuna richiesta ancora.</p>
          ) : (
            <>
              <div className={stili.impilata} role="img" aria-label={stat.perTipo.map((t) => `${t.nome} ${t.conteggio}`).join(", ")}>
                {stat.perTipo.map((t, i) => (
                  <div
                    key={t.nome}
                    className="lc-grow"
                    style={{
                      width: `${(t.conteggio / nTipi) * 100}%`,
                      background: COLORI_TIPO[i % COLORI_TIPO.length],
                      animationDelay: `${300 + i * 120}ms`,
                    }}
                  />
                ))}
              </div>
              <ul className={stili.legenda}>
                {stat.perTipo.map((t, i) => (
                  <li key={t.nome}>
                    <span className={stili.chiave} style={{ background: COLORI_TIPO[i % COLORI_TIPO.length] }} aria-hidden />
                    <span className={stili.legendaNome}>{t.nome}</span>
                    <span className={stili.legendaConta}>{t.conteggio}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {primo !== undefined && (
        <>
          {/* Sul telefono: una riga che porta alla squadra. */}
          <Link
            href="/pannello/squadra"
            className={`lc-up lc-press ${stili.topMobile}`}
            style={{ animationDelay: "350ms" }}
          >
            <span className={stili.avatarTop} aria-hidden>
              {primo.iniziali}
            </span>
            <span className={stili.topTesto}>
              <span className={stili.topEtichetta}>Top PR</span>
              <span className={stili.topNome}>{primo.nome}</span>
            </span>
            <span className={stili.topNumero}>{primo.confermate}</span>
            <span className={stili.freccia}>
              <IconaAvanti />
            </span>
          </Link>

          {/* Sul computer: la classifica dei primi tre. */}
          <section className={`lc-up ${stili.classifica}`} style={{ animationDelay: "350ms" }} aria-labelledby="classifica">
            <div className={stili.testaClassifica}>
              <h2 className={stili.etichetta} id="classifica">
                Classifica PR
              </h2>
              <Link href="/pannello/squadra" className={stili.vediSquadra}>
                Vedi i PR
              </Link>
            </div>
            <ol className={stili.tre}>
              {classifica.slice(0, 3).map((m, i) => (
                <li key={m.nome} className={stili.tessera}>
                  <span className={stili.posizione} style={{ color: i === 0 ? "var(--lc-accent)" : "var(--lc-muted)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`${stili.avatarPiccolo} ${i === 0 ? stili.avatarPrimo : ""}`} aria-hidden>
                    {m.iniziali}
                  </span>
                  <span className={stili.nomePr}>{m.nome}</span>
                  <span className={stili.numeroPr}>{m.confermate}</span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      <section className={stili.perData} aria-labelledby="per-data">
        <h2 className={stili.etichetta} id="per-data">
          Confermate per data
        </h2>

        {gruppiData.length === 0 ? (
          <p className={stili.vuoto}>Ancora nessuna prenotazione confermata.</p>
        ) : (
          gruppiData.map((g) => (
            <div key={g.dataIso ?? "senza-data"} className={`${stili.gruppoData} ${g.passata ? stili.passata : ""}`}>
              <div className={stili.testaData}>
                <h3 className={stili.titoloData}>{g.etichetta}</h3>
                {g.passata && g.dataIso !== null && <span className={stili.tagPassata}>passata</span>}
                <span className={stili.filo} aria-hidden />
                <span className={stili.conteggio}>{g.voci.length}</span>
              </div>
              <ul className={stili.elencoData}>
                {g.voci.map((v) => (
                  <li key={v.id}>
                    <Link href={`/pannello/richieste/${v.id}`} className={`lc-press ${stili.rigaPersona}`}>
                      <span className={stili.avatarPiccolo} aria-hidden>
                        {v.iniziali}
                      </span>
                      <span className={stili.testoPersona}>
                        <span className={stili.nomePersona}>{v.nome}</span>
                        <span className={stili.sottoPersona}>
                          {[v.notte, v.tipo, v.persone].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className={stili.ora}>{v.ora}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

const COLORI_TIPO = ["var(--lc-accent)", "var(--lc-text)", "#55555e", "#3a3a44"] as const;

function Kpi({
  etichetta,
  valore,
  accento = false,
  ritardo,
}: {
  readonly etichetta: string;
  readonly valore: number;
  readonly accento?: boolean;
  readonly ritardo: number;
}) {
  const mostrato = useConteggio(valore);

  return (
    <div
      className={`lc-up ${stili.kpiCard} ${accento ? stili.kpiAccento : ""}`}
      style={{ animationDelay: `${ritardo}ms` }}
    >
      <span className={stili.kpiEtichetta}>{etichetta}</span>
      <span className={stili.kpiValore} aria-label={`${etichetta}: ${valore}`}>
        {mostrato}
      </span>
    </div>
  );
}

/** Da zero al valore in 900 ms, rallentando alla fine; subito il valore se si è chiesto meno movimento. */
function useConteggio(finale: number): number {
  const [valore, setValore] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValore(finale);
      return;
    }

    let inizio: number | null = null;
    let frame = 0;

    const passo = (ts: number) => {
      inizio ??= ts;
      const t = Math.min(1, (ts - inizio) / 900);
      setValore(Math.round(finale * (1 - Math.pow(1 - t, 3))));

      if (t < 1) {
        frame = requestAnimationFrame(passo);
      }
    };

    frame = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(frame);
  }, [finale]);

  return valore;
}
