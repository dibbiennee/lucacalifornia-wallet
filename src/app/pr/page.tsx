import type { Metadata } from "next";

import { Modulo } from "@/componenti/sito/Modulo";
import stiliModulo from "@/componenti/sito/Modulo.module.css";

import stili from "./page.module.css";

const TITOLO = "Prenota - Luca California";
const DESCRIZIONE = "Tavolo, braccialetto o lista al ROOM26 di Roma in mezzo minuto.";

export const metadata: Metadata = {
  title: TITOLO,
  description: DESCRIZIONE,
  alternates: { canonical: "/pr" },
  /* Pagina fatta solo per i link dei PR: non deve comparire nelle ricerche. */
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    title: TITOLO,
    description: DESCRIZIONE,
    images: [{ url: "/anteprima.jpg", width: 1200, height: 630, alt: TITOLO }],
  },
  twitter: { card: "summary_large_image", title: TITOLO, description: DESCRIZIONE, images: ["/anteprima.jpg"] },
};

/**
 * Il modulo isolato per i link dei PR.
 *
 * Nessuna testata, nessun menu, nessun piè di pagina: un PR manda il link e
 * basta, e chi lo apre deve vedere solo il modulo, non il resto del sito.
 * Non sta dentro (sito): quel layout aggiunge la testata e tutto il resto
 * che qui non deve esserci.
 */
export default function PaginaPr() {
  return (
    <div className={stiliModulo.pagina}>
      <div className={stili.contenitore}>
        <Modulo />
      </div>
    </div>
  );
}
