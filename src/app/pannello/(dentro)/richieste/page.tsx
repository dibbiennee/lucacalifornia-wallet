import Link from "next/link";

import { DATI_DI_ESEMPIO, richieste } from "@/lib/pannello/dati";

export const metadata = { title: "Richieste, pannello Luca California" };

export default async function Richieste({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>;
}) {
  const { stato } = await searchParams;
  const tutte = richieste();
  const nuove = tutte.filter((r) => r.stato === "nuova");
  const confermate = tutte.filter((r) => r.stato === "confermata");
  const mostrate = stato === "nuova" ? nuove : stato === "confermata" ? confermate : tutte;

  const filtri = [
    { testo: `Nuove ${nuove.length}`, valore: "nuova" },
    { testo: `Confermate ${confermate.length}`, valore: "confermata" },
    { testo: "Tutte", valore: "" },
  ];

  return (
    <main className="pannello-pagina">
      <p className="pannello-occhiello">QUESTA SETTIMANA</p>
      <h1 className="pannello-titolo">Richieste</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", margin: "1.4rem 0" }}>
        {filtri.map((f) => {
          const attivo = (stato ?? "") === f.valore;
          return (
            <Link
              key={f.testo}
              href={f.valore === "" ? "/pannello/richieste" : `/pannello/richieste?stato=${f.valore}`}
              className={`scelta${attivo ? " scelta-attiva" : ""}`}
              style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              aria-current={attivo ? "true" : undefined}
            >
              {f.testo}
            </Link>
          );
        })}
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {mostrate.map((r) => (
          <li key={r.id}>
            <Link
              href={`/pannello/richieste/${r.id}`}
              className="pannello-riquadro"
              style={{ display: "block", textDecoration: "none" }}
            >
              <span style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
                <b>{r.nome}</b>
                <span className={`pannello-etichetta${r.stato === "nuova" ? "" : " pannello-etichetta-attesa"}`}>
                  {r.stato.toUpperCase()}
                </span>
              </span>
              <span className="debole" style={{ display: "block", fontSize: "0.9375rem", marginTop: "0.4rem" }}>
                {[r.serata, r.sala, r.tipo === "tavolo" ? `tavolo ${r.gruppo?.toLowerCase() ?? ""}` : "lista", r.budget === undefined ? null : `${r.budget} a testa`]
                  .filter(Boolean)
                  .join(", ")}
              </span>
              {r.messaggio !== undefined && (
                <span className="debole" style={{ display: "block", fontSize: "0.875rem", marginTop: "0.4rem", fontStyle: "italic" }}>
                  {r.messaggio}
                </span>
              )}
              {r.bigliettoInviatoAlle !== undefined && (
                <span className="debole" style={{ display: "block", fontSize: "0.8125rem", marginTop: "0.4rem" }}>
                  Biglietto inviato alle {r.bigliettoInviatoAlle}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {DATI_DI_ESEMPIO && (
        <p className="pannello-nota">Anteprima: queste richieste sono di esempio.</p>
      )}
    </main>
  );
}
