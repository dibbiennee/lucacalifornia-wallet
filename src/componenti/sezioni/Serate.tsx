import Link from "next/link";

import { Pila } from "@/componenti/Pila";
import { SERATE } from "@/contenuti/sito";

/** Le quattro serate come copertine verticali, con l'etichetta dal vivo. */
export function Serate() {
  return (
    <section className="fascia" id="serate">
      <div className="dentro">
        <Pila occhiello="TUTTE" righe={["LE SERATE ROOM26"]} />

        <div className="griglia-serate" style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
          {SERATE.map((serata) => (
            <Link
              key={serata.codice}
              href={`/serate/${serata.codice}`}
              style={{
                position: "relative",
                display: "block",
                aspectRatio: "4 / 5",
                overflow: "hidden",
                textDecoration: "none",
              }}
            >
              <img
                src={serata.copertina}
                alt={`${serata.giorno} ${serata.nome}`}
                loading="lazy"
                width={720}
                height={900}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(14,8,69,0.92) 18%, rgba(14,8,69,0.15) 60%)",
                }}
              />

              <span
                style={{
                  position: "absolute",
                  top: "0.9rem",
                  left: "0.9rem",
                  background: serata.etichetta === "TUTTO PIENO" ? "#8E0B2B" : "#ffffff",
                  color: serata.etichetta === "TUTTO PIENO" ? "#fff" : "var(--blu-scuro)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  padding: "0.4em 0.7em",
                }}
              >
                {serata.etichetta}
              </span>

              <span style={{ position: "absolute", left: "0.9rem", right: "0.9rem", bottom: "1rem" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    letterSpacing: "0.18em",
                    marginBottom: "0.2rem",
                  }}
                >
                  {serata.giorno}
                </span>
                <h3
                  style={{
                    display: "block",
                    fontSize: "clamp(2rem, 9vw, 2.75rem)",
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {serata.nome}
                </h3>
                <span className="debole" style={{ display: "block", fontSize: "0.8125rem", letterSpacing: "0.1em", marginTop: "0.3rem" }}>
                  {serata.musica}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
