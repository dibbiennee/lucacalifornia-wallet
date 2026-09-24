import Image from "next/image";

import { Bottone } from "@/componenti/sito/Bottone";
import { Indietro, TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { INSTAGRAM, INSTAGRAM_URL, MOTTO } from "@/contenuti/sito";

export const metadata = {
  title: "Chi è Luca - Luca California",
  description:
    "Luca Curella, PR e organizzatore di eventi a Roma. Ogni stagione un locale solo, e tutta la lista dentro.",
};

export default function PaginaChiSono() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina
        occhiello="Chi sono"
        righe={[`${MOTTO[0]},`, `${MOTTO[1]} ${MOTTO[2]}`.toLowerCase()]}
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <Image
          src="/foto/luca.webp"
          alt="Luca Curella"
          width={1280} 
          height={1280}
          sizes="(min-width: 1180px) 1140px, 100vw"
          className={stili.foto}
          priority
        />

        <p className="introduzione">
          Sono Luca Curella, PR e organizzatore di eventi a Roma. Ogni stagione scelgo un locale
          solo e ci porto tutta la mia lista: d&apos;inverno il Room 26, d&apos;estate il Ninfeo e
          il Morgan Beach Club.
        </p>

        <div style={{ marginTop: 24 }}>
          <Bottone href={INSTAGRAM_URL} aspetto="contorno" esterno>
            Segui @{INSTAGRAM}
          </Bottone>
        </div>
      </section>
    </>
  );
}
