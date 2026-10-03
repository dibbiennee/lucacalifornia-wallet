import type { Metadata } from "next";

import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import { TestoLegale } from "@/componenti/sito/TestoLegale";
import { SEZIONI_COOKIE } from "@/contenuti/legale";
import { metadatiPagina } from "@/lib/seo";

export const metadata: Metadata = metadatiPagina({
  percorso: "/cookie",
  titolo: "Cookie - Luca California",
  descrizione: "Cosa salva il sito nel tuo browser, a cosa serve e come toglierlo.",
});

/** Come la privacy: una pagina con un indirizzo suo. Il testo sta in src/contenuti/legale.ts. */
export default function PaginaCookie() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina righe={["Cookie"]} introduzione="Cosa salva il sito nel tuo browser, a cosa serve e come toglierlo." />
      <TestoLegale sezioni={SEZIONI_COOKIE} />
    </>
  );
}
