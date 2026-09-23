import Link from "next/link";

import { Pila } from "@/componenti/Pila";
import { LOCALI_STAGIONE } from "@/contenuti/locali";

export const metadata = {
  title: "I locali, stagione per stagione - Luca California",
  description:
    "D'inverno il Room 26 a Roma, d'estate il Ninfeo a Roma e il Morgan Beach Club a Civitavecchia.",
};

export default function Locali() {
  return (
    <section className="fascia">
      <div className="dentro">
        <Pila occhiello="UNO PER STAGIONE" righe={["DOVE MI", "TROVI"]} livello={1} />

        <p className="testo-lungo" style={{ margin: "1.6rem 0 2.2rem" }}>
          Ogni stagione scelgo un locale solo e ci porto tutta la mia lista.
        </p>

        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "0.9rem" }}>
          {LOCALI_STAGIONE.map((l) => (
            <li key={l.codice}>
              <Link
                href={`/locali/${l.codice}`}
                style={{
                  display: "block",
                  border: "2px solid rgba(255,255,255,0.3)",
                  padding: "1.2rem 1.3rem",
                  textDecoration: "none",
                }}
              >
                <span className="debole" style={{ display: "block", fontSize: "0.6875rem", letterSpacing: "0.16em", fontWeight: 700, marginBottom: "0.4rem" }}>
                  {l.occhiello}
                </span>
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--carattere-titoli), Impact, sans-serif",
                    fontSize: "1.9rem",
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                  }}
                >
                  {l.nome}
                </span>
                <span className="debole" style={{ display: "block", marginTop: "0.3rem" }}>
                  {l.citta}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
