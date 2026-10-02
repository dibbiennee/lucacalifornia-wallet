"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { negliAppunti } from "./appunti";
import { AggiungiPr } from "./AggiungiPr";
import { IconaCopia, IconaPiu, IconaSpunta } from "./Icone";
import stili from "./Squadra.module.css";
import { useToast } from "./Toast";

export interface MembroSquadra {
  readonly nome: string;
  readonly iniziali: string;
  readonly codice: string;
  readonly confermate: number;
  readonly liste: number;
  readonly tavoli: number;
  readonly braccialetti: number;
}

const INDIRIZZO = "https://lucacalifornia.satoshiweb.it";

/** "1 lista", "2 liste": il singolare conta, "1 liste" si legge male. */
function conta(n: number, singolare: string, plurale: string): string {
  return `${n} ${n === 1 ? singolare : plurale}`;
}

/**
 * La squadra: i PR in classifica, ognuno col suo link personale.
 *
 * Telefono: una scheda per PR. Computer: una tabella. I numeri sono le
 * richieste confermate vere portate da ciascuno (aggregate dal link da cui
 * sono arrivate); non c'è la colonna "provvigioni" del prototipo, perché un
 * importo per prenotazione non esiste da nessuna parte e non va inventato.
 */
export function SquadraVista({ membri }: { readonly membri: readonly MembroSquadra[] }) {
  const toast = useToast();
  const [aggiungi, setAggiungi] = useState(false);
  const chiudi = useCallback(() => setAggiungi(false), []);
  const [copiato, setCopiato] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const massimo = Math.max(1, ...membri.map((m) => m.confermate));
  const totale = membri.reduce((tot, m) => tot + m.confermate, 0);

  async function copia(m: MembroSquadra) {
    if (!(await negliAppunti(`${INDIRIZZO}/${m.codice}`))) {
      toast("Non riesco a copiare, selezionalo a mano");
      return;
    }

    window.clearTimeout(timer.current);
    setCopiato(m.codice);
    timer.current = window.setTimeout(() => setCopiato(null), 1800);
    toast(`Link di ${m.nome.split(" ")[0] ?? m.nome} copiato`);
  }

  function bottoneCopia(m: MembroSquadra, classe: string | undefined) {
    const fatto = copiato === m.codice;

    return (
      <button
        type="button"
        className={`lc-press ${classe ?? ""} ${fatto ? (stili.copiato ?? "") : ""}`}
        aria-label={`Copia il link di ${m.nome}`}
        onClick={() => void copia(m)}
      >
        {fatto ? <IconaSpunta misura={14} /> : <IconaCopia misura={14} />}
        {fatto ? "Copiato" : "Copia"}
      </button>
    );
  }

  return (
    <div className={stili.pagina}>
      <section className={`lc-up ${stili.testa}`}>
        <div className={stili.titoli}>
          <span className="lc-eyebrow">
            {membri.length} PR · {conta(totale, "confermata", "confermate")}
          </span>
          <h1 className="lc-titolo">Squadra</h1>
        </div>
        <button type="button" className={`lc-press ${stili.aggiungiPr}`} onClick={() => setAggiungi(true)}>
          <IconaPiu misura={15} />
          <span>
            <span className={stili.soloPc}>Aggiungi </span>PR
          </span>
        </button>
      </section>

      {membri.length === 0 && (
        <p className={stili.vuoto}>Nessun PR ancora. Con “PR” ne aggiungi uno e ricevi il suo link personale.</p>
      )}

      {/* ----- Telefono: una scheda per PR ----- */}
      <ul className={stili.carte}>
        {membri.map((m, i) => (
          <li
            key={m.codice}
            className={`lc-up ${stili.carta}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className={stili.rigaTesta}>
              <span className={stili.posizione} style={{ color: i === 0 ? "var(--lc-accent)" : "var(--lc-muted)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`${stili.avatar} ${i === 0 ? stili.avatarPrimo : ""}`} aria-hidden>
                {m.iniziali}
              </span>
              <div className={stili.chi}>
                <span className={stili.nome}>{m.nome}</span>
                <span className={stili.stat}>
                  {conta(m.liste, "lista", "liste")} · {conta(m.tavoli, "tavolo", "tavoli")} ·{" "}
                  {conta(m.braccialetti, "bracciale", "bracciali")}
                </span>
              </div>
              <div className={stili.totale}>
                <span className={stili.numero}>{m.confermate}</span>
                <span className={stili.stat}>{m.confermate === 1 ? "confermata" : "confermate"}</span>
              </div>
            </div>

            <div className={stili.pista} aria-hidden>
              <div
                className={`lc-grow ${stili.barra}`}
                style={{
                  width: `${Math.max(2, (m.confermate / massimo) * 100)}%`,
                  background: i === 0 ? "var(--lc-accent)" : "var(--lc-text)",
                  animationDelay: `${i * 70}ms`,
                }}
              />
            </div>

            <div className={stili.campoLink}>
              <span className={stili.slug}>/{m.codice}</span>
              {bottoneCopia(m, stili.copia)}
            </div>
          </li>
        ))}
      </ul>

      {/* ----- Computer: una tabella ----- */}
      {membri.length > 0 && (
        <section className={`lc-up ${stili.tabella}`} style={{ animationDelay: "100ms" }} aria-label="Squadra">
          <div className={`${stili.riga} ${stili.intestazione}`} role="presentation">
            <span>PR</span>
            <span>Link personale</span>
            <span>Confermate</span>
            <span>Liste</span>
            <span>Tavoli</span>
            <span className={stili.destra}>Bracciali</span>
          </div>
          {membri.map((m, i) => (
            <div key={m.codice} className={`${stili.riga} ${stili.corpoRiga}`}>
              <div className={stili.cellaPr}>
                <span className={stili.posizione} style={{ color: i === 0 ? "var(--lc-accent)" : "var(--lc-muted)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`${stili.avatar} ${i === 0 ? stili.avatarPrimo : ""}`} aria-hidden>
                  {m.iniziali}
                </span>
                <span className={stili.nome}>{m.nome}</span>
              </div>
              <div className={stili.cellaLink}>
                <span className={stili.slugTabella}>/{m.codice}</span>
                {bottoneCopia(m, stili.copiaTabella)}
              </div>
              <div className={stili.cellaBarra}>
                <div className={stili.pista} aria-hidden>
                  <div
                    className={`lc-grow ${stili.barra}`}
                    style={{
                      width: `${Math.max(2, (m.confermate / massimo) * 100)}%`,
                      background: i === 0 ? "var(--lc-accent)" : "var(--lc-text)",
                      animationDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
                <span className={stili.numeroMono}>{m.confermate}</span>
              </div>
              <span className={stili.cifra}>{m.liste}</span>
              <span className={stili.cifra}>{m.tavoli}</span>
              <span className={`${stili.cifra} ${stili.destra}`}>{m.braccialetti}</span>
            </div>
          ))}
        </section>
      )}

      <AggiungiPr aperto={aggiungi} chiudi={chiudi} />
    </div>
  );
}
