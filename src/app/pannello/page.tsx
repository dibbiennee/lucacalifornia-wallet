"use client";

import { useState, type CSSProperties } from "react";

import { SERATE, dataInLettere, prossimaOccorrenza } from "@/lib/serate";

/**
 * Il gesto della conferma, come lo farà Luca dal telefono.
 *
 * Non salva niente: serve a far vedere il giro, non a gestire una serata.
 * Tutte le scelte sono bottoni e non menu a tendina, come chiede il brief
 * del sito: di notte, con una mano sola, un bottone si prende sempre.
 */

const COMPOSIZIONI = ["SOLO RAGAZZI", "SOLO RAGAZZE", "MISTO"] as const;

function perInput(data: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}`;
}

const etichetta: CSSProperties = {
  display: "block",
  fontSize: "0.6875rem",
  letterSpacing: "0.14em",
  color: "var(--etichetta)",
  margin: "0 0 0.55rem",
};

const campo: CSSProperties = {
  width: "100%",
  minHeight: "3rem",
  padding: "0 0.9rem",
  borderRadius: "0.7rem",
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(0,0,0,0.25)",
  color: "#fff",
  fontSize: "1rem",
  fontFamily: "inherit",
};

const gruppo: CSSProperties = { margin: "0 0 1.6rem" };

function bottone(scelto: boolean): CSSProperties {
  return {
    minHeight: "2.9rem",
    padding: "0 1rem",
    borderRadius: "999px",
    border: scelto ? "1px solid #fff" : "1px solid rgba(255,255,255,0.28)",
    background: scelto ? "#fff" : "transparent",
    color: scelto ? "#140C5C" : "#fff",
    fontSize: "0.9375rem",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
  };
}

export default function Pannello() {
  const [serata, setSerata] = useState(SERATE[3]!);
  const [quando, setQuando] = useState(() => perInput(prossimaOccorrenza(SERATE[3]!.giorno)));
  const [sala, setSala] = useState("");
  const [tavolo, setTavolo] = useState(false);
  const [composizione, setComposizione] = useState<string>(COMPOSIZIONI[2]);
  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [fatto, setFatto] = useState<{ linkWhatsapp: string; linkBiglietto: string; messaggio: string } | null>(null);

  function cambiaSerata(codice: string) {
    const s = SERATE.find((x) => x.codice === codice)!;
    setSerata(s);
    setQuando(perInput(prossimaOccorrenza(s.giorno)));
    setSala("");
  }

  async function conferma() {
    setErrore("");
    setInCorso(true);

    try {
      const risposta = await fetch("/api/conferma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: nome,
          telefono,
          serata: serata.nome,
          inizioSerata: new Date(quando).toISOString(),
          tipo: tavolo ? `TAVOLO, ${composizione}` : "LISTA",
          locale: "room26",
          ...(sala !== "" ? { sala } : {}),
        }),
      });

      const dati: unknown = await risposta.json();

      if (!risposta.ok) {
        const d = dati as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      setFatto(dati as { linkWhatsapp: string; linkBiglietto: string; messaggio: string });
    } catch {
      setErrore("Non sono riuscito a parlare col server");
    } finally {
      setInCorso(false);
    }
  }

  if (fatto !== null) {
    return (
      <main style={{ maxWidth: "34rem", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
        <h1 style={{ fontSize: "1.75rem", lineHeight: 1.2, margin: "0 0 1.5rem" }}>
          Confermato.
          <br />
          Ora scrivigli.
        </h1>

        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "1rem",
            padding: "1.1rem",
            background: "rgba(0,0,0,0.25)",
            font: "inherit",
            fontSize: "0.9375rem",
            lineHeight: 1.6,
            margin: "0 0 1.75rem",
          }}
        >
          {fatto.messaggio}
        </pre>

        <a
          href={fatto.linkWhatsapp}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "3.25rem",
            borderRadius: "999px",
            background: "#25D366",
            color: "#04250f",
            fontWeight: 700,
            fontSize: "1.0625rem",
            textDecoration: "none",
            marginBottom: "0.9rem",
          }}
        >
          Apri WhatsApp col messaggio pronto
        </a>

        <a
          href={fatto.linkBiglietto}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "3.25rem",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.35)",
            color: "#fff",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Guarda il biglietto
        </a>

        <p style={{ margin: "1.75rem 0 0" }}>
          <button onClick={() => setFatto(null)} style={{ ...bottone(false), width: "100%" }}>
            Confermane un altro
          </button>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "34rem", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>
      <p style={{ fontSize: "0.6875rem", letterSpacing: "0.22em", color: "var(--etichetta)", margin: "0 0 0.7rem" }}>
        PANNELLO
      </p>
      <h1 style={{ fontSize: "2rem", lineHeight: 1.15, margin: "0 0 2.25rem" }}>
        Conferma
        <br />
        una prenotazione
      </h1>

      <div style={gruppo}>
        <span style={etichetta}>SERATA</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          {SERATE.map((s) => (
            <button key={s.codice} onClick={() => cambiaSerata(s.codice)} style={bottone(s.codice === serata.codice)}>
              {s.nome}
            </button>
          ))}
        </div>
        <p style={{ margin: "0.7rem 0 0", fontSize: "0.875rem", color: "var(--etichetta)" }}>
          {serata.musica}, {dataInLettere(new Date(quando))}
        </p>
      </div>

      <div style={gruppo}>
        <span style={etichetta}>QUANDO</span>
        <input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} style={campo} />
      </div>

      {serata.sale.length > 0 && (
        <div style={gruppo}>
          <span style={etichetta}>SALA</span>
          <div style={{ display: "grid", gap: "0.6rem" }}>
            {serata.sale.map((s) => (
              <button key={s} onClick={() => setSala(sala === s ? "" : s)} style={bottone(sala === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={gruppo}>
        <span style={etichetta}>TIPO</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
          <button onClick={() => setTavolo(false)} style={bottone(!tavolo)}>
            LISTA
          </button>
          <button onClick={() => setTavolo(true)} style={bottone(tavolo)}>
            TAVOLO
          </button>
        </div>
        {tavolo && (
          <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.6rem" }}>
            {COMPOSIZIONI.map((c) => (
              <button key={c} onClick={() => setComposizione(c)} style={bottone(composizione === c)}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={gruppo}>
        <span style={etichetta}>NOME E COGNOME</span>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Giulia Bianchi" style={campo} />
      </div>

      <div style={gruppo}>
        <span style={etichetta}>TELEFONO</span>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="334 854 8735"
          inputMode="tel"
          style={campo}
        />
      </div>

      {errore !== "" && (
        <p style={{ color: "#FFB4C4", margin: "0 0 1.2rem", fontSize: "0.9375rem" }}>{errore}</p>
      )}

      <button
        onClick={() => void conferma()}
        disabled={inCorso}
        style={{
          width: "100%",
          minHeight: "3.4rem",
          borderRadius: "999px",
          border: "none",
          background: "#fff",
          color: "#140C5C",
          fontSize: "1.0625rem",
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          opacity: inCorso ? 0.6 : 1,
        }}
      >
        {inCorso ? "Un attimo..." : "Conferma e scrivi"}
      </button>
    </main>
  );
}
