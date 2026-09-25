import { ElencoStasera } from "@/componenti/pannello/ElencoStasera";
import { NotaEsempio } from "@/componenti/pannello/Messaggi";
import { Numeri, Numero } from "@/componenti/pannello/Numero";
import { Testata } from "@/componenti/pannello/Testata";
import { confermatiPerSerata, richieste, stasera } from "@/lib/pannello/dati";
import { giornoDellaSerata, prossimaSerata } from "@/lib/serate";

export const metadata = { title: "Stasera, pannello Luca California" };

/** "sabato 26 set", con le maiuscole che mette poi l'occhiello. */
const GIORNO_E_DATA = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  weekday: "long",
  day: "numeric",
  month: "short",
});

/** Serve solo a capire se due istanti cadono nello stesso giorno, a Roma. */
const SOLO_IL_GIORNO = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Chi entra stasera.
 *
 * È la schermata che prima non c'era: "Oggi" raccontava la serata con tre
 * numeri, ma non diceva chi sarebbe venuto. Alla porta serve l'elenco, con
 * la ricerca per nome.
 */
export default async function Stasera() {
  const sera = await stasera();
  const confermati = await confermatiPerSerata(sera.codice);
  const nuove = (await richieste("nuova")).length;

  const quando = prossimaSerata(giornoDellaSerata(sera.codice));
  const oggi = SOLO_IL_GIORNO.format(quando) === SOLO_IL_GIORNO.format(new Date());

  // "sab 26 set" senza il punto che l'italiano mette dopo il mese abbreviato.
  const data = GIORNO_E_DATA.format(quando).replace(".", "");

  return (
    <main className="pagina">
      <Testata
        occhiello={`${oggi ? "Stasera" : "Prossima serata"}, ${data}`}
        titolo={sera.serata}
      />

      <Numeri>
        <Numero valore={confermati.filter((r) => r.tipo === "tavolo").length} etichetta="tavoli" />
        <Numero valore={confermati.filter((r) => r.tipo === "lista").length} etichetta="in lista" />
        <Numero valore={nuove} etichetta="nuove" dove="/pannello/richieste?stato=nuova" />
      </Numeri>

      <ElencoStasera confermati={confermati} />

      <NotaEsempio />
    </main>
  );
}
