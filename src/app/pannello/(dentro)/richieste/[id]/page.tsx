import { notFound } from "next/navigation";

import { DettaglioRichiesta } from "@/componenti/lc/DettaglioRichiesta";
import { localeDi } from "@/lib/pannello/biglietto";
import { richiesta } from "@/lib/pannello/dati";
import { sessioneOAccesso } from "@/lib/pannello/sessione";
import { filtriDaParametri, suffissoDaFiltri } from "@/lib/pannello/filtri-richieste";
import { daRichiesta } from "@/lib/pannello/vista";

export const metadata = { title: "Richiesta, pannello Luca California" };

/**
 * Una richiesta, con tutto quello che serve a rispondere.
 *
 * Il ritorno indietro sa da dove sei arrivato: dall'elenco filtrato torna a
 * quel filtro. Per un PR, una richiesta non sua risponde "non trovata", come
 * una che non esiste (vedi richiesta() in dati.ts).
 *
 * Qui non si prepara più niente per il biglietto: ci pensa /api/conferma,
 * partendo dall'id della richiesta e dal database.
 */
export default async function Dettaglio({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const parametri = await searchParams;
  const sessione = await sessioneOAccesso();
  const r = await richiesta(sessione, id);

  if (r === undefined) {
    notFound();
  }

  // Il ritorno conserva i filtri dell'elenco da cui si arriva (stato, serata, data, tipo, ricerca),
  // ripuliti: dall'indirizzo non si rimanda indietro altro che filtri validi.
  const indietro = `/pannello/richieste${suffissoDaFiltri(
    filtriDaParametri((chiave) => (typeof parametri[chiave] === "string" ? (parametri[chiave] as string) : null)),
  )}`;

  return (
    <DettaglioRichiesta
      key={r.id}
      voce={daRichiesta(r)}
      locale={localeDi(r)}
      walletStato={r.walletStato}
      indietro={indietro}
      comeLuca={sessione.ruolo === "owner"}
    />
  );
}
