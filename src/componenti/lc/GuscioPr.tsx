"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

import { IconaCasa, IconaEsci, IconaRichieste } from "./Icone";
import stili from "./GuscioPr.module.css";
import { ToastProvider } from "./Toast";

const VOCI = [
  { testo: "Home", dove: "/pannello/home", Icona: IconaCasa },
  { testo: "Richieste", dove: "/pannello/richieste", Icona: IconaRichieste },
] as const;

/**
 * Il guscio dell'area PR: una piccola app a due schermate, Home e Richieste,
 * col nome di chi è dentro e il pulsante per uscire. Niente squadra, niente
 * impostazioni: un PR ha davanti solo quello che gli serve ogni giorno.
 *
 * Non è il guscio di Luca ridotto. Cambia la testata (il nome del PR, non il
 * marchio con "Live"), cambia la navigazione (due voci), e non c'è nulla delle
 * funzioni del proprietario, nemmeno nascosto: il guscio non le conosce.
 * I permessi veri, in ogni caso, stanno sul server.
 *
 * Il conto delle richieste da guardare arriva dal layout, che lo calcola una
 * volta sola dai dati di questo PR e di nessun altro.
 */
export function GuscioPr({
  nome,
  inAttesa,
  children,
}: {
  readonly nome: string;
  /** Richieste sue ancora in attesa di Luca: il numero che sta sulla voce "Richieste". */
  readonly inAttesa: number;
  readonly children: ReactNode;
}) {
  const percorso = usePathname();
  const router = useRouter();

  const indice = VOCI.findIndex((v) => percorso.startsWith(v.dove));
  // Dentro una singola richiesta, sul telefono, il dettaglio copre tutto e la barra sparisce.
  const dentroDettaglio = /^\/pannello\/richieste\/[^/]+/.test(percorso);
  const primoNome = nome.split(/\s+/)[0] ?? nome;
  const badgeDi = (dove: string): number => (dove === "/pannello/richieste" ? inAttesa : 0);

  async function esci() {
    try {
      await fetch("/api/pannello/esci", { method: "POST" });
    } finally {
      router.replace("/pannello/accesso");
      router.refresh();
    }
  }

  return (
    <ToastProvider>
      <div className={stili.guscio} data-dettaglio={dentroDettaglio ? "" : undefined}>
        <a href="#principale" className={stili.salta}>
          Vai al contenuto
        </a>

        <header className={stili.testata}>
          <div className={stili.marchio}>
            <span className={stili.logo} aria-hidden>
              LC
            </span>
            <span className={stili.duePiani}>
              <span className={stili.nome}>{primoNome}</span>
              <span className={stili.sotto}>Area PR</span>
            </span>
          </div>

          <nav aria-label="Navigazione" className={stili.navAlta}>
            {VOCI.map(({ testo, dove, Icona }, i) => (
              <Link
                key={dove}
                href={dove}
                className={`${stili.voceAlta} ${i === indice ? stili.attiva : ""}`}
                aria-current={i === indice ? "page" : undefined}
              >
                <Icona misura={18} />
                {testo}
                {badgeDi(dove) > 0 && (
                  <span className={`lc-pulse ${stili.badge}`}>
                    {badgeDi(dove)}
                    <span className="lc-sr"> richieste in attesa</span>
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <button type="button" className={`lc-press ${stili.esci}`} onClick={() => void esci()}>
            <IconaEsci misura={18} />
            <span>Esci</span>
          </button>
        </header>

        <main id="principale" className={stili.contenuto} tabIndex={-1}>
          {children}
        </main>

        <nav aria-label="Navigazione" className={stili.barra} style={{ "--n": VOCI.length } as CSSProperties}>
          <span
            className={stili.indicatoreBarra}
            style={{
              transform: `translateX(calc(${Math.max(indice, 0) * 100}% + ${Math.max(indice, 0) * 4}px))`,
              opacity: indice < 0 ? 0 : 1,
            }}
            aria-hidden
          />
          {VOCI.map(({ testo, dove, Icona }, i) => (
            <Link
              key={dove}
              href={dove}
              className={`${stili.voceBarra} ${i === indice ? stili.attiva : ""}`}
              aria-current={i === indice ? "page" : undefined}
            >
              <span className={stili.iconaBarra}>
                <Icona />
                {badgeDi(dove) > 0 && (
                  <span className={`lc-pulse ${stili.badgeBarra}`}>
                    {badgeDi(dove)}
                    <span className="lc-sr"> richieste in attesa</span>
                  </span>
                )}
              </span>
              {testo}
            </Link>
          ))}
        </nav>
      </div>
    </ToastProvider>
  );
}
