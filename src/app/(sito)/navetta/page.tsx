import { FoglioNavetta } from "@/componenti/sito/FoglioNavetta";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { Introduzione, Punti, TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { NAVETTA } from "@/contenuti/sito";

import stiliPagina from "./page.module.css";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/navetta",
  titolo: "Navetta per il ROOM26 da fuori Roma - Luca California",
  descrizione:
    "Navetta per le serate al ROOM26, su richiesta, per chi viene da fuori Roma: anche da Civitavecchia e dal litorale. Andata e ritorno a fine serata.",
});

const IN_MACCHINA = [
  "Uno di voi non beve per tutta la sera",
  "Mezz'ora a girare per il parcheggio",
  "Il palloncino all'uscita",
] as const;

const CON_LA_NAVETTA = [
  "Bevete tutti, nessuno escluso",
  "Ti lascia davanti all'ingresso",
  "Ti riporta nella tua zona",
] as const;

const COME_VA = [
  { titolo: "Dimmi da dove parti", testo: "Zona o quartiere, e la serata in cui vieni." },
  { titolo: "Ti ricontatto io", testo: "Su WhatsApp, con orario e punto di ritrovo." },
  { titolo: "A fine serata", testo: "Ti riporto nella stessa zona." },
] as const;

export default function PaginaNavetta() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Servizio navetta", percorso: "/navetta" }]} />
      <Indietro testo="Home" dove="/" />
      <div className={stiliPagina.sfondo}>
        <TestaPagina
          occhiello={NAVETTA.occhiello.charAt(0) + NAVETTA.occhiello.slice(1).toLowerCase()}
          colore="var(--cyan)"
          righe={["Servizio navetta"]}
          introduzione={`${NAVETTA.testo} Su richiesta, per chi viene da fuori Roma, anche da Civitavecchia e dal litorale.`}
        />
      </div>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className={stili.confronto}>
          <div className={stili.male}>
            <p>In macchina</p>
            <ul>
              {IN_MACCHINA.map((riga) => (
                <li key={riga}>
                  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                  {riga}
                </li>
              ))}
            </ul>
          </div>

          <div className={stili.bene}>
            <p>Con la navetta</p>
            <ul>
              {CON_LA_NAVETTA.map((riga) => (
                <li key={riga}>
                  <svg viewBox="0 0 24 24" aria-hidden focusable="false">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {riga}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h2 className="display" style={{ fontSize: "clamp(20px, 6.4vw, 44px)", marginBottom: 12 }}>
          <span className="cl">Meglio&nbsp;la&nbsp;navetta</span>{" "}
          <span className="cl">che&nbsp;perdere la&nbsp;patente</span>
        </h2>
        <div style={{ marginBottom: 28 }}>
          <Introduzione>
            Neopatentato o sotto i 21 anni? Per te il limite è zero: basta un drink per rischiare
            la sospensione. Per tutti gli altri, un posto in navetta costa meno di una multa.
          </Introduzione>
        </div>

        <Punti voci={COME_VA} />

        <FoglioNavetta />
      </section>
    </>
  );
}
