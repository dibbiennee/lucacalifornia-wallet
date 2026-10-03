import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { CONTATTI } from "@/contenuti/sito";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/contatti",
  titolo: "Contatti - Luca California",
  descrizione: "Come scrivere o chiamare Luca California: la mail e il numero di telefono.",
});

/**
 * Due contatti e basta: la mail e il telefono. Niente moduli, niente social:
 * a chi vuole prenotare c'è già /prenota.
 */
export default function PaginaContatti() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Contatti", percorso: "/contatti" }]} />
      <Indietro testo="Home" dove="/" />
      <TestaPagina occhiello="Contatti" righe={["Scrivimi", "o chiamami"]} />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <ul className={stili.contatti}>
          <li>
            <a href={`mailto:${CONTATTI.email}`}>
              <span className={stili.contattoEtichetta}>Email</span>
              <span className={stili.contattoValore}>{CONTATTI.email}</span>
            </a>
          </li>
          <li>
            <a href={`tel:${CONTATTI.telefonoLink}`}>
              <span className={stili.contattoEtichetta}>Telefono</span>
              <span className={stili.contattoValore}>{CONTATTI.telefono}</span>
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
