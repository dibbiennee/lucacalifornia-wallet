import Link from "next/link";

/**
 * La barra fissa in basso.
 *
 * Usa le zone sicure di iOS: senza, su iPhone finisce sotto la barra di
 * Safari e i pulsanti diventano impossibili da premere.
 */
export function BarraFissa() {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1px",
        background: "rgba(255,255,255,0.25)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Link
        href="/#prenota"
        style={{
          background: "#ffffff",
          color: "var(--blu-scuro)",
          textDecoration: "none",
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontSize: "0.875rem",
          padding: "1.05rem 0",
          textAlign: "center",
        }}
      >
        PRENOTA
      </Link>
      <Link
        href="/#prenota"
        style={{
          background: "var(--blu-scuro)",
          color: "var(--testo)",
          textDecoration: "none",
          fontWeight: 700,
          letterSpacing: "0.1em",
          fontSize: "0.875rem",
          padding: "1.05rem 0",
          textAlign: "center",
        }}
      >
        LISTA
      </Link>
    </div>
  );
}
