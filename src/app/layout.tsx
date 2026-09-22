import type { Metadata, Viewport } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

/** Anton per i titoli: è il carattere delle scritte nei reel di Luca. */
const titoli = Anton({ subsets: ["latin"], weight: "400", variable: "--carattere-titoli" });
const testo = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--carattere-testo",
});

export const metadata: Metadata = {
  title: "Luca California, liste e tavoli al Room 26 di Roma",
  description:
    "Liste e tavoli al Room 26 di Roma, da giovedì a domenica, con la navetta per arrivarci. Prenoti in mezzo minuto e il biglietto ti arriva nel telefono.",
  // Anteprima: non deve finire nelle ricerche finché non è il sito vero.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#2B1BB0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={`${titoli.variable} ${testo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
