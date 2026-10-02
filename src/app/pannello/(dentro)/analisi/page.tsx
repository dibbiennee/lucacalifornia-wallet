import Link from "next/link";

import stili from "@/componenti/lc/Traffico.module.css";
import { VistaTraffico } from "@/componenti/lc/VistaTraffico";
import { nomeProvenienza } from "@/contenuti/canali";
import { oggiARoma } from "@/lib/lista-attesa";
import { FORMA_PR } from "@/lib/pannello/filtri-richieste";
import { soloOwnerOAltrove } from "@/lib/pannello/sessione";
import { statisticheTraffico, trafficoPerOrigine, trafficoPerPr, type AmbitoTraffico } from "@/lib/traffico";

export const metadata = { title: "Analisi, pannello Luca California" };

type Parametri = Record<string, string | string[] | undefined>;

function nomeOrigine(origine: string): string {
  return origine === "pr" ? "Link dei PR" : origine === "diretto" ? "Diretto" : nomeProvenienza(origine);
}

/**
 * Le analisi, solo per Luca: il sito intero, le richieste dirette o un singolo PR, a scelta.
 *
 * Il PR da guardare arriva dall'indirizzo (?pr=pr-antonio), ma questa pagina è solo
 * di Luca: un PR che la apre torna alle sue richieste, e i numeri del suo link li
 * vede dalla sua home, calcolati sul suo id preso dalla sessione.
 */
export default async function Analisi({ searchParams }: { searchParams: Promise<Parametri> }) {
  await soloOwnerOAltrove();
  const parametri = await searchParams;
  const grezzo = typeof parametri["pr"] === "string" ? parametri["pr"] : "";
  const scelta = FORMA_PR.test(grezzo) ? grezzo : "";

  const ambito: AmbitoTraffico = scelta === "" ? { tutto: true } : scelta === "diretto" ? { diretto: true } : { prId: scelta };

  const [statistiche, perPr, perOrigine] = await Promise.all([
    statisticheTraffico(ambito, oggiARoma()),
    trafficoPerPr(),
    trafficoPerOrigine(),
  ]);

  const prScelto = perPr.find((p) => p.id === scelta);
  const titolo = scelta === "" ? "Tutto il sito" : scelta === "diretto" ? "Richieste dirette, senza PR" : `PR ${prScelto?.nome ?? scelta}`;

  return (
    <div className={stili.pagina}>
      <section className={`lc-up ${stili.testa}`}>
        <span className="lc-eyebrow">Visite e richieste</span>
        <h1 className="lc-titolo">Analisi</h1>
      </section>

      <nav className={stili.scelta} aria-label="Cosa guardare">
        <Link href="/pannello/analisi" className={`lc-press ${stili.sceltaVoce} ${scelta === "" ? stili.sceltaAttiva : ""}`} aria-current={scelta === "" ? "page" : undefined}>
          Tutto il sito
        </Link>
        <Link
          href="/pannello/analisi?pr=diretto"
          className={`lc-press ${stili.sceltaVoce} ${scelta === "diretto" ? stili.sceltaAttiva : ""}`}
          aria-current={scelta === "diretto" ? "page" : undefined}
        >
          Dirette
        </Link>
        {perPr.map((p) => (
          <Link
            key={p.id}
            href={`/pannello/analisi?pr=${p.id}`}
            className={`lc-press ${stili.sceltaVoce} ${scelta === p.id ? stili.sceltaAttiva : ""}`}
            aria-current={scelta === p.id ? "page" : undefined}
          >
            {p.nome}
            {p.attivo ? "" : " (spento)"}
          </Link>
        ))}
      </nav>

      <VistaTraffico statistiche={statistiche} titolo={titolo} />

      {scelta === "" && (
        <div className={stili.griglia}>
          <section className={stili.blocco} aria-label="Da dove arrivano">
            <h2 className={stili.titolo}>Da dove arrivano</h2>
            {perOrigine.length === 0 ? (
              <p className={stili.nessuno}>Ancora nessuna visita.</p>
            ) : (
              <div className={stili.tabellaScorri}>
                <table className={stili.piccola}>
                  <thead>
                    <tr>
                      <th scope="col">Origine</th>
                      <th scope="col">Visite</th>
                      <th scope="col">Iniziati</th>
                      <th scope="col">Inviati</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perOrigine.map((o) => (
                      <tr key={o.origine}>
                        <th scope="row">{nomeOrigine(o.origine)}</th>
                        <td>{o.visite}</td>
                        <td>{o.iniziati}</td>
                        <td>{o.inviati}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={stili.blocco} aria-label="PR">
            <h2 className={stili.titolo}>PR</h2>
            {perPr.length === 0 ? (
              <p className={stili.nessuno}>Nessun PR ancora.</p>
            ) : (
              <div className={stili.tabellaScorri}>
                <table className={stili.piccola}>
                  <thead>
                    <tr>
                      <th scope="col">PR</th>
                      <th scope="col">Visite</th>
                      <th scope="col">Inviati</th>
                      <th scope="col">Attesa</th>
                      <th scope="col">Conf.</th>
                      <th scope="col">Rif.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perPr.map((p) => (
                      <tr key={p.id} className={p.attivo ? undefined : stili.spento}>
                        <th scope="row">
                          <Link href={`/pannello/analisi?pr=${p.id}`}>{p.nome}</Link>
                        </th>
                        <td>{p.visite}</td>
                        <td>{p.inviati}</td>
                        <td>{p.inAttesa}</td>
                        <td>{p.confermate}</td>
                        <td>{p.rifiutate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
