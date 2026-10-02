import type { ReactNode } from "react";

import { AreaRichieste } from "@/componenti/lc/AreaRichieste";
import { caricaElenco } from "@/lib/pannello/elenco";
import { FILTRI_PREDEFINITI } from "@/lib/pannello/filtri-richieste";
import { sessioneOAccesso } from "@/lib/pannello/sessione";

/**
 * L'elenco sta nel layout e non in ogni pagina: passando da una richiesta
 * all'altra l'elenco non si ricarica né perde il filtro, e sul computer resta
 * lì accanto al dettaglio. Si aggiorna da solo quando cambia qualcosa
 * (router.refresh), perché il layout è fresco a ogni richiesta della pagina.
 *
 * Qui si carica soltanto la PRIMA pagina, coi filtri di partenza (da oggi in
 * poi): non più tutte le richieste di sempre. Quando chi guarda cambia un
 * filtro, l'elenco chiede al server (cercaRichieste) la pagina giusta: i filtri
 * si applicano nella query, non nel browser.
 */
export default async function LayoutRichieste({ children }: { children: ReactNode }) {
  const sessione = await sessioneOAccesso();
  const iniziali = await caricaElenco(sessione, FILTRI_PREDEFINITI);

  return (
    <AreaRichieste iniziali={iniziali} comeLuca={sessione.ruolo === "owner"}>
      {children}
    </AreaRichieste>
  );
}
