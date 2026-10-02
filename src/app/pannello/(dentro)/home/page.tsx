import { redirect } from "next/navigation";

import { HomePr } from "@/componenti/lc/HomePr";
import { VistaTraffico } from "@/componenti/lc/VistaTraffico";
import { richieste } from "@/lib/pannello/dati";
import { sessioneOAccesso } from "@/lib/pannello/sessione";
import { daRichiesta, numeriPr } from "@/lib/pannello/vista";
import { linkPr } from "@/lib/pubblico";
import { statisticheTraffico } from "@/lib/traffico";

export const metadata = { title: "Home, area PR Luca California" };

const GIORNO_ROMA = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });

/**
 * La home di un PR: a che punto è, il suo link, i numeri del suo link.
 *
 * Tutti i numeri vengono dal suo id, preso dalla sessione e non da un parametro:
 * le richieste (richieste(sessione), solo quelle col suo pr_id e senza dati
 * personali) e le visite del suo link (statisticheTraffico con il suo prId). Non
 * c'è nessuna strada, da qui, per chiedere i numeri di un altro. Niente è
 * inventato: dove non c'è ancora niente, la schermata lo dice.
 *
 * "Oggi" si decide qui, sul server, e si passa già pronto.
 */
export default async function Home() {
  const sessione = await sessioneOAccesso();

  // Non è una schermata di Luca: lui ha le sue richieste e le sue analisi.
  if (sessione.ruolo !== "pr") {
    redirect("/pannello/richieste");
  }

  const adesso = new Date();
  const oggi = GIORNO_ROMA.format(adesso);
  const [elenco, statistiche] = await Promise.all([
    richieste(sessione),
    statisticheTraffico({ prId: sessione.prId }, oggi),
  ]);
  const numeri = numeriPr(
    elenco.map((r) => daRichiesta(r, adesso)),
    oggi,
  );

  return (
    <HomePr
      nome={sessione.nome}
      codice={sessione.codice}
      link={linkPr(sessione.codice)}
      numeri={numeri}
      traffico={<VistaTraffico statistiche={statistiche} titolo="Visite e moduli del tuo link" />}
    />
  );
}
