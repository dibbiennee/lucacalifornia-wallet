import { notFound } from "next/navigation";

import { ConfermaEScrivi } from "@/componenti/pannello/ConfermaEScrivi";
import { Etichetta } from "@/componenti/pannello/Etichetta";
import { Testata } from "@/componenti/pannello/Testata";
import { richiesta } from "@/lib/pannello/dati";
import { serataSala, tipoEsteso } from "@/lib/pannello/testi";

import stili from "./dettaglio.module.css";

/**
 * Una richiesta, con tutto quello che serve a rispondere.
 *
 * Il ritorno indietro sa da dove sei arrivato: dall'elenco filtrato torna a
 * quel filtro, da Stasera torna a Stasera. Prima non c'era proprio, e si
 * usciva solo col gesto del browser.
 */
export default async function Dettaglio({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ stato?: string; da?: string }>;
}) {
  const { id } = await params;
  const { stato, da } = await searchParams;
  const r = richiesta(id);

  if (r === undefined) {
    notFound();
  }

  const indietro =
    da === "stasera"
      ? { testo: "Stasera", dove: "/pannello/stasera" }
      : {
          testo: "Richieste",
          dove:
            stato === undefined || stato === ""
              ? "/pannello/richieste"
              : `/pannello/richieste?stato=${stato}`,
        };

  const voci: readonly (readonly [string, string])[] = [
    ["Serata", serataSala(r)],
    ["Tipo", tipoEsteso(r)],
    ...(r.budget === undefined ? [] : [["Budget a testa", r.budget] as const]),
    ...(r.occasione === undefined ? [] : [["Occasione", r.occasione] as const]),
  ];

  return (
    <main className="pagina">
      <Testata
        occhiello={`Richiesta, oggi ${r.quando}`}
        titolo={r.nome}
        indietro={indietro}
      />

      <Etichetta stato={r.stato} />

      <a className={stili.telefono} href={`tel:${r.telefono.replace(/\s/g, "")}`}>
        {r.telefono}
      </a>

      <dl className={stili.voci}>
        {voci.map(([voce, valore]) => (
          <div key={voce}>
            <dt>{voce}</dt>
            <dd>{valore}</dd>
          </div>
        ))}
      </dl>

      {r.messaggio !== undefined && <p className={stili.citazione}>{`“${r.messaggio}”`}</p>}

      <ConfermaEScrivi r={r} />

      {r.notePrivate !== undefined && (
        <section className="sezione" aria-labelledby="note-private">
          <h2 className="titolo-sezione" id="note-private">
            Note private, solo tu
          </h2>
          <p className={`${stili.citazione} ${stili["nota-privata"]}`}>{r.notePrivate}</p>
        </section>
      )}
    </main>
  );
}
