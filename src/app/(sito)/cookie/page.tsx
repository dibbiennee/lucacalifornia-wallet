import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";

export const metadata = { title: "COOKIE - Luca California" };

/**
 * Resta una pagina con un indirizzo suo.
 *
 * Nel sito di riferimento privacy e cookie sono un foglio che si apre col
 * codice: comodo, ma senza indirizzo non si può linkare da fuori, e
 * un'informativa deve essere raggiungibile anche da chi arriva da un altro
 * sito o da un messaggio.
 */
export default function PaginaCOOKIE() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        righe={["COOKIE"]}
        introduzione="Questa è un'anteprima del sito. L'informativa completa viene pubblicata insieme al sito vero, prima che il modulo di prenotazione raccolga dati di persone reali."
      />
    </>
  );
}
