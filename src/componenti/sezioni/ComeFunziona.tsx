import { Pila } from "@/componenti/Pila";
import { COME_FUNZIONA } from "@/contenuti/sito";

export function ComeFunziona() {
  return (
    <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
      <div className="dentro">
        <Pila occhiello="DALLA RICHIESTA ALLA PORTA" righe={["COME FUNZIONA"]} />

        <ol style={{ listStyle: "none", margin: "2rem 0 0", padding: 0, display: "grid", gap: "1.6rem" }}>
          {COME_FUNZIONA.map((passo, i) => (
            <li key={passo.titolo} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span
                aria-hidden
                style={{
                  flex: "0 0 auto",
                  width: "2.4rem",
                  height: "2.4rem",
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "var(--blu-scuro)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </span>
              <span>
                <strong style={{ display: "block", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                  {passo.titolo}
                </strong>
                <span className="debole">{passo.testo}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
