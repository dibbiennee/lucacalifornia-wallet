import type { Metadata } from "next";

import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import { TestoLegale } from "@/componenti/sito/TestoLegale";
import { SEZIONI_PRIVACY } from "@/contenuti/legale";
import { metadatiPagina } from "@/lib/seo";

export const metadata: Metadata = metadatiPagina({
  percorso: "/privacy",
  titolo: "Privacy - Luca California",
  descrizione: "Quali dati raccoglie il modulo, a cosa servono, chi li vede e come chiederne la cancellazione.",
});

/**
 * Resta una pagina con un indirizzo suo: un'informativa deve essere
 * raggiungibile anche da chi arriva da un altro sito o da un messaggio.
 * Il testo sta in src/contenuti/legale.ts.
 */
export default function PaginaPrivacy() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        righe={["Privacy"]}
        introduzione="Quello che raccogliamo quando mandi una richiesta, a cosa serve, e come puoi chiederne la cancellazione."
      />
      <TestoLegale sezioni={SEZIONI_PRIVACY} />
    </>
  );
}
