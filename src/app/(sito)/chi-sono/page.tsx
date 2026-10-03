import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { DatiBriciole } from "@/componenti/DatiBriciole";
import { Indietro } from "@/componenti/sito/Indietro";
import { Introduzione, TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { INSTAGRAM, INSTAGRAM_URL } from "@/contenuti/sito";
import { metadatiPagina } from "@/lib/seo";

export const metadata = metadatiPagina({
  percorso: "/chi-sono",
  titolo: "Chi è Luca California, PR a Roma",
  descrizione:
    "Sono Luca California, PR a Roma: ti metto in lista e ti prenoto il tavolo al ROOM26. Ogni stagione un locale solo, e tutta la lista dentro.",
});

export default function PaginaChiSono() {
  return (
    <>
      <DatiBriciole voci={[{ nome: "Home", percorso: "/" }, { nome: "Chi è Luca California", percorso: "/chi-sono" }]} />
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="Chi sono"
        titoloLungo
        righe={["Non importa", "chi tu sia,", "importa", "che ti sappia", "divertire"]}
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className={`${stili.corpo} ${stili.corpoCentro}`}>
          <Image
            src="/foto/luca-ritratto.webp"
            alt="Luca California"
            width={1066}
            height={1600}
            sizes="(min-width: 900px) 520px, 100vw"
            className={`${stili.foto} ${stili.fotoLuca}`}
            priority
          />

          <div className={stili.corpoTesto}>
            <Introduzione>Sono Luca California, PR e organizzatore di eventi a Roma. Ogni stagione scelgo un locale
              solo e ci porto tutta la mia passione: d&apos;inverno il ROOM26, d&apos;estate il Ninfeo e
              il Morgan Beach Club.</Introduzione>

            <div style={{ marginTop: 16 }}>
              <Introduzione>Con me prenoti liste, tavoli e bracciali per le serate del ROOM26, e se vieni da fuori
                Roma organizzo la navetta su richiesta.</Introduzione>
            </div>

            <p className="nota" style={{ marginTop: 16 }}>
              Guarda <Link href="/serate">le&nbsp;serate</Link> oppure <Link href="/tavoli">come prenotare un&nbsp;tavolo</Link>.
            </p>

            <div style={{ marginTop: 24 }}>
              <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno>
                Segui @{INSTAGRAM}
              </Bottone>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
