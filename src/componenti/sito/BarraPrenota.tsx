"use client";

import { usePathname } from "next/navigation";

import { Bottone } from "./Bottone";
import stili from "./BarraPrenota.module.css";

/**
 * La barra in basso: tavolo o lista, senza cercare.
 *
 * I due pulsanti portano a due cose diverse, e l'indirizzo lo dice: chi vuole
 * solo entrare in lista non deve passare davanti alle domande sul budget.
 *
 * Sulla pagina del modulo sparisce: sei già arrivato, e coprirebbe le ultime
 * righe proprio mentre le stai compilando.
 */
export function BarraPrenota() {
  const percorso = usePathname();

  if (percorso === "/prenota") {
    return null;
  }

  return (
    <div className={stili.barra}>
      <Bottone href="/prenota?tipo=tavolo" aspetto="chiaro">
        Prenota
      </Bottone>
      <Bottone href="/prenota?tipo=lista">Lista</Bottone>
    </div>
  );
}
