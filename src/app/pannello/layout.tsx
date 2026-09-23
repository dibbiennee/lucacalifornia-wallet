import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import type { ReactNode } from "react";

import "@/stili/pannello.css";

/**
 * Archivo variabile, con l'asse della larghezza.
 *
 * Un carattere solo per tutto il pannello: i titoli usano lo stesso file dei
 * paragrafi, allargato con font-stretch. Prima erano due (Anton e Hanken), e
 * Anton non ha nemmeno il grassetto.
 */
const carattere = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--carattere-pannello",
});

export const metadata: Metadata = {
  title: "Pannello, Luca California",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/** Il pannello non ha il guscio del sito: è uno strumento, non una pagina. */
export default function LayoutPannello({ children }: { children: ReactNode }) {
  return <div className={`pannello ${carattere.variable}`}>{children}</div>;
}
