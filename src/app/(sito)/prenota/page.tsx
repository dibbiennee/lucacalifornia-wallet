import { Modulo } from "@/componenti/sito/Modulo";
import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Modulo.module.css";
import { metadatiPagina } from "@/lib/seo";

/*
 * Pagina di sola conversione: non ha un contenuto suo da posizionare e
 * competerebbe con /tavoli. Non si indicizza, ma i link che contiene si seguono.
 */
export const metadata = {
  ...metadatiPagina({
    percorso: "/prenota",
    titolo: "Prenota il tuo ingresso - Luca California",
    descrizione:
      "Tavolo, braccialetto o lista al ROOM26 di Roma in mezzo minuto. Nessun pagamento sul sito: ti rispondo io su WhatsApp con disponibilità e prezzo.",
  }),
  robots: { index: false, follow: true },
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

      <div className={`wrap ${stili.colonne}`}>
        <TestaPagina
          occhiello="In 30 secondi"
          colore="var(--ink-2)"
          righe={["Prenota il tuo", "ingresso"]}
          introduzione="Nessun pagamento qui: ti rispondo io su WhatsApp con disponibilità e prezzo. Quando confermo, ricevi il biglietto da aggiungere al Wallet."
          senzaColonna
        />
        <Modulo />
      </div>
    </div>
  );
}
