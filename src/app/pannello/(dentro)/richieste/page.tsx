import stili from "@/componenti/lc/Richieste.module.css";

export const metadata = { title: "Richieste, pannello Luca California" };

/**
 * L'indice delle richieste. L'elenco sta nel layout: qui resta solo quello
 * che si vede nel pannello accanto, quando non ce n'è una aperta. Sul
 * telefono quel pannello non c'è, e questa pagina non si vede.
 */
export default function Richieste() {
  return (
    <div className={stili.segnaposto}>
      <span className={stili.segnapostoTitolo}>Scegli una richiesta</span>
      <span className={stili.segnapostoTesto}>Il dettaglio compare qui, con il biglietto e le azioni.</span>
    </div>
  );
}
