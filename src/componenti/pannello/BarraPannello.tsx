"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import stili from "./BarraPannello.module.css";

/**
 * Le tre schermate, sempre a portata di pollice.
 *
 * Erano cinque, con "Oggi" davanti e "Porta" in fondo. Il pannello serve
 * prima di tutto a ricevere e confermare le richieste, quindi ora si apre
 * lì; i numeri di "Oggi" sono passati a "Stasera", poi diventata
 * "Riepilogo" quando le prenotazioni hanno iniziato ad avere una data vera,
 * anche lontana. "Serate" è uscita perché erano solo interruttori finti, su
 * dati che non toccavano il sito davvero; la porta è uscita dalla barra
 * perché forse non verrà mai usata.
 */
const VOCI = [
  { testo: "Richieste", dove: "/pannello/richieste" },
  { testo: "Riepilogo", dove: "/pannello/riepilogo" },
  { testo: "Squadra", dove: "/pannello/squadra" },
] as const;

export function BarraPannello({ nuove }: { readonly nuove: number }) {
  const percorso = usePathname();

  return (
    <nav className={stili.barra} aria-label="Schermate del pannello">
      <ul>
        {VOCI.map((voce) => {
          const qui = percorso.startsWith(voce.dove);

          return (
            <li key={voce.dove}>
              <Link
                href={voce.dove}
                className={stili.voce}
                aria-current={qui ? "page" : undefined}
              >
                {voce.testo}
                {voce.dove === "/pannello/richieste" && nuove > 0 && (
                  <span className={stili.badge}>
                    {nuove}
                    <span className="sr"> richieste nuove</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
