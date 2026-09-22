import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: "34rem",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", lineHeight: 1.3, margin: "0 0 1rem" }}>
        Prova del biglietto Apple Wallet
      </h1>
      <p style={{ lineHeight: 1.6, color: "var(--etichetta)", margin: "0 0 2rem" }}>
        Questo progetto serve solo a provare il biglietto.
        <br />
        Non è il sito di Luca California.
      </p>
      <Link href="/wallet-test" style={{ fontWeight: 600 }}>
        Vai alla pagina di prova
      </Link>
    </main>
  );
}
