import { SquadraVista } from "@/componenti/lc/SquadraVista";
import { INDIRIZZO } from "@/lib/pubblico";
import { squadra } from "@/lib/pannello/dati";
import { sessioneOAccesso, soloOwnerOAltrove } from "@/lib/pannello/sessione";
import { iniziali } from "@/lib/pannello/vista";

export const metadata = { title: "Squadra, pannello Luca California" };

/**
 * I PR in classifica per richieste confermate, col loro link personale.
 * Sono dati veri: le richieste arrivate da ciascun link (vedi squadra() in
 * dati.ts). I "compleanni in arrivo" che stavano qui erano di esempio e non
 * fanno parte del nuovo disegno.
 */
export default async function Squadra() {
  await soloOwnerOAltrove();
  const pr = [...(await squadra(await sessioneOAccesso()))].sort((a, b) => b.confermate - a.confermate);

  return (
    <SquadraVista
      indirizzo={INDIRIZZO}
      membri={pr.map((p) => ({
        id: p.id,
        attivo: p.attivo,
        link: p.link,
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
