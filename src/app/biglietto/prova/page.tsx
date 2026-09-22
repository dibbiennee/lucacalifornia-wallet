import type { CSSProperties } from "react";

/**
 * Pagina di prova della fase 1.
 *
 * Tutto il contenuto è già nell'HTML che esce dal server: nessun testo
 * viene disegnato dal browser dopo il caricamento.
 */

const pulsante: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.6rem",
  minHeight: "3.25rem",
  padding: "0 1.75rem",
  borderRadius: "999px",
  background: "#000",
  color: "#fff",
  fontSize: "1.0625rem",
  fontWeight: 600,
  letterSpacing: "0.01em",
  textDecoration: "none",
};

const scheda: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "1rem",
  padding: "1.25rem 1.375rem",
  background: "rgba(0,0,0,0.22)",
};

const etichetta: CSSProperties = {
  display: "block",
  fontSize: "0.6875rem",
  letterSpacing: "0.12em",
  color: "var(--etichetta)",
  margin: "0 0 0.2rem",
};

const valore: CSSProperties = {
  margin: "0 0 0.9rem",
  fontSize: "1.0625rem",
  fontWeight: 600,
};

export default function PaginaProvaWallet() {
  return (
    <main style={{ maxWidth: "34rem", margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
      <p
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.22em",
          color: "var(--etichetta)",
          margin: "0 0 0.75rem",
        }}
      >
        LUCA CALIFORNIA
      </p>

      <h1 style={{ fontSize: "2rem", lineHeight: 1.15, margin: "0 0 1rem" }}>
        Il tuo biglietto
        <br />
        è pronto
      </h1>

      <p style={{ lineHeight: 1.6, color: "var(--etichetta)", margin: "0 0 2rem" }}>
        Aggiungilo ad Apple Wallet.
        <br />
        All&apos;ingresso ti basta mostrare il QR.
      </p>

      <div style={scheda}>
        <span style={etichetta}>SERATA</span>
        <p style={valore}>BÁILAME</p>

        <span style={etichetta}>QUANDO</span>
        <p style={valore}>
          Domenica 27 settembre 2026
          <br />
          ore 23:30
        </p>

        <span style={etichetta}>TIPO</span>
        <p style={valore}>TAVOLO, MISTO</p>

        <span style={etichetta}>NOME</span>
        <p style={valore}>Mario Rossi</p>

        <span style={etichetta}>DOVE</span>
        <p style={{ ...valore, marginBottom: 0 }}>Room 26, Roma</p>
      </div>

      <p style={{ margin: "2rem 0 0" }}>
        <a href="/api/pass/demo" style={pulsante}>
          Aggiungi a Apple Wallet
        </a>
      </p>

      <p
        style={{
          margin: "1.5rem 0 0",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          color: "var(--etichetta)",
        }}
      >
        Dall&apos;iPhone apri questa pagina con Safari.
        <br />
        Su computer il file si scarica e basta,
        <br />
        e negli altri browser dell&apos;iPhone non si apre.
      </p>
    </main>
  );
}
