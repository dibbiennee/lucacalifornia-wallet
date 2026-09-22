import Image from "next/image";

import { Pila } from "@/componenti/Pila";
import { CAPODANNO, DIVENTA_PR, ESTATE, MOTTO, NAVETTA, SPECIAL_GUEST } from "@/contenuti/sito";

/** Il riquadro dello special guest, con la lista d'attesa. */
export function SpecialGuest() {
  return (
    <section className="fascia" style={{ paddingTop: 0 }}>
      <div className="dentro" style={{ border: "2px solid rgba(255,255,255,0.3)", padding: "1.6rem" }}>
        <p style={{ fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 0.4rem" }}>
          {SPECIAL_GUEST.titolo}
        </p>
        <p className="debole" style={{ margin: "0 0 1.3rem" }}>
          {SPECIAL_GUEST.testo}
        </p>
        <a href="#prenota" className="bottone bottone-vuoto">
          {SPECIAL_GUEST.azione}
        </a>
      </div>
    </section>
  );
}

/** Il riquadro compatto su Luca, col motto. */
export function ChiELuca() {
  return (
    <section className="fascia" style={{ paddingTop: 0 }}>
      <div className="dentro">
        <Pila righe={[...MOTTO]} />

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1.8rem" }}>
          <Image
            src="/foto/luca-bailame-media.jpg"
            alt="Luca al Room 26"
            width={1069}
            height={1600}
            style={{ width: "6.5rem", height: "8rem", objectFit: "cover", objectPosition: "center 20%" }}
          />
          <a href="/chi-sono" style={{ fontWeight: 700, letterSpacing: "0.06em" }}>
            Chi è Luca →
          </a>
        </div>
      </div>
    </section>
  );
}

export function Navetta() {
  return (
    <section className="fascia" style={{ background: "var(--blu-scuro)" }} id="navetta">
      <div className="dentro">
        <Pila occhiello={NAVETTA.occhiello} righe={[NAVETTA.titolo]} />
        <p className="debole" style={{ margin: "1.6rem 0 1.6rem" }}>
          {NAVETTA.testo}
        </p>
        <a href="#prenota" className="bottone bottone-vuoto">
          {NAVETTA.azione}
        </a>
      </div>
    </section>
  );
}

export function Capodanno() {
  return (
    <section className="fascia" id="capodanno">
      <div className="dentro">
        <Pila occhiello={CAPODANNO.occhiello} righe={[CAPODANNO.titolo]} />

        <div style={{ display: "grid", gap: "0.9rem", margin: "2rem 0 1.6rem" }}>
          {CAPODANNO.pacchetti.map((pacchetto) => (
            <div
              key={pacchetto.nome}
              style={{ background: "var(--blu-scuro)", padding: "1.2rem 1.3rem" }}
            >
              <p className="debole" style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", letterSpacing: "0.16em", fontWeight: 700 }}>
                {pacchetto.nome}
              </p>
              <p
                style={{
                  margin: "0 0 0.6rem",
                  fontFamily: "var(--carattere-titoli), Impact, sans-serif",
                  fontSize: "1.7rem",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              >
                {pacchetto.righe.join(" ")}
              </p>
              <p className="debole" style={{ margin: 0, fontSize: "0.875rem" }}>
                Prezzo {pacchetto.prezzo}
              </p>
            </div>
          ))}
        </div>

        <a href="#prenota" className="bottone">
          {CAPODANNO.azione}
        </a>
      </div>
    </section>
  );
}

export function Estate() {
  return (
    <section className="fascia" style={{ paddingTop: 0 }}>
      <div className="dentro">
        <Pila occhiello={ESTATE.occhiello} righe={["NINFEO", "E MORGAN"]} />

        <div style={{ display: "grid", gap: "0.9rem", marginTop: "1.8rem" }}>
          {ESTATE.posti.map((posto) => (
            <div key={posto.nome} style={{ position: "relative", aspectRatio: "16 / 9", overflow: "hidden" }}>
              {posto.foto.startsWith("/") ? (
                <img
                  src={posto.foto}
                  alt={posto.nome}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    background: "var(--blu-scuro)",
                    color: "var(--testo-debole)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.12em",
                  }}
                >
                  FOTO {posto.foto}
                </div>
              )}
              <span
                style={{
                  position: "absolute",
                  left: "0.9rem",
                  bottom: "0.9rem",
                  background: "#ffffff",
                  color: "var(--blu-scuro)",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  letterSpacing: "0.1em",
                  padding: "0.4em 0.7em",
                }}
              >
                {posto.nome}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiventaPr() {
  return (
    <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
      <div className="dentro">
        <Pila occhiello={DIVENTA_PR.occhiello} righe={[...DIVENTA_PR.titolo]} />
        <p className="debole" style={{ margin: "1.6rem 0" }}>
          {DIVENTA_PR.testo}
        </p>
        <a href="/diventa-pr" className="bottone">
          {DIVENTA_PR.azione}
        </a>
      </div>
    </section>
  );
}
