import { notFound } from "next/navigation";

import { ConfermaEScrivi } from "@/componenti/pannello/ConfermaEScrivi";
import { richiesta } from "@/lib/pannello/dati";

export default async function Dettaglio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = richiesta(id);

  if (r === undefined) {
    notFound();
  }

  const righe = [
    ["Serata", [r.serata, r.sala].filter(Boolean).join(", ")],
    ["Tipo", r.tipo === "tavolo" ? `Tavolo, ${r.gruppo?.toLowerCase() ?? ""}` : "Lista"],
    ...(r.budget === undefined ? [] : [["Budget a testa", r.budget]]),
    ...(r.occasione === undefined ? [] : [["Occasione", r.occasione]]),
  ] as const;

  return (
    <main className="pannello-pagina">
      <p className="pannello-occhiello">RICHIESTA · OGGI {r.quando}</p>
      <h1 className="pannello-titolo">{r.nome}</h1>

      <p style={{ margin: "0.8rem 0 1.6rem" }}>
        <a href={`tel:${r.telefono.replace(/\s/g, "")}`} className="tocco" style={{ fontWeight: 600 }}>
          {r.telefono}
        </a>
      </p>

      <dl style={{ margin: 0, display: "grid", gap: "1rem" }}>
        {righe.map(([voce, valore]) => (
          <div key={voce}>
            <dt className="etichetta-campo" style={{ margin: 0 }}>
              {voce}
            </dt>
            <dd style={{ margin: "0.2rem 0 0", fontWeight: 700 }}>{valore}</dd>
          </div>
        ))}
      </dl>

      {r.messaggio !== undefined && (
        <p className="pannello-riquadro" style={{ marginTop: "1.4rem", fontStyle: "italic" }}>
          “{r.messaggio}”
        </p>
      )}

      <ConfermaEScrivi
        nome={r.nome}
        telefono={r.telefono}
        serata={r.serata}
        tipo={r.tipo === "tavolo" ? `TAVOLO, ${(r.gruppo ?? "").toUpperCase()}` : "LISTA"}
        {...(r.sala === undefined ? {} : { sala: r.sala })}
        giaConfermata={r.stato === "confermata"}
        {...(r.bigliettoInviatoAlle === undefined ? {} : { inviatoAlle: r.bigliettoInviatoAlle })}
      />

      {r.notePrivate !== undefined && (
        <section style={{ marginTop: "2rem" }}>
          <h2 className="etichetta-campo">
            Note private <span className="debole">· solo tu</span>
          </h2>
          <p className="pannello-riquadro" style={{ margin: 0 }}>
            {r.notePrivate}
          </p>
        </section>
      )}
    </main>
  );
}
