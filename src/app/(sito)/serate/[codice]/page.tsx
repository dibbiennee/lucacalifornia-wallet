import Link from "next/link";
import { notFound } from "next/navigation";

import { Pila } from "@/componenti/Pila";
import { Modulo } from "@/componenti/sezioni/Modulo";
import { LOCALE, SERATE } from "@/contenuti/sito";

export function generateStaticParams() {
  return SERATE.map((serata) => ({ codice: serata.codice }));
}

export async function generateMetadata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.codice === codice);

  return serata === undefined
    ? {}
    : { title: `${serata.nome}, ${serata.quando.toLowerCase()} al Room 26 - Luca California` };
}

export default async function PaginaSerata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.codice === codice);

  if (serata === undefined) {
    notFound();
  }

  const altre = SERATE.filter((s) => s.codice !== serata.codice);

  return (
    <>
      <section style={{ position: "relative" }}>
        <img
          src={serata.copertina}
          alt={`${serata.giorno} ${serata.nome} al Room 26`}
          style={{ width: "100%", height: "58svh", objectFit: "cover" }}
        />
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, var(--blu) 8%, rgba(43,27,176,0.25) 60%)",
          }}
        />
      </section>

      <section className="fascia" style={{ paddingTop: "1rem" }}>
        <div className="dentro">
          <p className="debole" style={{ fontSize: "0.6875rem", letterSpacing: "0.18em", fontWeight: 700, margin: "0 0 0.9rem" }}>
            {serata.quando} AL ROOM 26
          </p>

          <Pila righe={[serata.nome, serata.musica]} />

          <p className="testo-lungo" style={{ margin: "1.6rem 0 2rem" }}>{serata.descrizione}</p>

          <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", margin: 0 }}>
            <div>
              <dt className="debole" style={{ fontSize: "0.6875rem", letterSpacing: "0.16em", fontWeight: 700 }}>
                QUANDO
              </dt>
              <dd style={{ margin: "0.3rem 0 0", fontWeight: 700 }}>{serata.quando}</dd>
            </div>
            <div>
              <dt className="debole" style={{ fontSize: "0.6875rem", letterSpacing: "0.16em", fontWeight: 700 }}>
                DOVE
              </dt>
              <dd style={{ margin: "0.3rem 0 0", fontWeight: 700 }}>{LOCALE.nome}</dd>
            </div>
          </dl>
        </div>
      </section>

      <Modulo />

      <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
        <div className="dentro">
          <Pila occhiello="LE ALTRE" righe={["SERATE ROOM26"]} />
          <ul style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0", display: "grid", gap: "0.7rem" }}>
            {altre.map((altra) => (
              <li key={altra.codice}>
                <Link
                  href={`/serate/${altra.codice}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.1rem",
                    border: "2px solid rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  <span>
                    {altra.giorno} {altra.nome}
                  </span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
