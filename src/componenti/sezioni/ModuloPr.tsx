"use client";

import { useState, type CSSProperties } from "react";

import { Pila } from "@/componenti/Pila";

/** La candidatura per entrare nella squadra di PR. */

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

const etichetta: CSSProperties = {
  display: "block",
  fontSize: "0.6875rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  margin: "0 0 0.6rem",
};

export function ModuloPr() {
  const [nome, setNome] = useState("");
  const [eta, setEta] = useState("");
  const [citta, setCitta] = useState("");
  const [instagram, setInstagram] = useState("");
  const [errore, setErrore] = useState("");
  const [inviata, setInviata] = useState(false);

  function invia() {
    if (nome.trim() === "" || citta.trim() === "") {
      setErrore("Servono almeno nome e città");
      return;
    }
    setErrore("");
    setInviata(true);
  }

  if (inviata) {
    return (
      <section className="fascia" id="candidati">
        <div className="dentro">
          <Pila occhiello="RICEVUTA" righe={["CI SENTIAMO", "PRESTO"]} />
          <p style={{ margin: "1.6rem 0 0" }}>Luca ti scrive su WhatsApp.</p>
          <p className="debole" style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
            Questa è un&apos;anteprima: la candidatura non viene salvata da nessuna parte.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="fascia" id="candidati">
      <div className="dentro">
        <Pila occhiello="SEI INTERESSATO/A?" righe={["CANDIDATI"]} />

        <div style={{ marginTop: "2rem", display: "grid", gap: "1.4rem" }}>
          <div>
            <span style={etichetta}>NOME E COGNOME</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)} style={campo} />
          </div>
          <div>
            <span style={etichetta}>ETÀ</span>
            <input value={eta} onChange={(e) => setEta(e.target.value)} style={campo} inputMode="numeric" />
          </div>
          <div>
            <span style={etichetta}>CITTÀ</span>
            <input value={citta} onChange={(e) => setCitta(e.target.value)} style={campo} />
          </div>
          <div>
            <span style={etichetta}>INSTAGRAM</span>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} style={campo} placeholder="@" />
          </div>

          {errore !== "" && <p style={{ color: "#FFB4C4", margin: 0 }}>{errore}</p>}

          <button onClick={invia} className="bottone" style={{ width: "100%" }}>
            Invia la candidatura
          </button>

          <p className="debole" style={{ margin: 0, fontSize: "0.875rem" }}>
            La candidatura arriva a Luca su WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
