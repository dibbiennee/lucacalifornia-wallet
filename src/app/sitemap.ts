import type { MetadataRoute } from "next";

import { LOCALI_STAGIONE } from "@/contenuti/locali";
import { SERATE } from "@/contenuti/sito";
import { INDIRIZZO } from "@/lib/pubblico";

/** Solo le pagine pubbliche: il pannello e gli strumenti restano fuori. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = [
    "",
    "/serate",
    "/locali",
    "/navetta",
    "/capodanno",
    "/funzioni",
    "/diventa-pr",
    "/chi-sono",
    "/privacy",
    "/cookie",
    ...SERATE.map((s) => `/serate/${s.codice}`),
    ...LOCALI_STAGIONE.map((l) => `/locali/${l.codice}`),
  ];

  return pagine.map((p) => ({
    url: `${INDIRIZZO}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
