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

        <p
          style={{
            border: "2px dashed rgba(255,255,255,0.4)",
            padding: "1.2rem",
            margin: 0,
            color: "var(--testo-debole)",
          }}
        >
          Il testo di questa pagina lo scrive Luca: [DA CONFERMARE].
          <br />
          In anteprima non lo inventiamo.
        </p>
      </div>
    </section>
  );
}
