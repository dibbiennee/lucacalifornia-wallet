import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import "@/stili/pannello.css";

export const metadata: Metadata = {
  title: "Il tuo biglietto, Luca California",
  robots: { index: false, follow: false },
  icons: { icon: "/loghi/icona-192.png", apple: "/loghi/icona-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/**
 * Il biglietto lo apre il cliente, non Luca, ma la grafica è quella dello
 * strumento: arriva da un link di WhatsApp e non deve sembrare una pagina
 * del sito in cui navigare.
 */
export default function LayoutBiglietto({ children }: { children: ReactNode }) {
  return <div className={`pannello ${carattere.variable}`}>{children}</div>;
}
