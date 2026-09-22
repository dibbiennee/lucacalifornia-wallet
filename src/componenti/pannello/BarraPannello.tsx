"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Le cinque schermate, sempre a portata di pollice. */
const VOCI = [
  { testo: "Oggi", dove: "/pannello" },
  { testo: "Richieste", dove: "/pannello/richieste" },
  { testo: "Porta", dove: "/pannello/porta" },
  { testo: "Serate", dove: "/pannello/serate" },
  { testo: "Squadra", dove: "/pannello/squadra" },
] as const;

export function BarraPannello() {
  const percorso = usePathname();

  return (
    <nav className="pannello-barra" aria-label="Schermate del pannello">
      {VOCI.map((voce) => {
        const qui = voce.dove === "/pannello" ? percorso === voce.dove : percorso.startsWith(voce.dove);

        return (
          <Link
            key={voce.dove}
            href={voce.dove}
            className={`pannello-voce${qui ? " pannello-voce-qui" : ""}`}
            aria-current={qui ? "page" : undefined}
          >
            {voce.testo}
          </Link>
        );
      })}
    </nav>
  );
}
