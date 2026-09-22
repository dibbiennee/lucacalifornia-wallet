import Link from "next/link";
import type { CSSProperties } from "react";

/** Indice dell'anteprima: i tre pezzi del giro, in ordine. */

const scheda: CSSProperties = {
  display: "block",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "1rem",
  padding: "1.2rem 1.3rem",
  marginBottom: "0.9rem",
  background: "rgba(0,0,0,0.22)",
  textDecoration: "none",
  color: "inherit",
};

const passo: CSSProperties = {
  display: "block",
  fontSize: "0.6875rem",
  letterSpacing: "0.16em",
  color: "var(--etichetta)",
  margin: "0 0 0.4rem",
};

const titolo: CSSProperties = { margin: "0 0 0.3rem", fontSize: "1.25rem", fontWeight: 700 };
const sotto: CSSProperties = { margin: 0, fontSize: "0.9375rem", lineHeight: 1.5, color: "var(--etichetta)" };

export default function Home() {
  return (
    <main style={{ maxWidth: "34rem", margin: "0 auto", padding: "3.5rem 1.5rem 5rem" }}>
      <p style={{ fontSize: "0.6875rem", letterSpacing: "0.22em", color: "var(--etichetta)", margin: "0 0 0.75rem" }}>
        LUCA CALIFORNIA
      </p>
      <h1 style={{ fontSize: "2rem", lineHeight: 1.15, margin: "0 0 1rem" }}>
        Il biglietto
        <br />
        nel telefono
      </h1>
      <p style={{ lineHeight: 1.6, color: "var(--etichetta)", margin: "0 0 2.25rem" }}>
        Anteprima del giro completo,
        <br />
        dalla conferma fino alla porta.
      </p>

      <Link href="/pannello" style={scheda}>
        <span style={passo}>PRIMO PASSO</span>
        <p style={titolo}>Conferma una prenotazione</p>
        <p style={sotto}>Quello che fai tu: scegli serata e tipo, e ti esce il messaggio WhatsApp già scritto.</p>
      </Link>

      <Link href="/wallet-test" style={scheda}>
        <span style={passo}>SECONDO PASSO</span>
        <p style={titolo}>Il biglietto del cliente</p>
        <p style={sotto}>Quello che riceve lui: si apre da Safari e si aggiunge al Wallet in un tocco.</p>
      </Link>

      <Link href="/staff/scan" style={scheda}>
        <span style={passo}>TERZO PASSO</span>
        <p style={titolo}>La porta</p>
        <p style={sotto}>Quello che usa chi sta all&apos;ingresso: inquadri il QR e sai subito se passa.</p>
      </Link>

      <p style={{ margin: "2rem 0 0", fontSize: "0.875rem", lineHeight: 1.6, color: "var(--etichetta)" }}>
        Il biglietto si aggiunge al telefono solo da Safari su iPhone.
        <br />
        Da computer il file si scarica e basta.
      </p>
    </main>
  );
}
