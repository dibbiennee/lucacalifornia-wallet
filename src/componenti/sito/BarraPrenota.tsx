import { Bottone } from "./Bottone";
import stili from "./BarraPrenota.module.css";

/**
 * La barra in basso: tavolo o lista, senza cercare.
 *
 * I due pulsanti portano a due cose diverse, e l'indirizzo lo dice: chi vuole
 * solo entrare in lista non deve passare davanti alle domande sul budget.
 */
export function BarraPrenota() {
  return (
    <div className={stili.barra}>
      <Bottone href="/prenota?tipo=tavolo" aspetto="chiaro">
        Prenota
      </Bottone>
      <Bottone href="/prenota?tipo=lista">Lista</Bottone>
    </div>
  );
}
