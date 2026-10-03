import { FoglioAvvisami } from "@/componenti/sito/FoglioAvvisami";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { CAPODANNO } from "@/contenuti/sito";

import stiliPagina from "./page.module.css";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/capodanno",
  titolo: "Capodanno - Luca California",
  descrizione: "Il 31 dicembre lavoro con più strutture. Tre pacchetti, lista d'attesa aperta.",
});

export default function PaginaCapodanno() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Capodanno", percorso: "/capodanno" }]} />
      <Indietro testo="Home" dove="/" />
      <div className={stiliPagina.sfondo}>
        <TestaPagina
          occhiello="31 dicembre"
          colore="var(--acid)"
          righe={["Capodanno"]}
          introduzione="Solo a Capodanno lavoro con più strutture. Prezzi e strutture a breve: ti metto in lista d'attesa e te lo dico appena ci sono."
        />
      </div>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <ul className={stili.pacchetti}>
          {CAPODANNO.pacchetti.map((p, i) => (
            <li key={p.nome}>
              <div>
                <small>Pack {i + 1}</small>
                <strong>{p.righe.join(" ")}</strong>
                <em>Lista d&apos;attesa</em>
              </div>
            </li>
          ))}
        </ul>

        <FoglioAvvisami
          tipo="capodanno"
          etichetta="Mettimi in lista d'attesa"
          titolo="Ti avviso appena escono prezzi e strutture"
          spiegazione="Il Capodanno si riempie prima di tutto il resto: chi è in lista lo sa per primo."
        />
      </section>
    </>
  );
}
