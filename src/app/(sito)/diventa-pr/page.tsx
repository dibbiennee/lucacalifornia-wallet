import { Pila } from "@/componenti/Pila";
import { ModuloPr } from "@/componenti/sezioni/ModuloPr";

export const metadata = { title: "Diventa PR - Luca California" };

const VANTAGGI = [
  { titolo: "FESTA E NETWORKING", testo: "Lavori dove ti diverti e conosci gente nuova ogni settimana." },
  { titolo: "GUADAGNO IMMEDIATO", testo: "Provvigioni e bonus su liste e tavoli che porti." },
  { titolo: "CRESCITA NEL NIGHTLIFE", testo: "Impari il mestiere da chi lo fa da anni." },
] as const;

const FORMAZIONE = [
  {
    titolo: "TEORIA",
    testo: "Una giornata con me: come si costruisce una lista, come si gestiscono tavoli e clienti.",
  },
  { titolo: "PRATICA", testo: "Una serata vera, dentro il locale, accanto a me." },
] as const;

export default function PaginaDiventaPr() {
  return (
    <>
      <section className="fascia">
        <div className="dentro">
          <p className="debole" style={{ fontSize: "0.75rem", letterSpacing: "0.2em", fontWeight: 700, margin: "0 0 0.9rem" }}>
            ALL WE HAVE IS NOW
          </p>
          <Pila occhiello="APERTE LE CANDIDATURE" righe={["PER LA FIGURA DI", "PR"]} livello={1} />
          <p className="testo-lungo" style={{ margin: "1.6rem 0 0" }}>
            Cerco nuovi PR per la mia squadra, a Roma e sul litorale. Non serve esperienza: la
            formazione la faccio io, di persona.
          </p>
        </div>
      </section>

      <section className="fascia" style={{ background: "var(--blu-scuro)" }}>
        <div className="dentro">
          <Pila occhiello="COSA CI GUADAGNI" righe={["PERCHÉ FARLO"]} />
          <div style={{ display: "grid", gap: "1.4rem", marginTop: "1.8rem" }}>
            {VANTAGGI.map((v) => (
              <div key={v.titolo}>
                <strong style={{ display: "block", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                  {v.titolo}
                </strong>
                <span className="debole">{v.testo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fascia">
        <div className="dentro">
          <Pila occhiello="DUE GIORNI CON LUCA" righe={["LA FORMAZIONE"]} />
          <ol style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0", display: "grid", gap: "1.4rem" }}>
            {FORMAZIONE.map((passo, i) => (
              <li key={passo.titolo} style={{ display: "flex", gap: "1rem" }}>
                <span
                  aria-hidden
                  style={{
                    flex: "0 0 auto",
                    width: "2.4rem",
                    height: "2.4rem",
                    borderRadius: "50%",
                    background: "#fff",
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

      <ModuloPr />
    </>
  );
}
