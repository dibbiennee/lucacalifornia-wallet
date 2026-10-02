import type { ReactNode } from "react";

import { AreaRichieste } from "@/componenti/lc/AreaRichieste";
import { richieste } from "@/lib/pannello/dati";
import { daRichiesta } from "@/lib/pannello/vista";

/**
 * L'elenco sta nel layout e non in ogni pagina: passando da una richiesta
 * all'altra l'elenco non si ricarica né perde il filtro, e sul computer resta
 * lì accanto al dettaglio. Si aggiorna da solo quando cambia qualcosa
 * (router.refresh), perché il layout è fresco a ogni richiesta della pagina.
 */
export default async function LayoutRichieste({ children }: { children: ReactNode }) {
  const adesso = new Date();
  const voci = (await richieste()).map((r) => daRichiesta(r, adesso));

  return <AreaRichieste voci={voci}>{children}</AreaRichieste>;
}
