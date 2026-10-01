import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import "@/stili/pannello.css";

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
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/** Il pannello non ha il guscio del sito: è uno strumento, non una pagina. */
export default function LayoutPannello({ children }: { children: ReactNode }) {
  return (
    <div className={`pannello ${carattere.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      {children}
    </div>
  );
}
