import { Pila } from "@/componenti/Pila";

/**
 * L'apertura, col video del Room 26 tagliato e in loop.
 *
 * È un webp animato e non un mp4: parte da solo anche su iPhone in risparmio
 * energetico, non chiede javascript, e pesa un decimo del video originale.
 */
export function Apertura() {
  return (
    <section style={{ position: "relative", minHeight: "88svh", display: "flex", alignItems: "flex-end" }}>
      <picture>
        <source srcSet="/video/hero-desktop.webp" media="(min-width: 800px)" />
        <img
          src="/video/hero-mobile.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </picture>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(20,12,92,0.95) 12%, rgba(20,12,92,0.35) 55%, rgba(20,12,92,0.6))",
        }}
      />

      <div
        className="dentro"
        style={{ position: "relative", width: "100%", padding: "0 var(--margine) 3rem" }}
      >
        <p
          className="debole"
          style={{ fontSize: "0.6875rem", letterSpacing: "0.2em", fontWeight: 700, margin: "0 0 0.9rem" }}
        >
          GIOVEDÌ, VENERDÌ, SABATO, DOMENICA
        </p>

        <Pila righe={["LA NOTTE", "TI DÀ LIBERTÀ"]} />

        <p style={{ margin: "1.5rem 0 1.75rem", maxWidth: "26rem" }}>
          Ciao, sono Luca. Liste e tavoli al Room 26 di Roma,
          <br />e la navetta per arrivarci.
        </p>

        <a href="#prenota" className="bottone">
          Entra in lista o prenota
        </a>
      </div>
    </section>
  );
}
