import { RiepilogoPrenotazioni } from "@/componenti/pannello/RiepilogoPrenotazioni";
import { Numeri, Numero } from "@/componenti/pannello/Numero";
import { Testata } from "@/componenti/pannello/Testata";
import { richieste } from "@/lib/pannello/dati";

export const metadata = { title: "Riepilogo, pannello Luca California" };

/**
 * Tutte le prenotazioni confermate, divise per data.
 *
 * Prima c'era solo "Stasera", una serata sola. Con il modulo che fa
 * scegliere una data vera, le prenotazioni arrivano anche per fra sei mesi:
 * questa schermata le mostra tutte, raggruppate per notte, dalla più vicina.
 * Sono dati veri, dal database: non più un'anteprima.
 */
export default async function Riepilogo() {
  const confermate = await richieste("confermata");
  const nuove = (await richieste("nuova")).length;

  return (
    <main className="pagina">
      <Testata occhiello="ROOM26" titolo="Riepilogo" sottotitolo="Tutte le prenotazioni confermate, divise per data." />

      <Numeri>
        <Numero valore={confermate.length} etichetta="confermate" />
        <Numero valore={nuove} etichetta="nuove" dove="/pannello/richieste?stato=nuova" />
      </Numeri>

      <RiepilogoPrenotazioni prenotazioni={confermate} />
    </main>
  );
}
