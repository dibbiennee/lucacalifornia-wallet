"use client";

import { useId, useState } from "react";

import type { RichiestaPannello } from "@/lib/pannello/dati";
import { dettaglioTavolo } from "@/lib/pannello/testi";

import { Campo } from "./Campo";
import { CardRichiesta } from "./CardRichiesta";
import { Vuoto } from "./Messaggi";

/**
 * Chi è confermato per la serata, con la ricerca per nome.
 *
 * Il filtro è qui nel browser e non nell'indirizzo: alla porta si scrive una
 * lettera per volta con una mano sola, e a ogni lettera la pagina non deve
 * ricaricarsi né portare via il fuoco dalla tastiera.
 */
export function ElencoStasera({
  confermati,
}: {
  readonly confermati: readonly RichiestaPannello[];
}) {
  const id = useId();
  const [cerca, setCerca] = useState("");

  const q = cerca.trim().toLowerCase();
  const trovati = q === "" ? confermati : confermati.filter((r) => r.nome.toLowerCase().includes(q));
  const tavoli = trovati.filter((r) => r.tipo === "tavolo");
  const lista = trovati.filter((r) => r.tipo === "lista");

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

      {trovati.length === 0 ? (
        <Vuoto>
          {q === ""
            ? "Ancora nessuno confermato per questa serata."
            : `Nessuno con “${cerca}” per stasera.`}
        </Vuoto>
      ) : (
        <>
          {tavoli.length > 0 && (
            <section className="sezione" aria-labelledby={`${id}-tavoli`}>
              <h2 className="titolo-sezione" id={`${id}-tavoli`}>
                Tavoli, {tavoli.length}
              </h2>
              <div className="lista">
                {tavoli.map((r) => (
                  <CardRichiesta
                    key={r.id}
                    dove={`/pannello/richieste/${r.id}?da=stasera`}
                    nome={r.nome}
                    destra={r.sala?.toLowerCase()}
                    riassunto={dettaglioTavolo(r)}
                  />
                ))}
              </div>
            </section>
          )}

          {lista.length > 0 && (
            <section className="sezione" aria-labelledby={`${id}-lista`}>
              <h2 className="titolo-sezione" id={`${id}-lista`}>
                Lista, {lista.length}
              </h2>
              <div className="lista">
                {lista.map((r) => (
                  <CardRichiesta
                    key={r.id}
                    dove={`/pannello/richieste/${r.id}?da=stasera`}
                    nome={r.nome}
                    destra={r.sala?.toLowerCase()}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
