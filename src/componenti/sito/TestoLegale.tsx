import type { ReactNode } from "react";

import { EMAIL_PRIVACY, SEGNO_EMAIL, type Sezione } from "@/contenuti/legale";
import { legaParole } from "@/lib/tipografia";

import { Titolo2 } from "./Pagina";
import stili from "./TestoLegale.module.css";

/** Una frase, con le parole brevi legate e l'email trasformata in un link che apre la posta. */
function frase(testo: string): ReactNode {
  const pezzi = testo.split(SEGNO_EMAIL);

  return pezzi.flatMap((pezzo, i): ReactNode[] => {
    const ultimo = i === pezzi.length - 1;
    // Lo spazio prima dell'email diventa indivisibile: "scrivi a" non resta solo a fine riga.
    const legato = legaParole(ultimo ? pezzo : pezzo.replace(/ $/, " "), { vedova: ultimo });

    return i === pezzi.length - 1
      ? [legato]
      : [legato, <a key={`e${i}`} href={`mailto:${EMAIL_PRIVACY}`}>{EMAIL_PRIVACY}</a>];
  });
}

/**
 * Il testo di una pagina legale (privacy, cookie): sezioni con un titolo,
 * qualche paragrafo e, dove serve, un elenco. Una colonna sola, larga quanto
 * basta a leggere senza perdere la riga.
 */
export function TestoLegale({ sezioni }: { readonly sezioni: readonly Sezione[] }) {
  return (
    <section className="wrap">
      <div className={stili.colonna}>
        {sezioni.map((s) => (
          <div key={s.id} className={stili.sezione}>
            <Titolo2 id={s.id} misura="clamp(22px, 6vw, 30px)">
              {s.titolo}
            </Titolo2>

            {s.elenco !== undefined && (
              <ul className={stili.elenco}>
                {s.elenco.map((v) => (
                  <li key={v.titolo ?? v.testo}>
                    {v.titolo !== undefined && <strong>{legaParole(v.titolo, { vedova: false })}</strong>}
                    <span>{frase(v.testo)}</span>
                  </li>
                ))}
              </ul>
            )}

            {s.paragrafi?.map((p) => (
              <p key={p} className={stili.paragrafo}>
                {frase(p)}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
