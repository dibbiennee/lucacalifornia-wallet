import type { Metadata } from "next";

import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import { TestoLegale } from "@/componenti/sito/TestoLegale";
import { SEZIONI_COOKIE } from "@/contenuti/legale";

export const metadata: Metadata = {
  title: "Cookie - Luca California",
  description: "Cosa salva il sito nel tuo browser, a cosa serve e come toglierlo.",
  alternates: { canonical: "/cookie" },
};

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
