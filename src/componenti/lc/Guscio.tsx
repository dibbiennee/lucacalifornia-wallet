"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, type CSSProperties, type ReactNode } from "react";

import { negliAppunti } from "./appunti";
import { legaParole } from "@/lib/tipografia";
import { FoglioInferiore } from "./FoglioInferiore";
import {
  IconaAndamento,
  IconaCampanella,
  IconaEsci,
  IconaInvia,
  IconaLink,
  IconaPuntini,
  IconaRichieste,
  IconaSquadra,
} from "./Icone";
import stili from "./Guscio.module.css";
import { ToastProvider, useToast } from "./Toast";
import { useNotifiche } from "./useNotifiche";

/**
 * Tre voci sole. Il riepilogo e la lista d'attesa non hanno una voce loro:
 * stanno dentro Richieste (le "sezioni" più sotto), e quando una delle due
 * è aperta la voce accesa resta Richieste.
 */
const VOCI = [
  { testo: "Richieste", dove: "/pannello/richieste", anche: ["/pannello/attesa", "/pannello/riepilogo"], Icona: IconaRichieste },
  { testo: "PR", dove: "/pannello/squadra", anche: [], Icona: IconaSquadra },
  { testo: "Analisi", dove: "/pannello/analisi", anche: [], Icona: IconaAndamento },
] as const;

/**
 * Il guscio del pannello: testata e barra in basso sul telefono, barra
 * laterale sul computer. Cambia a 900px, e cambia solo il CSS: il contenuto
 * che sta in mezzo è lo stesso.
 *
 * Il conto delle richieste nuove arriva da fuori (dal layout, che lo calcola
 * una volta sola): il numero sulla voce "Richieste" deve essere uguale da
 * qualunque schermata lo si guardi.
 */
export function Guscio({
  nuove,
  attesa,
  indirizzo,
  children,
}: {
  readonly nuove: number;
  /** L'indirizzo del sito, con il protocollo: il link di Luca per prenotare senza passare da un PR. */
  readonly indirizzo: string;
  /** Persone in lista d'attesa che aspettano una risposta: il numero sulla voce "Attesa". */
  readonly attesa: number;
  readonly children: ReactNode;
}) {
  return (
    <ToastProvider>
      <Interno nuove={nuove} attesa={attesa} indirizzo={indirizzo}>
        {children}
      </Interno>
    </ToastProvider>
  );
}

function Interno({
  nuove,
  attesa,
  indirizzo,
  children,
}: {
  readonly nuove: number;
  readonly attesa: number;
  readonly indirizzo: string;
  readonly children: ReactNode;
}) {
  const linkLuca = `${indirizzo}/prenota`;
  const percorso = usePathname();
  const router = useRouter();
  const toast = useToast();
  const notifiche = useNotifiche();
  const [menu, setMenu] = useState(false);
  const chiudiMenu = useCallback(() => setMenu(false), []);

  const indice = VOCI.findIndex((v) => [v.dove, ...v.anche].some((d) => percorso.startsWith(d)));
  /** Il numero da mostrare sulla voce: le richieste da gestire. */
  const badgeDi = (dove: string): number => (dove === "/pannello/richieste" ? nuove : 0);
  const nelleRichieste = /^\/pannello\/(richieste|attesa|riepilogo)/.test(percorso);
  // La lista d'attesa compare solo quando c'è qualcuno da gestire (o se è già aperta).
  const mostraAttesa = attesa > 0 || percorso.startsWith("/pannello/attesa");
  // Dentro una singola richiesta, sul telefono, il dettaglio copre tutto e la barra sparisce.
  const dentroDettaglio = /^\/pannello\/richieste\/[^/]+/.test(percorso);

  async function esci() {
    try {
      await fetch("/api/pannello/esci", { method: "POST" });
    } finally {
      // Anche se la chiamata fallisce si torna all'accesso: il layout
      // ricontrolla la sessione e rimanda qui chi è ancora dentro.
      router.replace("/pannello/accesso");
      router.refresh();
    }
  }

  async function copiaLink() {
    setMenu(false);
    toast((await negliAppunti(linkLuca)) ? "Link copiato" : "Non riesco a copiare, selezionalo a mano");
  }

  const nomeNotifiche = notifiche.accese
    ? "Notifiche: attive. Tocca per spegnerle"
    : "Notifiche: spente. Tocca per accenderle";

  return (
    <div className={stili.guscio} data-dettaglio={dentroDettaglio ? "" : undefined}>
      <a href="#principale" className={stili.salta}>
        Vai al contenuto
      </a>

      {/* ----- Barra laterale, dal computer in su ----- */}
      <aside className={stili.laterale}>
        <Marchio />

        <nav aria-label="Navigazione" className={stili.navLaterale}>
          <span
            className={stili.indicatoreLaterale}
            style={{ transform: `translateY(${Math.max(indice, 0) * 48}px)`, opacity: indice < 0 ? 0 : 1 }}
            aria-hidden
          />
          {VOCI.map(({ testo, dove, Icona }, i) => (
            <Link
              key={dove}
              href={dove}
              className={`${stili.voceLaterale} ${i === indice ? stili.attiva : ""}`}
              aria-current={i === indice ? "page" : undefined}
            >
              <Icona misura={18} />
              <span className={stili.testoVoce}>{testo}</span>
              {badgeDi(dove) > 0 && (
                <span className={`lc-pulse ${stili.badge}`}>
                  {badgeDi(dove)}
                  <span className="lc-sr"> richieste da gestire</span>
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className={stili.spazio} />

        <div className={stili.piedeLaterale}>
          <button
            type="button"
            role="switch"
            aria-checked={notifiche.accese}
            onClick={() => void notifiche.alterna()}
            className={stili.cardNotifiche}
          >
            <span className={stili.duePiani}>
              <span className={stili.titoletto}>Notifiche</span>
              <span className={stili.sotto}>{legaParole(testoNotifiche(notifiche.stato), { vedova: false })}</span>
            </span>
            <Interruttore acceso={notifiche.accese} piccolo />
          </button>

          <button
            type="button"
            className={`lc-press ${stili.provaLaterale}`}
            onClick={() => void notifiche.prova()}
            disabled={notifiche.provaInCorso}
          >
            <IconaInvia misura={16} />
            {notifiche.provaInCorso ? "Mando..." : "Manda una prova"}
          </button>

          <button type="button" className={stili.esciLaterale} onClick={() => void esci()}>
            <IconaEsci misura={16} />
            Esci
          </button>
        </div>
      </aside>

      <div className={stili.colonna}>
        {/* ----- Testata, solo sul telefono ----- */}
        <header className={stili.testata}>
          <Marchio />
          <div className={stili.azioniTestata}>
            <button
              type="button"
              className={`lc-press ${stili.tondo}`}
              aria-label={nomeNotifiche}
              onClick={() => void notifiche.alterna()}
            >
              <IconaCampanella />
              <span
                className={stili.puntino}
                style={{ background: notifiche.accese ? "var(--lc-ok)" : "var(--lc-off)" }}
                aria-hidden
              />
            </button>
            <button
              type="button"
              className={`lc-press ${stili.tondo}`}
              aria-label="Menu"
              aria-haspopup="dialog"
              onClick={() => setMenu(true)}
            >
              <IconaPuntini />
            </button>
          </div>
        </header>

        <main id="principale" className={stili.contenuto} tabIndex={-1}>
          {nelleRichieste && !dentroDettaglio && (
            <nav aria-label="Sezioni delle richieste" className={stili.sezioni}>
              <Link
                href="/pannello/richieste"
                className={`${stili.sezione} ${percorso.startsWith("/pannello/richieste") ? stili.sezioneAttiva : ""}`}
                aria-current={percorso.startsWith("/pannello/richieste") ? "page" : undefined}
              >
                Richieste
              </Link>
              <Link
                href="/pannello/riepilogo"
                className={`${stili.sezione} ${percorso.startsWith("/pannello/riepilogo") ? stili.sezioneAttiva : ""}`}
                aria-current={percorso.startsWith("/pannello/riepilogo") ? "page" : undefined}
              >
                Riepilogo
              </Link>
              {mostraAttesa && (
                <Link
                  href="/pannello/attesa"
                  className={`${stili.sezione} ${percorso.startsWith("/pannello/attesa") ? stili.sezioneAttiva : ""}`}
                  aria-current={percorso.startsWith("/pannello/attesa") ? "page" : undefined}
                >
                  Lista d&apos;attesa
                  {attesa > 0 && <span className={stili.sezioneConto}>{attesa}</span>}
                </Link>
              )}
            </nav>
          )}
          {children}
        </main>
      </div>

      {/* ----- Barra in basso, solo sul telefono ----- */}
      <nav aria-label="Navigazione" className={stili.barra} style={{ "--n": VOCI.length } as CSSProperties}>
        <span
          className={stili.indicatoreBarra}
          style={{ transform: `translateX(calc(${Math.max(indice, 0) * 100}% + ${Math.max(indice, 0) * 4}px))`, opacity: indice < 0 ? 0 : 1 }}
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
                  <span className="lc-sr"> richieste da gestire</span>
                </span>
              )}
            </span>
            {testo}
          </Link>
        ))}
      </nav>

      <FoglioInferiore aperto={menu} chiudi={chiudiMenu} titolo="Menu">
        <button type="button" className={stili.rigaMenu} role="switch" aria-checked={notifiche.accese} onClick={() => void notifiche.alterna()}>
          <span className={stili.iconaMenu}><IconaCampanella misura={18} /></span>
          <span className={stili.duePiani}>
            <span className={stili.titoloMenu}>Notifiche</span>
            <span className={stili.sotto}>{testoNotifiche(notifiche.stato)}</span>
          </span>
          <Interruttore acceso={notifiche.accese} />
        </button>

        <button
          type="button"
          className={stili.rigaMenu}
          onClick={() => {
            setMenu(false);
            void notifiche.prova();
          }}
        >
          <span className={stili.iconaMenu}><IconaInvia misura={18} /></span>
          <span className={stili.duePiani}>
            <span className={stili.titoloMenu}>Manda una prova</span>
            <span className={stili.sotto}>Ti arriva una notifica di prova</span>
          </span>
        </button>

        <button type="button" className={stili.rigaMenu} onClick={() => void copiaLink()}>
          <span className={stili.iconaMenu}><IconaLink misura={18} /></span>
          <span className={stili.duePiani}>
            <span className={stili.titoloMenu}>Copia il tuo link</span>
            <span className={`${stili.sotto} ${stili.mono}`}>{linkLuca.replace(/^https?:\/\//, "")}</span>
          </span>
        </button>

        <span className={stili.divisore} aria-hidden />

        <button type="button" className={`${stili.rigaMenu} ${stili.pericolo}`} onClick={() => void esci()}>
          <span className={`${stili.iconaMenu} ${stili.iconaPericolo}`}><IconaEsci misura={18} /></span>
          <span className={stili.titoloMenu}>Esci</span>
        </button>
      </FoglioInferiore>
    </div>
  );
}

function testoNotifiche(stato: ReturnType<typeof useNotifiche>["stato"]): string {
  switch (stato) {
    case "accese":
      return "Attive su questo dispositivo";
    case "accendo":
      return "Accendo...";
    case "negate":
      return "Bloccate nelle impostazioni";
    case "non-supportato":
      return "Non disponibili qui";
    default:
      return "Spente";
  }
}

function Marchio() {
  return (
    <div className={stili.marchio}>
      <span className={stili.logo} aria-hidden>
        LC
      </span>
      <span className={stili.duePiani}>
        <span className={stili.nome}>Luca California</span>
        <span className={stili.live}>
          <span className={`lc-live ${stili.pallino}`} aria-hidden />
          Live · ROOM26
        </span>
      </span>
    </div>
  );
}

function Interruttore({ acceso, piccolo = false }: { readonly acceso: boolean; readonly piccolo?: boolean }) {
  return (
    <span
      className={`${stili.interruttore} ${piccolo ? stili.interruttorePiccolo : ""} ${acceso ? stili.acceso : ""}`}
      aria-hidden
    >
      <span className={stili.pomello} />
    </span>
  );
}
