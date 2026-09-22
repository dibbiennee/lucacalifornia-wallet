"use client";

import { usePathname } from "next/navigation";

/**
 * La barra fissa in basso, su telefono.
 *
 * I due pulsanti aprono due cose diverse: LISTA apre il modulo con la lista
 * già scelta, PRENOTA con il tavolo. Prima portavano tutti e due allo stesso
 * punto, e chi voleva solo entrare in lista si trovava davanti le domande
 * sul budget.
 *
 * Sono <a> normali e non Link: il modulo legge il tipo dall'indirizzo una
 * volta sola, all'apertura, e con la navigazione senza ricarica non se ne
 * accorgerebbe.
 *
 * Le regole stanno nel CSS e non in linea: uno stile scritto in linea batte
 * il foglio di stile, e la barra non spariva più sul computer.
 */

/** Le pagine che hanno il modulo: sulle altre si torna alla home. */
const CON_MODULO = ["/", "/serate", "/navetta", "/capodanno"];

export function BarraFissa() {
  const percorso = usePathname();
  const qui =
    CON_MODULO.includes(percorso) || percorso.startsWith("/serate/") ? percorso : "/";

  return (
    <div className="barra-fissa">
      <a href={`${qui}?tipo=tavolo#prenota`} className="barra-pieno">
        PRENOTA
      </a>
      <a href={`${qui}?tipo=lista#prenota`} className="barra-vuoto">
        LISTA
      </a>
    </div>
  );
}
