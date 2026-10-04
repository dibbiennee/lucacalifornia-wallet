import { Bottone } from "@/componenti/sito/Bottone";
import { ElencoSerate } from "@/componenti/sito/CardSerata";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { MosaicoFoto } from "@/componenti/sito/MosaicoFoto";
import { TestaPagina } from "@/componenti/sito/Pagina";
import { INSTAGRAM, INSTAGRAM_URL, SERATE } from "@/contenuti/sito";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/serate",
  titolo: "Le serate al ROOM26 - Luca California",
  descrizione:
    "Le quattro serate del ROOM26 a Roma: giovedì Milkshake, venerdì Drip, sabato International, domenica Bàilame. Scegli la tua e prenota lista o tavolo.",
});

/*
 * Le foto vere delle serate, alternate fra Bàilame e ROOM26, scelte fra le più nitide
 * (le Bàilame sono 1333 x 2000, le ROOM26 786 x 1400). Prima c'erano quattro fotogrammi
 * presi da un video, sgranati: stavano male accanto a foto così.
 */
const FOTO = [
  { src: "/foto/bailame/bailame5.jpg", alt: "Due amiche fanno le boccucce in posa per la foto" },
  { src: "/foto/room26/room26-1.jpg", alt: "Tre amiche abbracciate in posa per la foto" },
  { src: "/foto/bailame/bailame8.jpg", alt: "Tre amici abbracciati sorridono alla foto" },
  { src: "/foto/room26/room26-7.jpg", alt: "Tre amiche con i drink in mano fanno le linguacce" },
  { src: "/foto/bailame/bailame7.jpg", alt: "Un gruppo di amici in posa sotto le luci colorate" },
  { src: "/foto/room26/room26-5.jpg", alt: "Due amiche vicine, una beve con la cannuccia" },
  { src: "/foto/bailame/bailame10.jpg", alt: "Una ragazza in posa con la maglia del Brasile" },
  { src: "/foto/room26/room26-11.jpg", alt: "Un gruppo di amici abbracciati sorride alla foto" },
] as const;

export default function PaginaSerate() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Le serate", percorso: "/serate" }]} />
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="D'inverno, ROOM26, Roma"
        righe={["Le serate"]}
        introduzione="Quattro sere a settimana, da giovedì a domenica, al ROOM26 dell'EUR, a Roma. Ogni giorno una musica diversa: giovedì afro e reggaeton, venerdì commerciale e reggaeton, sabato reggaeton, commerciale e house, domenica reggaeton. Scegli la tua e ti sistemo io, al tavolo o in lista."
      />

      <section className="wrap">
        <ElencoSerate serate={SERATE} />
      </section>

      <section className="blocco" aria-labelledby="voi-al-room26">
        <div className="wrap">
          <div className="blocco-testa">
            <p className="occhiello" style={{ margin: 0 }}>
              Dalle vostre serate
            </p>
            <h2 className="display" id="voi-al-room26">
              <span className="ph">Le foto</span>
            </h2>
          </div>

          <MosaicoFoto foto={FOTO} etichetta="Foto delle serate Bàilame e ROOM26" />

          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Bottone href="https://t.me/BAILAMEOFFICIAL" aspetto="contorno" esterno>
              Tutte le foto Bàilame
            </Bottone>
            <Bottone href="https://t.me/room26official" aspetto="contorno" esterno>
              Tutte le foto ROOM26
            </Bottone>
            <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno>
              Segui @{INSTAGRAM}
            </Bottone>
          </div>
        </div>
      </section>
    </>
  );
}
