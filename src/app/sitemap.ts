import type { MetadataRoute } from "next";

import { SERATE } from "@/contenuti/sito";
import { INDIRIZZO } from "@/lib/pubblico";

/** Solo le pagine pubbliche: il pannello e gli strumenti restano fuori. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pagine = [
    "",
    "/serate",
    "/navetta",
    "/capodanno",
    "/diventa-pr",
    "/chi-sono",
    "/privacy",
    "/cookie",
    ...SERATE.map((s) => `/serate/${s.codice}`),
  ];

  return pagine.map((p) => ({
    url: `${INDIRIZZO}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
