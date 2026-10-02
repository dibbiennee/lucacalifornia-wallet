"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { NumeriPr } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { ChipStato } from "./AreaRichieste";
import { negliAppunti } from "./appunti";
import { IconaCopia, IconaMessaggio } from "./Icone";
import stili from "./HomePr.module.css";
import { useToast } from "./Toast";

/**
 * La home del PR.
 *
 * Dall'alto: i numeri veri (portate, in attesa, confermate, rifiutate), il
 * suo link da girare, le prossime serate con le sue conferme, le confermate
 * per tipo e le ultime richieste.
 *
 * Un PR non decide niente: qui legge soltanto cosa è successo alle persone che
 * ha portato. Ogni sezione compare solo se ha qualcosa da dire: niente grafici
 * a zero e niente numeri finti per riempire. Se non è ancora arrivata nessuna
 * richiesta, la schermata spiega come farne arrivare (il link) e basta.
 */
export function HomePr({
  nome,
  codice,
  link,
  numeri,
  traffico,
}: {
  readonly nome: string;
  readonly codice: string;
  /** Il link intero, https://dominio/pr/<codice>: lo compone il server. */
  readonly link: string;
  readonly numeri: NumeriPr;
  /** Le visite e i moduli del suo link, già calcolati sul server (solo i suoi). */
  readonly traffico: ReactNode;
}) {
  const toast = useToast();
  const primoNome = nome.split(/\s+/)[0] ?? nome;
  const massimoTipo = Math.max(1, ...numeri.confermatePerTipo.map((t) => t.conteggio));

  async function copia() {
    toast((await negliAppunti(link)) ? "Link copiato" : "Non riesco a copiare, selezionalo a mano");
  }

  const messaggio = encodeURIComponent(`Prenota con me, tavoli e bracciali per le serate: ${link}`);

  return (
    <div className={stili.pagina}>
      <section className={`lc-up ${stili.testa}`}>
        <span className="lc-eyebrow">Area PR</span>
        <h1 className="lc-titolo">Home</h1>
        <p className={stili.saluto}>
          {legaParole(`Ciao ${primoNome}, ecco a che punto sei.`, { vedova: false })}
        </p>
      </section>

      {/* ------------------------------ numeri ------------------------------ */}
      {numeri.totale > 0 && (
        <div className={`lc-up ${stili.kpi}`} style={{ animationDelay: "60ms" }}>
          <div className={stili.kpiCard}>
            <span className={stili.kpiEtichetta}>Portate</span>
            <span className={stili.kpiValore}>{numeri.totale}</span>
          </div>
          <div className={stili.kpiCard}>
            <span className={stili.kpiEtichetta}>In attesa</span>
            <span className={stili.kpiValore}>{numeri.inAttesa}</span>
          </div>
          <div className={stili.kpiCard}>
            <span className={stili.kpiEtichetta}>Confermate</span>
            <span className={stili.kpiValore}>{numeri.confermate}</span>
          </div>
          <div className={stili.kpiCard}>
            <span className={stili.kpiEtichetta}>Rifiutate</span>
            <span className={stili.kpiValore}>{numeri.rifiutate}</span>
          </div>
        </div>
      )}

      {/* ------------------------------- il link ------------------------------- */}
      <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "180ms" }} aria-labelledby="titolo-link">
        <h2 id="titolo-link" className={stili.titoloScheda}>
          Il tuo link
        </h2>
        <p className={stili.testoScheda}>
          {legaParole("Giralo a chi vuole prenotare. Ogni richiesta che arriva da qui è tua e la trovi nelle richieste.", {
            vedova: true,
          })}
        </p>
        <span className={stili.indirizzo}>
          <span className={stili.dominio}>{link.slice(0, link.length - codice.length)}</span>
          <span className={stili.codice}>{codice}</span>
        </span>
        <div className={stili.duePulsanti}>
          <button type="button" className={`lc-press ${stili.secondario}`} onClick={() => void copia()}>
            <IconaCopia misura={18} />
            Copia il link
          </button>
          <a
            className={`lc-press ${stili.primario}`}
            href={`https://wa.me/?text=${messaggio}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconaMessaggio misura={18} />
            Manda su WhatsApp
          </a>
        </div>
      </section>

      {traffico}

      {numeri.totale === 0 && (
        <p className={`lc-up ${stili.vuoto}`} style={{ animationDelay: "240ms" }}>
          {legaParole(
            "Non è ancora arrivata nessuna richiesta. Appena qualcuno prenota dal tuo link la vedi qui, e ti aspetta nelle richieste.",
            { vedova: true },
          )}
        </p>
      )}

      {/* --------------------------- prossime serate --------------------------- */}
      {numeri.prossime.length > 0 && (
        <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "240ms" }} aria-labelledby="titolo-serate">
          <h2 id="titolo-serate" className={stili.titoloScheda}>
            Prossime serate
          </h2>
          <ul className={stili.elenco}>
            {numeri.prossime.map((p) => (
              <li key={p.dataIso} className={stili.riga}>
                <span className={stili.rigaTitolo}>{p.etichetta}</span>
                <span className={stili.rigaSotto}>{p.dettaglio}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --------------------------- confermate per tipo --------------------------- */}
      {numeri.confermatePerTipo.length > 0 && (
        <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "300ms" }} aria-labelledby="titolo-tipi">
          <h2 id="titolo-tipi" className={stili.titoloScheda}>
            Confermate per tipo
          </h2>
          <ul className={stili.elenco}>
            {numeri.confermatePerTipo.map((t) => (
              <li key={t.nome} className={stili.barraRiga}>
                <span className={stili.rigaTitolo}>{t.nome}</span>
                <span className={stili.barra} aria-hidden>
                  <span className={stili.barraPiena} style={{ width: `${(t.conteggio / massimoTipo) * 100}%` }} />
                </span>
                <span className={stili.conteggio}>{t.conteggio}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ----------------------------- ultime richieste ----------------------------- */}
      {numeri.recenti.length > 0 && (
        <section className={`lc-up ${stili.scheda}`} style={{ animationDelay: "360ms" }} aria-labelledby="titolo-recenti">
          <div className={stili.testaScheda}>
            <h2 id="titolo-recenti" className={stili.titoloScheda}>
              Ultime richieste
            </h2>
            <Link href="/pannello/richieste" className={stili.tutte}>
              Vedi tutte
            </Link>
          </div>
          <ul className={stili.elenco}>
            {numeri.recenti.map((v) => (
              <li key={v.id}>
                <Link href={`/pannello/richieste/${v.id}`} className={`lc-press ${stili.recente}`}>
                  <span className={stili.recenteTesti}>
                    <span className={stili.rigaTitolo}>{v.nome}</span>
                    <span className={stili.rigaSotto}>{v.riga}</span>
                  </span>
                  <span className={stili.recenteLato}>
                    <ChipStato tono={v.tono} testo={v.chip} />
                    <span className={stili.arrivata}>{v.arrivata}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
