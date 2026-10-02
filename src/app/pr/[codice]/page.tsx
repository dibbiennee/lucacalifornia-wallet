import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Modulo } from "@/componenti/sito/Modulo";
import stiliModulo from "@/componenti/sito/Modulo.module.css";
import { Tracciamento } from "@/componenti/sito/Tracciamento";
import { prAttivoPerCodice } from "@/contenuti/canali";

import stili from "./page.module.css";

export const dynamic = "force-dynamic";

const TITOLO = "Prenota - Luca California";
const DESCRIZIONE = "Tavolo, braccialetto o lista al ROOM26 di Roma in mezzo minuto.";

type Parametri = { params: Promise<{ codice: string }> };

export async function generateMetadata({ params }: Parametri): Promise<Metadata> {
  const { codice } = await params;
  const url = `/pr/${codice.toLowerCase()}`;

  return {
    title: TITOLO,
    description: DESCRIZIONE,
    alternates: { canonical: url },
    /* Pagina fatta solo per i link dei PR: non deve comparire nelle ricerche. */
    robots: { index: false, follow: false },
    /*
     * L'anteprima che esce su WhatsApp quando un PR gira il suo link: il
     * marchio in negativo, quadrato (scripts/genera-anteprima-pr.py). Quadrato
     * e non 1200x630: WhatsApp lo mostra com'è, senza ritagliarlo.
     */
    openGraph: {
      type: "website",
      siteName: "Luca California",
      locale: "it_IT",
      url,
      title: TITOLO,
      description: DESCRIZIONE,
      images: [{ url: "/anteprima-pr.png", width: 1200, height: 1200, alt: "Luca California" }],
    },
    twitter: { card: "summary", title: TITOLO, description: DESCRIZIONE, images: ["/anteprima-pr.png"] },
  };
}

/**
 * Il link permanente di un PR: /pr/<codice>. Mostra SOLO il modulo.
 *
 * Nessuna testata, nessun menu, nessun piè di pagina: un PR manda il link e
 * basta, e chi lo apre deve vedere solo il modulo, non il resto del sito. Non sta
 * dentro (sito): quel layout aggiunge la testata e tutto il resto che qui non
 * deve esserci.
 *
 * La pagina esiste solo per un PR attivo: un PR spento, o un codice che non c'è,
 * è pagina non trovata. L'attribuzione della richiesta la decide il server dal
 * codice di questa pagina, mai da un id che manda il browser.
 */
export default async function PaginaPr({ params }: Parametri) {
  const { codice } = await params;
  const pr = await prAttivoPerCodice(codice);

  if (pr === null) {
    notFound();
  }

  return (
    <div className={stiliModulo.pagina}>
      <Tracciamento pr={pr.codice} />
      {/* Il titolo della pagina per chi legge con la voce: il modulo non ne ha uno visibile. */}
      <h1 style={{ position: "absolute", width: 1, height: 1, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
        Prenota il tuo ingresso
      </h1>
      <div className={stili.contenitore}>
        <Modulo codicePr={pr.codice} />
      </div>
    </div>
  );
}
