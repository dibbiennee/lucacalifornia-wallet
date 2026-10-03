import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import { INDIRIZZO, SITO_PUBBLICO } from "@/lib/pubblico";
import { DESCRIZIONE_HOME, TITOLO_HOME } from "@/lib/seo";

import "./globals.css";

const TITOLO = TITOLO_HOME;
const DESCRIZIONE = DESCRIZIONE_HOME;

export const metadata: Metadata = {
  metadataBase: new URL(INDIRIZZO),
  title: TITOLO,
  description: DESCRIZIONE,
  /*
   * Niente "alternates.canonical" qui: nel layout varrebbe per TUTTE le pagine
   * che non lo ridefiniscono, e le dichiarerebbe copie della home (era il
   * difetto di prima). Il canonical lo dice ogni pagina, vedi src/lib/seo.ts.
   */
  openGraph: {
    type: "website",
    siteName: "Luca California",
    title: TITOLO,
    description: DESCRIZIONE,
    locale: "it_IT",
    /*
     * Senza questa immagine il link condiviso su WhatsApp arriva nudo, e un
     * link nudo sembra sospetto. Luca lo manderà centinaia di volte: è la
     * prima cosa che vede la gente, prima ancora del sito.
     */
    images: [{ url: "/anteprima-sito-2.jpg", width: 1200, height: 630, alt: TITOLO }],
  },
  twitter: { card: "summary_large_image", title: TITOLO, description: DESCRIZIONE, images: ["/anteprima-sito-2.jpg"] },
  robots: SITO_PUBBLICO ? { index: true, follow: true } : { index: false, follow: false },
  /* Senza, la scheda del browser resta col foglio bianco e iOS mette uno
     scatto sbiadito della pagina quando la aggiungi alla schermata home. */
  icons: { icon: "/loghi/icona-192.png", apple: "/loghi/icona-192.png" },
};

export const viewport: Viewport = {
  /* La barra del browser si intona al sito: era rimasta col blu di prima. */
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={carattere.variable}>
      <body>
        {/*
          Senza, ".rivela" (l'animazione di ingresso, vedi sito.css) nascondeva
          una sezione per sempre a chi naviga senza javascript: qui sotto la
          regola scatta solo con questa classe, aggiunta subito, prima che il
          resto della pagina si disegni.
        */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
