import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import "@/stili/pannello.css";

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
  return <div className={`pannello ${carattere.variable}`}>{children}</div>;
}
