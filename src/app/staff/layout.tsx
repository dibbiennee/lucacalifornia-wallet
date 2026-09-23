import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { carattere } from "@/lib/carattere";
import "@/stili/pannello.css";

export const metadata: Metadata = {
  title: "Ingresso, Luca California",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

/** La porta senza password: stesso guscio del pannello, niente barra. */
export default function LayoutStaff({ children }: { children: ReactNode }) {
  return <div className={`pannello ${carattere.variable}`}>{children}</div>;
}
