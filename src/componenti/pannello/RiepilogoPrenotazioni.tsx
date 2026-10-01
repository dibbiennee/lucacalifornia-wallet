"use client";

import { useId, useState } from "react";

import type { RichiestaPannello } from "@/lib/pannello/dati";
import { dettaglioTavolo } from "@/lib/pannello/testi";

import { Campo } from "./Campo";
import { CardRichiesta } from "./CardRichiesta";
import { Vuoto } from "./Messaggi";

const FORMATO_DATA = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" });

function maiuscolaIniziale(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Sabato 12 dicembre", da "2026-12-12". */
function etichettaData(dataIso: string): string {
  const pezzi = dataIso.split("-").map(Number);
  const anno = pezzi[0];
  const mese = pezzi[1];
  const giorno = pezzi[2];
  if (anno === undefined || mese === undefined || giorno === undefined) {
    return dataIso;
  }
  return maiuscolaIniziale(FORMATO_DATA.format(new Date(anno, mese - 1, giorno)));
}

function sottoElenco(righe: readonly RichiestaPannello[], titolo: string, idBase: string) {
  if (righe.length === 0) {
    return null;
  }

  return (
    <div key={titolo}>
      <h3 className="titolo-sezione" id={`${idBase}-${titolo}`}>
        {titolo}, {righe.length}
      </h3>
      <div className="lista">
        {righe.map((r) => {
          const riassunto = r.tipo === "tavolo" ? dettaglioTavolo(r) : r.gruppo?.toLowerCase();

          return (
            <CardRichiesta
              key={r.id}
              dove={`/pannello/richieste/${r.id}?da=riepilogo`}
              nome={r.nome}
              destra={r.sala?.toLowerCase()}
              {...(riassunto === undefined ? {} : { riassunto })}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tutte le prenotazioni confermate, raggruppate per data: non più solo
 * stasera, ma ogni notte che ha già qualcuno dentro, dalla più vicina.
 *
 * Chi non ha una data (le richieste confermate prima che il modulo facesse
 * scegliere un giorno vero) finisce in un gruppo a parte, in fondo: non è
 * sparito, solo non si sa più per quando fosse.
 */
export function RiepilogoPrenotazioni({
  prenotazioni,
}: {
  readonly prenotazioni: readonly RichiestaPannello[];
}) {
  const id = useId();
  const [cerca, setCerca] = useState("");

  const q = cerca.trim().toLowerCase();
  const trovate = q === "" ? prenotazioni : prenotazioni.filter((r) => r.nome.toLowerCase().includes(q));

  const gruppi = new Map<string, RichiestaPannello[]>();
  for (const r of trovate) {
    const chiave = r.dataSerata ?? "";
    const gruppo = gruppi.get(chiave);
    if (gruppo === undefined) {
      gruppi.set(chiave, [r]);
    } else {
      gruppo.push(r);
    }
  }

  // In ordine di calendario, dalla più vicina; "senza data" resta in fondo.
  const date = [...gruppi.keys()].sort((a, b) => {
    if (a === "") {
      return 1;
    }
    if (b === "") {
      return -1;
    }
    return a.localeCompare(b);
  });

  return (
    <>
      <Campo
        id={`${id}-cerca`}
        etichetta="Cerca un nome"
        etichettaNascosta
        type="search"
        placeholder="Cerca un nome"
        autoComplete="off"
        enterKeyHint="search"
        value={cerca}
        onChange={(e) => setCerca(e.target.value)}
      />

      {date.length === 0 ? (
        <Vuoto>{q === "" ? "Ancora nessuna prenotazione confermata." : `Nessuno con “${cerca}”.`}</Vuoto>
      ) : (
        date.map((chiave) => {
          const righe = gruppi.get(chiave) ?? [];
          const idBase = `${id}-${chiave === "" ? "senza-data" : chiave}`;

          return (
            <section key={chiave} className="sezione" aria-labelledby={`${idBase}-titolo`}>
              <h2 id={`${idBase}-titolo`} style={{ fontSize: 18, fontWeight: 800 }}>
                {chiave === "" ? "Senza data" : etichettaData(chiave)}
                <span style={{ color: "var(--muted)", fontWeight: 600 }}> · {righe.length}</span>
              </h2>

              {sottoElenco(righe.filter((r) => r.tipo === "tavolo"), "Tavoli", idBase)}
              {sottoElenco(righe.filter((r) => r.tipo === "braccialetto"), "Bracciali", idBase)}
              {sottoElenco(righe.filter((r) => r.tipo === "lista"), "Lista", idBase)}
            </section>
          );
        })
      )}
    </>
  );
}
