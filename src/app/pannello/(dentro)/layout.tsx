import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Guscio } from "@/componenti/lc/Guscio";
import { richieste } from "@/lib/pannello/dati";
import { sessioneAperta } from "@/lib/pannello/sessione";

/*
 * Ogni schermata qui dentro legge la sessione di chi la guarda (e, per le
 * richieste, il database): non ha senso prepararne una copia in anticipo
 * quando il sito si costruisce. Vale per tutto il gruppo, non pagina per
 * pagina, perché "dimenticata su una schermata nuova" è un errore facile.
 */
export const dynamic = "force-dynamic";

/**
 * Tutto quello che sta dentro questo gruppo è protetto: se la sessione non
 * c'è si finisce sull'accesso, che sta fuori dal gruppo e quindi non si
 * protegge da solo in un giro infinito.
 *
 * Il conto delle richieste nuove si fa qui una volta sola, perché il numero
 * sulla scheda deve essere lo stesso da qualunque schermata lo si guardi.
 */
export default async function LayoutDentro({ children }: { children: ReactNode }) {
  if (!(await sessioneAperta())) {
    redirect("/pannello/accesso");
  }

  const nuove = await richieste("nuova");

  return <Guscio nuove={nuove.length}>{children}</Guscio>;
}
