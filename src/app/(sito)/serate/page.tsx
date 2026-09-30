import { Bottone } from "@/componenti/sito/Bottone";
import { ElencoSerate } from "@/componenti/sito/CardSerata";
import { Indietro } from "@/componenti/sito/Indietro";
import { Galleria, TestaPagina } from "@/componenti/sito/Pagina";
import { INSTAGRAM, INSTAGRAM_URL, SERATE } from "@/contenuti/sito";

export const metadata = { title: "Le serate al Room 26 - Luca California" };

/*
 * Le quattro foto sono fotogrammi del video del locale: non sono inventate,
 * ma non sono nemmeno le storie dei clienti. Nel sito vero le carica Luca.
 * Ognuna ha la sua descrizione: raccontano com'è la serata, quindi chi non
 * le vede deve poter sapere cosa c'è dentro.
 */
const STORIE = [
  { src: "/foto/night12.webp", alt: "Il dj alla consolle, con la sala illuminata di blu alle spalle" },
  { src: "/foto/night4.webp", alt: "Una ragazza saluta in mezzo alla folla, sotto le luci" },
  { src: "/foto/night3.webp", alt: "Una ragazza sorride vicino al bancone" },
  { src: "/foto/night1.webp", alt: "Una ragazza al bancone con il drink in mano" },
] as const;

export default function PaginaSerate() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="D'inverno, Room 26, Roma"
        righe={["Le serate"]}
        introduzione="Quattro sere a settimana, da giovedì a domenica. Ogni serata ha la sua musica e il suo pubblico: scegli la tua e ti sistemo io, in lista o al tavolo."
      />

      <section className="wrap">
        <ElencoSerate serate={SERATE} />
      </section>

      <section className="blocco" aria-labelledby="voi-al-room26">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Dalle vostre storie
            </p>
            <h2 className="display" id="voi-al-room26">
              <span className="ph">Voi</span> <span className="ph">al Room 26</span>
            </h2>
          </div>

          <Galleria foto={STORIE} />

          <div style={{ marginTop: 18 }}>
            <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno>
              Segui @{INSTAGRAM}
            </Bottone>
          </div>
        </div>
      </section>
    </>
  );
}
