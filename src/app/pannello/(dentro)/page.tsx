import Link from "next/link";

import { DATI_DI_ESEMPIO, richieste, stasera } from "@/lib/pannello/dati";

export const metadata = { title: "Oggi, pannello Luca California" };

export default function Oggi() {
  const sera = stasera();
  const nuove = richieste("nuova");

  return (
    <main className="pannello-pagina">
      <p className="pannello-occhiello">OGGI · {sera.giorno.toUpperCase()}</p>
      <h1 className="pannello-titolo">{sera.serata}</h1>

      {sera.inCorso && (
        <p style={{ margin: "0.8rem 0 0" }}>
          <span className="pannello-etichetta">IN CORSO</span>
        </p>
      )}

      <div className="pannello-numeri">
        <div className="pannello-numero">
          <b>{sera.inLista}</b>
          <span>in lista</span>
        </div>
        <div className="pannello-numero">
          <b>{sera.tavoli}</b>
          <span>tavoli</span>
        </div>
        <div className="pannello-numero">
          <b>{sera.entrati}</b>
          <span>entrati</span>
        </div>
      </div>

      <Link href="/pannello/porta" className="bottone" style={{ width: "100%" }}>
        Apri la porta
      </Link>

      <h2 className="etichetta-campo" style={{ margin: "2.2rem 0 0.8rem" }}>
        Da confermare · {nuove.length} nuove
      </h2>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {nuove.map((r) => (
          <li key={r.id}>
            <Link
              href={`/pannello/richieste/${r.id}`}
              className="pannello-riquadro"
              style={{ display: "block", textDecoration: "none" }}
            >
              <span style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <b>{r.nome}</b>
                <span className="debole" style={{ fontSize: "0.875rem" }}>
                  {r.quando}
                </span>
              </span>
              <span className="debole" style={{ display: "block", fontSize: "0.9375rem", marginTop: "0.3rem" }}>
                {descrizione(r.tipo, r.gruppo, r.budget, r.occasione)}
              </span>
              {/* La provenienza non sta qui: in questa schermata serve sapere
                  chi è e cosa vuole, non da che link è arrivato. Resta nel
                  dettaglio, dove è un dato che si va a cercare. */}
              <span style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                {[r.serata, r.sala].filter(Boolean).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginTop: "1.4rem" }}>
        <div className="pannello-numero">
          <b>{sera.compleanniInArrivo}</b>
          <span>compleanni in arrivo</span>
        </div>
        <div className="pannello-numero">
          <b>{sera.attesaCapodanno}</b>
          <span>in attesa Capodanno</span>
        </div>
      </div>

      {DATI_DI_ESEMPIO && (
        <p className="pannello-nota">
          Anteprima: i numeri e le richieste di queste schermate sono di esempio. Diventano veri
          quando colleghiamo il database.
        </p>
      )}
    </main>
  );
}

function descrizione(
  tipo: string,
  gruppo: string | undefined,
  budget: string | undefined,
  occasione: string | undefined,
): string {
  const pezzi = [tipo === "tavolo" ? "Tavolo" : "Lista"];
  if (gruppo !== undefined) pezzi.push(gruppo.toLowerCase());
  if (budget !== undefined) pezzi.push(`${budget} a testa`);
  if (occasione !== undefined) pezzi.push(occasione.toLowerCase());
  return pezzi.join(", ");
}
