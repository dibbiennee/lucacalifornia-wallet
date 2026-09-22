import { SERATE } from "@/contenuti/sito";

/**
 * Il nastro che scorre sotto l'apertura.
 *
 * Le voci sono scritte due volte perché lo scorrimento si chiude ad anello:
 * quando la prima metà è uscita, la seconda è esattamente dov'era la prima.
 */
export function Nastro() {
  const voci = [...SERATE.map((s) => `${s.giorno} ${s.nome}`), "SERVIZIO NAVETTA"];

  return (
    <div
      aria-hidden
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.22)",
        borderBottom: "1px solid rgba(255,255,255,0.22)",
        padding: "0.7rem 0",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: "scorri 26s linear infinite",
        }}
      >
        {[0, 1].map((giro) => (
          <div key={giro} style={{ display: "flex" }}>
            {voci.map((voce) => (
              <span
                key={voce}
                style={{
                  padding: "0 1.1rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  whiteSpace: "nowrap",
                }}
              >
                {voce}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
