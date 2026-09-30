import Image from "next/image";
import Link from "next/link";

import { Bottone } from "@/componenti/sito/Bottone";
import { FoglioAvvisami } from "@/componenti/sito/FoglioAvvisami";
import { Indietro } from "@/componenti/sito/Indietro";
import { TestaPagina } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { LOCALI_STAGIONE } from "@/contenuti/locali";
import { legaParole } from "@/lib/tipografia";

export const metadata = {
  title: "I locali, stagione per stagione - Luca California",
  description:
    "D'inverno il Room 26 a Roma, d'estate il Ninfeo a Roma e il Morgan Beach Club a Civitavecchia.",
};

/** Ogni locale ha la sua foto e il suo colore di stagione. */
const VESTE: Readonly<Record<string, { readonly foto?: string; readonly colore: string; readonly alt?: string }>> = {
  room26: { foto: "/foto/night24.webp", colore: "var(--cyan)", alt: "Le luci del Room 26" },
  ninfeo: { foto: "/foto/sunset.webp", colore: "var(--sun)", alt: "Tramonto d'estate" },
  morgan: { colore: "var(--sun)" },
};

export default function Locali() {
  return (
    <>
      <Indietro testo="Home" dove="/" />
      <TestaPagina occhiello="Un locale per stagione" righe={["I locali"]} />

      <section className="wrap">
        <div className={stili.locali}>
          {LOCALI_STAGIONE.map((l) => {
            const veste = VESTE[l.codice];

            return (
              <article key={l.codice} className={stili.locale}>
                {veste?.foto !== undefined && (
                  <Image
                    src={veste.foto}
                    alt={veste.alt ?? ""}
                    width={640}
                    height={416}
                    sizes="(min-width: 720px) 33vw, 100vw"
                  />
                )}

                <div className={stili.dentro}>
                  <p className="occhiello" style={{ color: veste?.colore, margin: 0 }}>
                    {l.occhiello.charAt(0) + l.occhiello.slice(1).toLowerCase()}
                  </p>

                  <h2 className="display">
                    <Link href={`/locali/${l.codice}`} style={{ textDecoration: "none" }}>
                      {l.nome}
                    </Link>
                  </h2>

                  <strong>{legaParole(l.sottotitolo, { vedova: true })}</strong>
                  <p>{legaParole(l.testo, { vedova: true })}</p>

                  {l.attesa === undefined ? (
                    <Bottone href="/serate" aspetto="contorno">
                      Vedi le serate
                    </Bottone>
                  ) : (
                    <FoglioAvvisami
                      tipo={l.attesa}
                      etichetta="Avvisami quando apre"
                      titolo={`Ti scrivo io quando parte la stagione al ${l.nome}`}
                      spiegazione="Lasciami un contatto: ti avviso appena il calendario è pronto, prima che se ne accorgano gli altri."
                      aspetto="contorno"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
