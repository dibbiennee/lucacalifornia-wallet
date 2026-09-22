import Image from "next/image";
import Link from "next/link";

import { MENU } from "@/contenuti/sito";

/** Intestazione: marchio a sinistra, menu a destra. */
export function Intestazione() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: "1.1rem var(--margine)",
        maxWidth: "var(--larghezza)",
        margin: "0 auto",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/loghi/marchio-orizzontale.png"
          alt="Luca California"
          width={667}
          height={310}
          priority
          style={{ width: "auto", height: "1.85rem", objectFit: "contain" }}
        />
      </Link>

      <nav>
        <details style={{ position: "relative" }}>
          <summary
            style={{
              listStyle: "none",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
              padding: "0.5rem 0",
            }}
          >
            MENU
          </summary>
          <ul
            style={{
              position: "absolute",
              right: 0,
              top: "2.4rem",
              zIndex: 20,
              margin: 0,
              padding: "0.6rem 0",
              minWidth: "11rem",
              listStyle: "none",
              background: "var(--blu-scuro)",
            }}
          >
            {MENU.map((voce) => (
              <li key={voce.dove}>
                <Link
                  href={voce.dove}
                  style={{
                    display: "block",
                    padding: "0.7rem 1.1rem",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {voce.testo}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
