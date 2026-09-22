import { CopiaLink } from "@/componenti/pannello/CopiaLink";
import { compleanni, squadra } from "@/lib/pannello/dati";

export const metadata = { title: "Squadra, pannello Luca California" };

export default function Squadra() {
  return (
    <main className="pannello-pagina">
      <p className="pannello-occhiello">SETTEMBRE</p>
      <h1 className="pannello-titolo">Squadra</h1>

      <div style={{ marginTop: "1.8rem" }}>
        {squadra().map((pr) => (
          <div key={pr.nome} className="pannello-riquadro">
            <p style={{ display: "flex", justifyContent: "space-between", gap: "1rem", margin: "0 0 0.6rem" }}>
              <b style={{ letterSpacing: "0.06em" }}>{pr.nome.toUpperCase()}</b>
              <span className="debole">{pr.prenotazioni} prenotazioni</span>
            </p>

            <CopiaLink link={pr.link} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem", marginTop: "0.9rem" }}>
              <span className="pannello-numero">
                <b>{pr.liste}</b>
                <span>liste</span>
              </span>
              <span className="pannello-numero">
                <b>{pr.tavoli}</b>
                <span>tavoli</span>
              </span>
              <span className="pannello-numero">
                <b>{pr.provvigioni} €</b>
                <span>provvigioni</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="bottone bottone-vuoto" style={{ width: "100%", marginTop: "0.6rem" }}>
        Aggiungi un PR
      </button>

      <section style={{ marginTop: "2.4rem" }}>
        <h2 className="etichetta-campo">Compleanni in arrivo</h2>
        {compleanni().map((c) => (
          <div key={c.nome} className="pannello-riquadro">
            <p style={{ display: "flex", justifyContent: "space-between", gap: "1rem", margin: "0 0 0.4rem" }}>
              <b>{c.nome}</b>
              <span className="debole">{c.fra}</span>
            </p>
            <p className="debole" style={{ margin: "0 0 0.9rem", fontSize: "0.9375rem" }}>
              L&apos;anno scorso: {c.annoScorso.toLowerCase()}
            </p>
            <a
              href={`https://wa.me/${c.telefono}`}
              className="bottone bottone-vuoto"
              style={{ width: "100%", minHeight: "2.9rem", fontSize: "0.875rem" }}
            >
              Scrivi su WhatsApp
            </a>
          </div>
        ))}
      </section>

      <p className="pannello-nota">
        Anteprima: squadra e compleanni sono di esempio. I link personali dei PR non tracciano
        ancora niente, perché non c&apos;è il database dove segnare chi arriva da chi.
      </p>
    </main>
  );
}
