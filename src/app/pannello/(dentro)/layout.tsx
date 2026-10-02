import type { ReactNode } from "react";

import { Guscio } from "@/componenti/lc/Guscio";
import { GuscioPr } from "@/componenti/lc/GuscioPr";
import { contaInAttesa } from "@/lib/pannello/attesa";
import { contaRichieste } from "@/lib/pannello/dati";
import { sessioneOAccesso } from "@/lib/pannello/sessione";
import { INDIRIZZO } from "@/lib/pubblico";

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
 * Questo controllo non basta da solo: i layout e le pagine più in basso si
 * preparano in parallelo a questo, quindi ognuno che legge dati controlla da
 * sé (sessioneOAccesso) e chiede i dati con l'ambito di chi guarda.
 *
 * Il conto delle richieste nuove si fa qui una volta sola, perché il numero
 * sulla scheda deve essere lo stesso da qualunque schermata lo si guardi.
 */
export default async function LayoutDentro({ children }: { children: ReactNode }) {
  const sessione = await sessioneOAccesso();

  const [nuove, inAttesa] = await Promise.all([contaRichieste(sessione, "in attesa"), contaInAttesa(sessione)]);

  // Un PR ha il suo guscio, con la sua home: niente squadra, niente funzioni del proprietario.
  // I dati che gli arrivano sono già i suoi (richieste() filtra per pr_id), anche il conto sulla barra.
  if (sessione.ruolo === "pr") {
    return (
      <GuscioPr nome={sessione.nome} inAttesa={nuove}>
        {children}
      </GuscioPr>
    );
  }

  return (
    <Guscio nuove={nuove} attesa={inAttesa} indirizzo={INDIRIZZO}>
      {children}
    </Guscio>
  );
}
