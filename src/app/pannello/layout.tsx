import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import "@/stili/pannello.css";
import "@/stili/lc.css";

/*
 * Geist (testo) e Geist Mono (numeri, orari, etichette) per il nuovo
 * disegno del pannello: ospitati dal pacchetto ufficiale "geist" di Vercel,
 * già pronti per next/font, non da Google Fonts. Nessuna chiamata esterna a
 * runtime, stessa logica per cui Archivo è ospitato qui e non da Google.
 */

export const metadata: Metadata = {
  title: "Pannello, Luca California",
  robots: { index: false, follow: false },
  /*
   * L'icona per la schermata home dell'iPhone: il pannello si installa, e
   * senza questa iOS ci mette uno scatto sbiadito della pagina.
   */
  icons: { icon: "/loghi/icona-192.png", apple: "/loghi/icona-192.png" },
  /*
   * Aggiunto alla Home il pannello si apre a tutto schermo, come un'app, e ha il suo nome e la sua icona.
   * Su iPhone lo dice appleWebApp; su Android il file manifest (api/pannello/manifest).
   */
  manifest: "/pannello/manifest.webmanifest",
  /*
   * L'anteprima del link /pannello (quella che esce su WhatsApp quando Luca lo manda a un PR): solo qui,
   * il resto del sito ha la sua. 1200 x 675, la grafica intera.
   */
  openGraph: {
    type: "website",
    siteName: "Luca California",
    title: "Pannello PR, Luca California",
    description: "Gestisci le tue prenotazioni: tavoli, liste, bracciali e navetta.",
    images: [{ url: "/anteprima-pannello.jpg", width: 1200, height: 675, alt: "Pannello dashboard: gestisci le tue prenotazioni" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pannello PR, Luca California",
    description: "Gestisci le tue prenotazioni: tavoli, liste, bracciali e navetta.",
    images: ["/anteprima-pannello.jpg"],
  },
  appleWebApp: { capable: true, title: "Luca California", statusBarStyle: "black-translucent" },
  // Next scrive la versione moderna (mobile-web-app-capable); l'iPhone legge ancora quella con apple- davanti.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  /* Senza, env(safe-area-inset-*) vale zero: la testata finirebbe sotto la barra di stato e le azioni sotto l'indicatore home. */
  viewportFit: "cover",
};

/** Il pannello non ha il guscio del sito: è uno strumento, non una pagina. */
export default function LayoutPannello({ children }: { children: ReactNode }) {
  return (
    <div className={`pannello lc ${carattere.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      {children}
    </div>
  );
}
