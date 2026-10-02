"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { impostaDataEvento } from "@/app/pannello/azioni";
import { legaParole } from "@/lib/tipografia";

import stili from "./Attesa.module.css";
import { useToast } from "./Toast";

interface Riga {
  readonly codice: string;
  readonly nome: string;
  readonly dataIso: string | null;
}

/**
 * Le date degli eventi speciali, solo per Luca.
 *
 * Special guest, Halloween, Capodanno e le due estati non hanno una data
 * finché non la decide lui: qui la imposta (o la toglie). Da quel momento chi
 * è in lista per quell'evento ha quella data, e la lista si può filtrare per
 * data. Non c'è nessuna data di partenza: se non l'ha scelta, non c'è.
 */
export function DateEventi({ eventi }: { readonly eventi: readonly Riga[] }) {
  return (
    <section className={stili.scheda} aria-labelledby="titolo-date">
      <h2 id="titolo-date" className={stili.titoloScheda}>
        Date degli eventi speciali
      </h2>
      <p className={stili.testoScheda}>
        {legaParole("Finché non ne imposti una, l'evento resta senza data. Appena la metti, la ereditano tutte le persone già in lista.", {
          vedova: true,
        })}
      </p>
      <ul className={stili.elencoDate}>
        {eventi.map((e) => (
          <RigaData key={e.codice} evento={e} />
        ))}
      </ul>
    </section>
  );
}

function RigaData({ evento }: { readonly evento: Riga }) {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState(evento.dataIso ?? "");
  const [lavoro, setLavoro] = useState(false);
  const cambiata = data !== (evento.dataIso ?? "");

  async function salva() {
    if (lavoro) {
      return;
    }

    setLavoro(true);

    try {
      const esito = await impostaDataEvento(evento.codice, data);
      toast(esito.messaggio);
      router.refresh();
    } catch {
      toast("Non sono riuscito a salvare la data");
    } finally {
      setLavoro(false);
    }
  }

  return (
    <li className={stili.rigaData}>
      <label htmlFor={`data-${evento.codice}`} className={stili.nomeData}>
        {evento.nome}
      </label>
      <input
        id={`data-${evento.codice}`}
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className={stili.campoData}
      />
      <button type="button" className={`lc-press ${stili.azione}`} disabled={lavoro || !cambiata} onClick={() => void salva()}>
        Salva
      </button>
    </li>
  );
}
