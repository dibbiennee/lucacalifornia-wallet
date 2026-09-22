import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BarraPannello } from "@/componenti/pannello/BarraPannello";
import { sessioneAperta } from "@/lib/pannello/sessione";

/**
 * Tutto quello che sta dentro questo gruppo è protetto: se la sessione non
 * c'è si finisce sull'accesso, che sta fuori dal gruppo e quindi non si
 * protegge da solo in un giro infinito.
 */
export default async function LayoutDentro({ children }: { children: ReactNode }) {
  if (!(await sessioneAperta())) {
    redirect("/pannello/accesso");
  }

  return (
    <>
      {children}
      <BarraPannello />
    </>
  );
}
