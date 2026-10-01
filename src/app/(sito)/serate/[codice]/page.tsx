import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Bottone } from "@/componenti/sito/Bottone";
import { perPrenotare } from "@/componenti/sito/CardSerata";
import { Indietro } from "@/componenti/sito/Indietro";
import { Altre, Azioni, CardMappa, Dati, Introduzione } from "@/componenti/sito/Pagina";
import stili from "@/componenti/sito/Pagina.module.css";
import { LOCALE, SERATE } from "@/contenuti/sito";

export function generateStaticParams() {
  return SERATE.map((serata) => ({ codice: serata.codice }));
}

export async function generateMetadata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.codice === codice);

  return serata === undefined
    ? {}
    : {
        title: `${serata.nome}, ${serata.quando.toLowerCase()} al ROOM26 - Luca California`,
        description: serata.descrizione,
      };
}

export default async function PaginaSerata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.codice === codice);

  if (serata === undefined) {
    notFound();
  }

  const colore = `var(--${serata.colore})`;
  const altre = SERATE.filter((s) => s.codice !== serata.codice);

  return (
    <>
      <Indietro testo="Tutte le serate" dove="/serate" />

      <section className="wrap" style={{ padding: "10px 20px 56px" }}>
        <div className={stili["serata-griglia"]}>
          <div className={stili.serata} style={{ background: colore }}>
            <div>
              <Image
                src={serata.copertina}
                alt={serata.alt}
                width={1280}
                height={1088}
                sizes="(min-width: 860px) 50vw, 100vw"
                priority
                style={serata.copertinaPosizione === undefined ? undefined : { objectPosition: serata.copertinaPosizione }}
              />
              <span className={stili.targhetta} style={{ color: colore }}>
                {serata.etichetta}
              </span>
            </div>

            <div className={stili.banda}>
              <p className={stili.giorno}>{serata.giorno}</p>
              <h1 className="display" style={serata.codice === "sabato" ? { fontStretch: "100%" } : undefined} tabIndex={-1}>
                {serata.nome}
              </h1>
              <p className={stili.musica}>{serata.genere}</p>
            </div>
          </div>

          <div>
            <div style={{ marginTop: 22 }}>
              <Introduzione>{serata.descrizione}</Introduzione>
            </div>

            <Dati voci={[["Quando", serata.quando]]} />
            <CardMappa nome={LOCALE.nome} indirizzo={LOCALE.indirizzo} />

            <Azioni>
              <Bottone href={perPrenotare(serata.perModulo, "tavolo")} classe="cta-prenota">
                Prenota il tavolo
              </Bottone>
              <Bottone href={perPrenotare(serata.perModulo)} aspetto="contorno" classe="cta-prenota">
                Entra in lista
              </Bottone>
              <Bottone href={`/api/calendario/${serata.codice}`} aspetto="chiaro" esterno>
                Aggiungi al calendario
              </Bottone>
            </Azioni>

            <div style={{ marginTop: 36 }}>
              <p className="occhiello" style={{ color: "var(--muted)" }}>
                Le altre serate
              </p>
              <Altre>
                {altre.map((a) => (
                  <Link key={a.codice} href={`/serate/${a.codice}`} style={{ background: `var(--${a.colore})` }}>
                    {a.breve} {a.nome}
                  </Link>
                ))}
              </Altre>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
