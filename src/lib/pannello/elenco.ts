import { oggiARoma } from "@/lib/lista-attesa";

import { elencoPrPerFiltro, elencoRichieste, serateConRichieste, type PrPerFiltro } from "./dati";
import type { ContiPerStato, DataConRichieste, FiltriRichieste } from "./filtri-richieste";
import { chiaveFiltri } from "./filtri-richieste";
import type { Ambito } from "./sessione";
import { GRUPPI, daRichiesta, giornoBreve, type VoceRichiesta } from "./vista";

/**
 * Quello che l'elenco richieste mostra, preparato sul server.
 *
 * Lo chiamano due strade, e questa è l'unica funzione che le fa uguali: il
 * layout (la prima schermata, coi filtri di partenza) e l'azione cercaRichieste
 * (ogni cambio di filtro, dal browser). Entrambe passano da elencoRichieste, che
 * applica i filtri nella query e l'ambito di chi guarda.
 */
export interface DatasetElenco {
  readonly voci: readonly VoceRichiesta[];
  readonly totale: number;
  readonly perStato: ContiPerStato;
  /** Le prossime serate con richieste: solo nella prima pagina, vuote nelle pagine dopo. */
  readonly date: readonly DataConRichieste[];
  /** I filtri con cui è stato prodotto, per accorgersi di una risposta arrivata in ritardo. */
  readonly chiave: string;
  /** Da dove cominciava questa pagina. */
  readonly offset: number;
  /** I PR fra cui Luca può filtrare. Vuoto per un PR e nelle pagine dopo la prima. */
  readonly elencoPr: readonly PrPerFiltro[];
}

function nomeNotte(codice: string): string {
  return GRUPPI.find((g) => g.codice === codice)?.nome ?? "Altre";
}

export async function caricaElenco(
  ambito: Ambito,
  filtri: FiltriRichieste,
  offset = 0,
): Promise<DatasetElenco> {
  const oggi = oggiARoma();
  const adesso = new Date();

  const [elenco, serate, elencoPr] = await Promise.all([
    elencoRichieste(ambito, filtri, oggi, { offset }),
    offset === 0 ? serateConRichieste(ambito, oggi) : Promise.resolve([]),
    offset === 0 ? elencoPrPerFiltro(ambito) : Promise.resolve([]),
  ]);

  return {
    voci: elenco.righe.map((r) => daRichiesta(r, adesso)),
    totale: elenco.totale,
    perStato: elenco.perStato,
    date: serate.map((s) => ({
      dataIso: s.dataIso,
      breve: giornoBreve(s.dataIso),
      notte: nomeNotte(s.codiceSerata),
      daGestire: s.daGestire,
      totale: s.totale,
    })),
    chiave: chiaveFiltri(filtri),
    offset,
    elencoPr,
  };
}
