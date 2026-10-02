import { notFound } from "next/navigation";

import { DettaglioRichiesta, type DatiInvio } from "@/componenti/lc/DettaglioRichiesta";
import { richiesta } from "@/lib/pannello/dati";
import { tipoBiglietto } from "@/lib/pannello/testi";
import { daRichiesta } from "@/lib/pannello/vista";
import { giornoDellaSerata, istanteSerata, prossimaSerata } from "@/lib/serate";

export const metadata = { title: "Richiesta, pannello Luca California" };

/**
 * Una richiesta, con tutto quello che serve a rispondere.
 *
 * Il ritorno indietro sa da dove sei arrivato: dall'elenco filtrato torna a
 * quel filtro. Quello che serve a preparare il biglietto si calcola qui, sul
 * server, dove l'orologio di Roma è lo stesso per tutti.
 */
export default async function Dettaglio({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stato?: string }>;
}) {
  const { id } = await params;
  const { stato } = await searchParams;
  const r = await richiesta(id);

  if (r === undefined) {
    notFound();
  }

  /*
   * La data vera scelta nel modulo, ora di Roma. Solo le richieste di prima
   * che il modulo la chiedesse non ce l'hanno: per quelle resta "la prossima
   * volta che cade quella serata", come sempre.
   */
  const inizio =
    r.dataSerata === undefined ? prossimaSerata(giornoDellaSerata(r.codiceSerata)) : istanteSerata(r.dataSerata);

  const invio: DatiInvio = {
    nomeCliente: r.nome,
    telefono: r.telefono,
    /* Il nome della serata, non il giorno: il messaggio diceva "sei dentro per SABATO di sabato 27 settembre". */
    serata: r.nomeSerata,
    inizioSerata: inizio.toISOString(),
    tipo: tipoBiglietto(r),
    locale: r.codiceSerata === "ninfeo" ? "ninfeo" : "room26",
    ...(r.sala === undefined ? {} : { sala: r.sala }),
  };

  const filtro = stato === "nuova" || stato === "confermata" ? stato : undefined;
  const indietro = filtro === undefined ? "/pannello/richieste" : `/pannello/richieste?stato=${filtro}`;

  return <DettaglioRichiesta key={r.id} voce={daRichiesta(r)} invio={invio} indietro={indietro} />;
}
