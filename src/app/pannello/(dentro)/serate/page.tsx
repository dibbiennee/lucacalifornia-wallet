import { InterruttoriSerate } from "@/componenti/pannello/InterruttoriSerate";
import { listeDiAttesa, serate } from "@/lib/pannello/dati";

export const metadata = { title: "Serate, pannello Luca California" };

export default function Serate() {
  const attesa = listeDiAttesa();

  return (
    <main className="pannello-pagina">
      <p className="pannello-occhiello">ROOM 26</p>
      <h1 className="pannello-titolo">Serate</h1>
      <p className="debole" style={{ margin: "0.8rem 0 1.8rem" }}>
        Cosa vede la gente sul sito.
      </p>

      <InterruttoriSerate serate={serate()} />

      <section style={{ marginTop: "2.4rem" }}>
        <h2 className="etichetta-campo">
          Special guest <span className="debole">· {attesa.specialGuest} in attesa</span>
        </h2>
        <p className="debole" style={{ margin: "0 0 1rem", fontSize: "0.9375rem" }}>
          Quando aggiungi un ospite, chi è in attesa riceve l&apos;avviso.
        </p>
        <button type="button" className="bottone bottone-vuoto" style={{ width: "100%" }}>
          Aggiungi un ospite
        </button>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2 className="etichetta-campo">
          Capodanno <span className="debole">· {attesa.capodanno} in attesa</span>
        </h2>
        <p className="debole" style={{ margin: "0 0 1rem", fontSize: "0.9375rem" }}>
          Pacchetti non ancora pubblicati.
        </p>
        <button type="button" className="bottone bottone-vuoto" style={{ width: "100%" }}>
          Pubblica i pacchetti
        </button>
      </section>
    </main>
  );
}
