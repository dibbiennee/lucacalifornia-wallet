import { RiepilogoVista } from "@/componenti/lc/RiepilogoVista";
import { richieste, squadra } from "@/lib/pannello/dati";
import { daRichiesta, iniziali, perData, statistiche } from "@/lib/pannello/vista";

export const metadata = { title: "Riepilogo, pannello Luca California" };

const GIORNO_ROMA = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });

/**
 * Il riepilogo: numeri, grafici per serata e per tipo, classifica dei PR e le
 * prenotazioni confermate divise per data. Sono dati veri, dal database.
 *
 * "Oggi" si decide qui, sul server, e si passa già pronto: chi dovesse
 * deciderlo nel browser potrebbe avere un'altra data da quella del server, e
 * la pagina si disegnerebbe in due modi diversi.
 */
export default async function Riepilogo() {
  const adesso = new Date();
  const voci = (await richieste()).map((r) => daRichiesta(r, adesso));
  const confermate = voci.filter((v) => v.stato === "confermata");
  const pr = [...(await squadra())].sort((a, b) => b.confermate - a.confermate);

  return (
    <RiepilogoVista
      stat={statistiche(voci)}
      classifica={pr.map((p) => ({ nome: p.nome, iniziali: iniziali(p.nome), confermate: p.confermate }))}
      gruppiData={perData(confermate, GIORNO_ROMA.format(adesso))}
    />
  );
}
