import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pannello, Luca California",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0E0845",
};

/** Il pannello non ha il guscio del sito: è uno strumento, non una pagina. */
export default function LayoutPannello({ children }: { children: ReactNode }) {
  return <div className="pannello">{children}</div>;
}
