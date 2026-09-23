import Link from "next/link";
import { notFound } from "next/navigation";

import { ModuloBreve } from "@/componenti/ModuloBreve";
import { Pila } from "@/componenti/Pila";
import { Modulo } from "@/componenti/sezioni/Modulo";
import { LOCALI_STAGIONE, locale } from "@/contenuti/locali";
import { SERATE } from "@/contenuti/sito";

export function generateStaticParams() {
  return LOCALI_STAGIONE.map((l) => ({ codice: l.codice }));
}

export async function generateMetadata({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const l = locale(codice);
  return l === undefined ? {} : { title: `${l.nome}, ${l.citta} - Luca California` };
}

export default async function PaginaLocale({ params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const l = locale(codice);

  if (l === undefined) {
    notFound();
  }

  const altri = LOCALI_STAGIONE.filter((x) => x.codice !== l.codice);

  return (
    <>
      {l.foto !== undefined && (
        <section style={{ position: "relative" }}>
          <img
            src={l.foto}
            alt={`${l.nome}, ${l.citta}`}
            width={720}
            height={900}
            style={{ width: "100%", height: "46svh", objectFit: "cover" }}
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
      )}

      <section className="fascia" style={l.foto === undefined ? {} : { paddingTop: "1rem" }}>
        <div className="dentro">
          <Pila occhiello={l.occhiello} righe={[...l.titolo]} livello={1} />
          <p className="debole" style={{ margin: "1.2rem 0 0", fontWeight: 600 }}>
            {l.sottotitolo}
          </p>
          <p className="testo-lungo" style={{ margin: "1rem 0 0" }}>
            {l.testo}
          </p>
        </div>
      </section>

      {l.codice === "room26" && (
        <section className="fascia" style={{ background: "var(--blu-scuro)", paddingTop: 0 }}>
          <div className="dentro">
            <Pila occhiello="QUATTRO SERE A SETTIMANA" righe={["LE SERATE"]} />
            <ul style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0", display: "grid", gap: "0.7rem" }}>
              {SERATE.map((s) => (
                <li key={s.codice}>
                  <Link
                    href={`/serate/${s.codice}`}
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
                      {s.giorno} {s.nome}
                    </span>
                    <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {l.attesa !== undefined && (
        <section className="fascia" style={{ paddingTop: 0 }}>
          <div className="dentro" style={{ border: "2px solid rgba(255,255,255,0.3)", padding: "1.6rem" }}>
            <ModuloBreve
              azione="/api/lista-attesa"
              etichettaBottone="Avvisami quando apre"
              titoloModulo={`Ti scrivo io quando parte la stagione al ${l.nome}`}
              corpoFisso={{ tipo: l.attesa }}
              conferma="Sei in lista: ti avviso io."
              campi={[
                { nome: "nome", etichetta: "Nome", obbligatorio: true },
                {
                  nome: "contatto",
                  etichetta: "Telefono o email",
                  tipo: "text",
                  obbligatorio: true,
                  segnaposto: "334 854 8735",
                },
              ]}
            />
          </div>
        </section>
      )}

      {l.codice === "room26" && <Modulo />}

      <section className="fascia" style={{ paddingTop: 0 }}>
        <div className="dentro">
          <Pila occhiello="GLI ALTRI" righe={["DOVE MI TROVI"]} />
          <ul style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0", display: "grid", gap: "0.7rem" }}>
            {altri.map((a) => (
              <li key={a.codice}>
                <Link
                  href={`/locali/${a.codice}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem 1.1rem",
                    border: "2px solid rgba(255,255,255,0.3)",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {a.nome}, {a.citta}
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
