import Link from "next/link";

import { LettoreQr } from "@/componenti/LettoreQr";
import { stasera, ultimiIngressi } from "@/lib/pannello/dati";

export const metadata = { title: "Porta, pannello Luca California" };

/**
 * La porta.
 *
 * Il lettore prende tutto lo schermo, perché all'ingresso serve solo quello.
 * Sopra, mentre si inquadra, resta il conto di quanti sono dentro.
 */
export default function Porta() {
  const sera = stasera();
  const ingressi = ultimiIngressi();

  return (
    <>
      <LettoreQr
        intestazione={
          <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.6875rem", letterSpacing: "0.2em", color: "#8f8fb5", margin: "0 0 0.4rem" }}>
              PORTA · {sera.serata.toUpperCase()}
            </p>
            <p style={{ fontSize: "2rem", fontWeight: 800, margin: 0, lineHeight: 1 }}>
              {sera.entrati} / {sera.attesi}
            </p>
          </div>
        }
      />

      {/* Sotto il lettore, per chi scorre: la riserva se il QR non si legge. */}
      <div className="pannello-pagina" style={{ position: "relative", zIndex: 1, background: "var(--blu-piede)" }}>
        <h2 className="etichetta-campo">Se il QR non si legge</h2>
        <Link href="/pannello/richieste" className="bottone bottone-vuoto" style={{ width: "100%" }}>
          Cerca a mano nella lista
        </Link>

        <h2 className="etichetta-campo" style={{ marginTop: "2rem" }}>
          Ultimi ingressi
        </h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ingressi.map((i) => (
            <li
              key={i.nome}
              className="pannello-riquadro"
              style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
            >
              <span>
                {i.nome}
                {i.giaEntrato && <span className="debole">, già entrato</span>}
              </span>
              <span className="debole">{i.ora}</span>
            </li>
          ))}
        </ul>

        <p className="pannello-nota">
          Il lettore è vero e riconosce i biglietti veri. Il conteggio e gli ultimi ingressi sono
          di esempio: per ricordare chi è già passato serve il database.
        </p>
      </div>
    </>
  );
}
