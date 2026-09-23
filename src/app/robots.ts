import type { MetadataRoute } from "next";

import { INDIRIZZO, SITO_PUBBLICO } from "@/lib/pubblico";

/**
 * Finché è un'anteprima, dice a tutti di stare fuori. Il pannello resta
 * escluso anche dopo: non è roba da motori di ricerca.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: SITO_PUBBLICO
      ? { userAgent: "*", allow: "/", disallow: ["/pannello", "/biglietto", "/staff", "/api"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${INDIRIZZO}/sitemap.xml`,
  };
}
