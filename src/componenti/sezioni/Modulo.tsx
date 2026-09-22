"use client";

import { useState, type CSSProperties } from "react";

import { Pila } from "@/componenti/Pila";

/**
 * Il modulo di prenotazione.
 *
 * Tutte le scelte sono bottoni e non menu a tendina, ed è una richiesta
 * esplicita del brief. Il numero di persone non si chiede: lo ha chiesto Luca.
 */

const SERATE_MODULO = [
  "Gio Milkshake",
  "Ven commerciale",
  "Sab sala 1 house",
  "Sab sala 2 reggaeton",
  "Dom Báilame",
] as const;

const GRUPPI = ["Solo ragazzi", "Solo ragazze", "Misto"] as const;
const BUDGET = ["25–30 €", "35–50 €", "Oltre 50 €"] as const;
const OCCASIONI = [
  "Compleanno",
  "Laurea",
  "Diciottesimo",
  "Addio al nubilato",
  "Addio al celibato",
  "Anniversario",
  "Nessuna",
] as const;

const etichetta: CSSProperties = {
  display: "block",
  fontSize: "0.6875rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  margin: "0 0 0.6rem",
};

const campo: CSSProperties = {
  width: "100%",
  minHeight: "3.2rem",
  padding: "0 1rem",
  border: "2px solid rgba(255,255,255,0.35)",
  background: "transparent",
  color: "#fff",
  fontSize: "1rem",
  fontFamily: "inherit",
};

const gruppo: CSSProperties = { marginBottom: "1.6rem" };

function scelta(attivo: boolean): CSSProperties {
  return {
    minHeight: "2.9rem",
    padding: "0 1rem",
    border: attivo ? "2px solid #fff" : "2px solid rgba(255,255,255,0.35)",
    background: attivo ? "#fff" : "transparent",
    color: attivo ? "var(--blu-scuro)" : "#fff",
    fontWeight: 700,
    fontSize: "0.9375rem",
  };
}

const fila: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "0.5rem" };

export function Modulo() {
  const [tavolo, setTavolo] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serata, setSerata] = useState<string>(SERATE_MODULO[0]);
  const [gruppoScelto, setGruppoScelto] = useState<string>(GRUPPI[2]);
  const [budget, setBudget] = useState<string>(BUDGET[0]);
  const [occasione, setOccasione] = useState<string>(OCCASIONI[6]);
  const [note, setNote] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [inviata, setInviata] = useState(false);

  async function invia() {
    setErrore("");
    setInCorso(true);

    try {
      const risposta = await fetch("/api/richiesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: tavolo ? "tavolo" : "lista",
          nome,
          cognome,
          telefono,
          serata,
          ...(tavolo ? { gruppo: gruppoScelto, budget, occasione, note } : {}),
        }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      setInviata(true);
    } catch {
      setErrore("Non sono riuscito a mandare la richiesta");
    } finally {
      setInCorso(false);
    }
  }

  if (inviata) {
    return (
      <section className="fascia" id="prenota">
        <div className="dentro">
          <Pila occhiello="CI SIAMO" righe={["RICHIESTA", "INVIATA"]} />
          <p style={{ margin: "1.6rem 0 0" }}>
            Luca la vede e ti scrive su WhatsApp con disponibilità e prezzo.
          </p>
          <p className="debole" style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
            Questa è un&apos;anteprima: la richiesta non viene salvata da nessuna parte.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="fascia" id="prenota">
      <div className="dentro">
        <Pila occhiello="IN 30 SECONDI" righe={["ENTRA IN LISTA", "O PRENOTA"]} />

        <div style={{ marginTop: "2rem" }}>
          <div style={{ ...gruppo, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <button onClick={() => setTavolo(false)} style={scelta(!tavolo)}>
              LISTA
            </button>
            <button onClick={() => setTavolo(true)} style={scelta(tavolo)}>
              TAVOLO
            </button>
          </div>

          <div style={gruppo}>
            <span style={etichetta}>NOME</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} style={campo} autoComplete="given-name" />
          </div>

          <div style={gruppo}>
            <span style={etichetta}>COGNOME</span>
            <input value={cognome} onChange={(e) => setCognome(e.target.value)} style={campo} autoComplete="family-name" />
          </div>

          <div style={gruppo}>
            <span style={etichetta}>TELEFONO</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={campo}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <div style={gruppo}>
            <span style={etichetta}>SERATA</span>
            <div style={fila}>
              {SERATE_MODULO.map((s) => (
                <button key={s} onClick={() => setSerata(s)} style={scelta(serata === s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {tavolo && (
            <>
              <div style={gruppo}>
                <span style={etichetta}>CHI C&apos;È AL TAVOLO</span>
                <div style={fila}>
                  {GRUPPI.map((g) => (
                    <button key={g} onClick={() => setGruppoScelto(g)} style={scelta(gruppoScelto === g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div style={gruppo}>
                <span style={etichetta}>BUDGET A TESTA</span>
                <div style={fila}>
                  {BUDGET.map((b) => (
                    <button key={b} onClick={() => setBudget(b)} style={scelta(budget === b)}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div style={gruppo}>
                <span style={etichetta}>OCCASIONE SPECIALE?</span>
                <div style={fila}>
                  {OCCASIONI.map((o) => (
                    <button key={o} onClick={() => setOccasione(o)} style={scelta(occasione === o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div style={gruppo}>
                <span style={etichetta}>ALTRE RICHIESTE</span>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={campo}
                  placeholder="Facoltativo"
                />
              </div>
            </>
          )}

          {errore !== "" && (
            <p style={{ color: "#FFB4C4", margin: "0 0 1rem" }}>{errore}</p>
          )}

          <button
            onClick={() => void invia()}
            disabled={inCorso}
            className="bottone"
            style={{ width: "100%", opacity: inCorso ? 0.6 : 1 }}
          >
            {inCorso ? "Un attimo..." : "Invia la richiesta"}
          </button>

          <p className="debole" style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
            La richiesta arriva direttamente a Luca. Quando conferma, ricevi il biglietto da
            aggiungere al Wallet.
          </p>
        </div>
      </div>
    </section>
  );
}
