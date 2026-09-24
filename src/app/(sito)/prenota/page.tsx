import { Modulo } from "@/componenti/sito/Modulo";
import { Indietro, TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Modulo.module.css";

export const metadata = {
  title: "Entra in lista o prenota - Luca California",
  description:
    "Lista o tavolo al Room 26 di Roma in mezzo minuto. Nessun pagamento: prezzo e disponibilità te li dice Luca su WhatsApp.",
};

/**
 * La pagina del modulo.
 *
 * Prima il modulo stava in fondo a mezza dozzina di pagine: un posto solo da
 * mantenere, e l'indirizzo che dice già cosa stai chiedendo.
 */
export default function PaginaPrenota() {
  return (
    <div className={stili.pagina}>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="In 30 secondi"
        colore="var(--magenta)"
        righe={["Entra in lista", "o prenota"]}
        introduzione="Nessun pagamento qui: prezzo e disponibilità te li dice Luca su WhatsApp. Quando conferma, ricevi il biglietto da aggiungere al Wallet."
      />
      <section className="wrap">
        <Modulo />
      </section>
    </div>
  );
}
