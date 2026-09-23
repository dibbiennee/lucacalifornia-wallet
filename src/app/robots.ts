import type { MetadataRoute } from "next";

import { INDIRIZZO } from "@/lib/pubblico";

/**
 * ANCHE IN ANTEPRIMA SI LASCIA LEGGERE, e non è una svista.
 *
 * "Disallow: /" non tiene una pagina fuori dai risultati: impedisce di
 * leggerla, e quindi impedisce anche di vedere il noindex che sta dentro la
 * pagina. Il risultato è il contrario di quello che si vuole, perché un
 * indirizzo linkato da qualche parte può finire nei risultati lo stesso,
 * come indirizzo nudo senza contenuto.
 *
 * A tenere fuori il sito è il noindex nei metadati, che però va letto per
 * funzionare. Quindi: si lascia leggere e si dice di non indicizzare.
 *
 * In più, bloccare tutto impedisce anche ai lettori automatici di guardare
 * l'anteprima, e quell'anteprima serve proprio a farla guardare.
 *
 * Il pannello e gli strumenti restano fuori in ogni caso: non sono roba da
 * motori di ricerca.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/pannello", "/biglietto", "/staff", "/api"] },
    sitemap: `${INDIRIZZO}/sitemap.xml`,
  };
}
