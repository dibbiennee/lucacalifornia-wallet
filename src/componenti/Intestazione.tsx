import Image from "next/image";
import Link from "next/link";

import { MENU } from "@/contenuti/sito";

/**
 * Intestazione.
 *
 * Su telefono il menu sta dentro "MENU" e si apre al tocco; su schermi larghi
 * le voci sono tutte in fila, come nel mockup desktop approvato. Il passaggio
 * lo fa il CSS: le voci sono scritte una volta sola nell'HTML.
 */
export function Intestazione() {
  return (
    <header className="testata">
      <Link href="/" className="testata-marchio">
        <Image
          src="/loghi/marchio-orizzontale.png"
          alt="Luca California"
          width={667}
          height={310}
          priority
          style={{ width: "auto", height: "1.85rem", objectFit: "contain" }}
        />
      </Link>

      <nav className="menu-largo">
        {MENU.map((voce) => (
          <Link key={voce.dove} href={voce.dove} className="menu-voce">
            {voce.testo}
          </Link>
        ))}
        <a href="/#prenota" className="menu-prenota">
          Prenota
        </a>
      </nav>

      <nav className="menu-stretto">
        <details>
          <summary>MENU</summary>
          <ul>
            {MENU.map((voce) => (
              <li key={voce.dove}>
                <Link href={voce.dove}>{voce.testo}</Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
