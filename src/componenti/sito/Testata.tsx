"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

import { MENU } from "@/contenuti/sito";

import { Bottone, BottoneAzione } from "./Bottone";
import { Marchio } from "./Marchio";
import { Menu } from "./Menu";
import stili from "./Testata.module.css";

/**
 * La testata, appiccicata in alto.
 *
 * Su telefono ci sono il marchio e il pulsante Menu; da 960 px in su le voci
 * stanno in fila e al posto del Menu compare l'invito a prenotare, che è la
 * cosa che porta soldi e sullo schermo largo ci sta.
 */
export function Testata() {
  const [aperto, setAperto] = useState(false);
  const percorso = usePathname();

  // Stabile, perché il menu la usa dentro un effetto.
  const chiudi = useCallback(() => setAperto(false), []);

  return (
    <>
      <header className={stili.top}>
        <div className={`wrap ${stili.riga}`}>
          <Link href="/" className={stili.marchio} aria-label="Luca California, home">
            <Marchio />
            <span>
              LUCA
              <br />
              CALIFORNIA
            </span>
          </Link>

          <nav className={stili.voci} aria-label="Principale">
            {MENU.map((voce) => (
              <Link
                key={voce.dove}
                href={voce.dove}
                aria-current={percorso === voce.dove || percorso.startsWith(`${voce.dove}/`) ? "page" : undefined}
              >
                {voce.testo}
              </Link>
            ))}
          </nav>

          <div className={stili.azioni}>
            {/* Su telefono non ci sta: al suo posto c'è il Menu. */}
            <Bottone href="/prenota?tipo=tavolo" stretto classe={stili["prenota-largo"]}>
              Prenota il tuo ingresso
            </Bottone>

            <BottoneAzione
              aspetto="contorno"
              stretto
              onClick={() => setAperto(true)}
              aria-expanded={aperto}
              classe={stili.apri}
            >
              Menu
            </BottoneAzione>
          </div>
        </div>
      </header>

      <Menu aperto={aperto} chiudi={chiudi} />
    </>
  );
}
