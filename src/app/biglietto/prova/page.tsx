import { PulsanteLink } from "@/componenti/pannello/Pulsante";
import { Testata } from "@/componenti/pannello/Testata";
import { legaParole } from "@/lib/tipografia";

import stili from "./biglietto.module.css";
import { TestoPiccolo } from "@/componenti/pannello/Messaggi";

/**
 * Pagina di prova del biglietto.
 *
 * Tutto il contenuto è già nell'HTML che esce dal server: nessun testo
 * viene disegnato dal browser dopo il caricamento.
 */

const VOCI = [
  ["Serata", "BÀILAME"],
  ["Quando", "Domenica 27 settembre 2026, ore 23:30"],
  ["Tipo", "TAVOLO, MISTO"],
  ["Nome", "Mario Rossi"],
  ["Dove", "ROOM26, Roma"],
] as const;

export default function PaginaProvaWallet() {
  return (
    <main className="pagina senza-barra">
      <Testata
        occhiello="Luca California"
        titolo="Il tuo biglietto, è pronto"
        sottotitolo="Aggiungilo ad Apple Wallet. All'ingresso ti basta mostrare il QR."
      />

      <dl className={stili.scheda}>
        {VOCI.map(([voce, valore]) => (
          <div key={voce}>
            <dt>{voce}</dt>
            <dd>{legaParole(valore, { vedova: true })}</dd>
          </div>
        ))}
      </dl>

      <PulsanteLink aspetto="wallet" href="/api/pass/demo" esterno>
        Aggiungi a Apple Wallet
      </PulsanteLink>

      <TestoPiccolo>Dall&apos;iPhone apri questa pagina con Safari. Su computer il file si scarica e basta, e
        negli altri browser dell&apos;iPhone non si apre.</TestoPiccolo>
    </main>
  );
}
