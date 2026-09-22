import Image from "next/image";

import { Pila } from "@/componenti/Pila";
import { MOTTO } from "@/contenuti/sito";

export const metadata = { title: "Chi è Luca - Luca California" };

export default function PaginaChiSono() {
  return (
    <section className="fascia">
      <div className="dentro">
        <Pila occhiello="CHI SONO" righe={[...MOTTO]} />

        <Image
          src="/foto/luca-bailame-media.jpg"
          alt="Luca al Room 26"
          width={1069}
          height={1600}
          style={{ width: "100%", height: "auto", margin: "2rem 0" }}
        />

        <p className="testo-lungo" style={{ margin: 0 }}>
          Sono Luca Curella, PR e organizzatore di eventi a Roma. Ogni stagione scelgo un locale
          solo e ci porto tutta la mia lista: d&apos;inverno il Room 26, d&apos;estate il Ninfeo e
          il Morgan Beach Club.
        </p>
      </div>
    </section>
  );
}
