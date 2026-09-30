import Link from "next/link";
import { notFound } from "next/navigation";

import { Bottone } from "@/componenti/sito/Bottone";
import { FoglioAvvisami } from "@/componenti/sito/FoglioAvvisami";
import { Indietro } from "@/componenti/sito/Indietro";
import { Altre, FotoPagina, Introduzione, TestaPagina } from "@/componenti/sito/Pagina";
import { LOCALI_STAGIONE, locale } from "@/contenuti/locali";
import { SERATE } from "@/contenuti/sito";

export function generateStaticParams() {
  return LOCALI_STAGIONE.map((l) => ({ codice: l.codice }));
}

export async function generateMetadata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const l = locale(codice);
  return l === undefined ? {} : { title: `${l.nome}, ${l.citta} - Luca California`, description: l.testo };
}

/** La foto e il colore di ogni locale: gli stessi dell'elenco. */
const VESTE: Readonly<Record<string, { readonly foto?: string; readonly colore: string; readonly alt?: string }>> = {
  room26: { foto: "/foto/night24.webp", colore: "var(--cyan)", alt: "Le luci del Room 26" },
  ninfeo: { foto: "/foto/sunset.webp", colore: "var(--sun)", alt: "Tramonto d'estate" },
  morgan: { colore: "var(--sun)" },
};

export default async function PaginaLocale({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const l = locale(codice);

  if (l === undefined) {
    notFound();
  }

  const veste = VESTE[l.codice];
  const altri = LOCALI_STAGIONE.filter((x) => x.codice !== l.codice);

  return (
    <>
      <Indietro testo="Tutti i locali" dove="/locali" />
      <TestaPagina
        occhiello={l.occhiello.charAt(0) + l.occhiello.slice(1).toLowerCase()}
        colore={veste?.colore ?? "var(--muted)"}
        righe={[...l.titolo]}
        introduzione={l.sottotitolo}
      />

      <section className="wrap" style={{ paddingBottom: 56 }}>
        {veste?.foto !== undefined && <FotoPagina src={veste.foto} alt={veste.alt ?? l.nome} />}

        <Introduzione>{l.testo}</Introduzione>

        <div style={{ marginTop: 24 }}>
          {l.attesa === undefined ? (
            <Bottone href="/serate">Vedi le serate</Bottone>
          ) : (
            <FoglioAvvisami
              tipo={l.attesa}
              etichetta="Avvisami quando apre"
              titolo={`Ti scrivo io quando parte la stagione al ${l.nome}`}
              spiegazione="Lasciami un contatto: ti avviso appena il calendario è pronto, prima che se ne accorgano gli altri."
              aspetto="caldo"
            />
          )}
        </div>

        {l.codice === "room26" && (
          <div style={{ marginTop: 36 }}>
            <p className="occhiello" style={{ color: "var(--muted)" }}>
              Quattro sere a settimana
            </p>
            <Altre>
              {SERATE.map((s) => (
                <Link key={s.codice} href={`/serate/${s.codice}`} style={{ background: `var(--${s.colore})` }}>
                  {s.breve} {s.nome}
                </Link>
              ))}
            </Altre>
          </div>
        )}

        <div style={{ marginTop: 36 }}>
          <p className="occhiello" style={{ color: "var(--muted)" }}>
            Gli altri
          </p>
          <Altre>
            {altri.map((a) => (
              <Link
                key={a.codice}
                href={`/locali/${a.codice}`}
                style={{ background: "var(--surface)", color: "var(--text)", boxShadow: "inset 0 0 0 1.5px var(--line)" }}
              >
                {a.nome}, {a.citta}
              </Link>
            ))}
          </Altre>
        </div>
      </section>
    </>
  );
}
