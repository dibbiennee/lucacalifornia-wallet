import { SquadraVista } from "@/componenti/lc/SquadraVista";
import { squadra } from "@/lib/pannello/dati";
import { iniziali } from "@/lib/pannello/vista";

export const metadata = { title: "Squadra, pannello Luca California" };

/**
 * I PR in classifica per richieste confermate, col loro link personale.
 * Sono dati veri: le richieste arrivate da ciascun link (vedi squadra() in
 * dati.ts). I "compleanni in arrivo" che stavano qui erano di esempio e non
 * fanno parte del nuovo disegno.
 */
export default async function Squadra() {
  const pr = [...(await squadra())].sort((a, b) => b.confermate - a.confermate);

  return (
    <SquadraVista
      membri={pr.map((p) => ({
        nome: p.nome,
        iniziali: iniziali(p.nome),
        codice: p.codice,
        confermate: p.confermate,
        liste: p.liste,
        tavoli: p.tavoli,
        braccialetti: p.braccialetti,
      }))}
    />
  );
}
