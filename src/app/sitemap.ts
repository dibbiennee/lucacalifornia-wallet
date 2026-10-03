import type { MetadataRoute } from "next";

import { percorsoSerata, SERATE } from "@/contenuti/sito";
import { INDIRIZZO } from "@/lib/pubblico";

/**
 * Solo le pagine pubbliche (/prenota è noindex, quindi fuori): il pannello, i link dei PR e gli strumenti restano fuori.
 *
 * Niente "lastModified": una data che cambia a ogni pubblicazione, uguale per
 * tutte le pagine, non dice a Google cosa è cambiato davvero, e Google la
 * ignora quando non è affidabile. Meglio nessuna data che una falsa. Anche
 * "changeFrequency" e "priority" non vengono usati da Google: non si scrivono.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = [
    "",
    "/serate",
    ...SERATE.map((s) => percorsoSerata(s)),
    "/tavoli",
    "/navetta",
    "/capodanno",
    "/diventa-pr",
    "/chi-sono",
    "/privacy",
    "/cookie",
  ];

  return pagine.map((p) => ({ url: `${INDIRIZZO}${p}` }));
}
