import Link from "next/link";

import {
  EVENTI_CON_LISTA,
  eEventoConLista,
  NOME_NOTTE,
  NOME_SPECIALE,
  NOTTI,
  normalizzaContatto,
  testoDaChiave,
  type ChiaveEvento,
  type StatoAttesa,
} from "@/lib/lista-attesa";
import type { ConteggioEvento, EventoSpecialeConData, RisultatoAttesa, VoceAttesa } from "@/lib/pannello/attesa";
import { giornoLungo } from "@/lib/pannello/vista";
import { legaParole } from "@/lib/tipografia";

import { AzioniAttesa } from "./AzioniAttesa";
import { ChipStato } from "./AreaRichieste";
import stili from "./Attesa.module.css";
import { DateEventi } from "./DateEventi";
import { IconaMessaggio, IconaTelefono } from "./Icone";

/** I valori dei filtri così come arrivano dall'indirizzo, per riempire di nuovo il modulo. */
export interface ValoriFiltri {
  readonly evento: string;
  readonly data: string;
  readonly stato: StatoAttesa | "tutti";
  readonly q: string;
  readonly passate: boolean;
}

const ORA = new Intl.DateTimeFormat("it-IT", {
  timeZone: "Europe/Rome",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const TONO: Readonly<Record<StatoAttesa, string>> = { "in attesa": "attesa", avvisata: "ok", chiusa: "off" };

/** "Sabato · International" → "International": il giorno lo dice già la data. */
function nomeBreve(chiave: ChiaveEvento): string {
  if (chiave.categoria === "speciale") {
    return NOME_SPECIALE[chiave.evento];
  }
  return NOME_NOTTE[chiave.notte].split(" · ")[1] ?? NOME_NOTTE[chiave.notte];
}

function titoloGruppo(v: VoceAttesa): string {
  return v.dataIso === null ? `${nomeBreve(v.evento)} · senza data` : `${giornoLungo(v.dataIso)} · ${nomeBreve(v.evento)}`;
}

interface Gruppo {
  readonly chiave: string;
  readonly titolo: string;
  readonly voci: VoceAttesa[];
}

/** Le persone divise per lista (evento e data), nell'ordine in cui le ha date la query. */
function raggruppa(voci: readonly VoceAttesa[]): readonly Gruppo[] {
  const gruppi: Gruppo[] = [];

  for (const v of voci) {
    const chiave = `${testoDaChiave(v.evento)}|${v.dataIso ?? ""}`;
    const esistente = gruppi.find((g) => g.chiave === chiave);

    if (esistente === undefined) {
      gruppi.push({ chiave, titolo: titoloGruppo(v), voci: [v] });
    } else {
      esistente.voci.push(v);
    }
  }

  return gruppi;
}

/**
 * La lista d'attesa, come strumento di lavoro.
 *
 * Risponde a una domanda: "chi aspetta per questo evento?". Per questo i
 * filtri sono in cima e sono di prima classe: evento, data, stato, e una
 * ricerca per nome, telefono o email. Il modulo è un normale invio a un
 * indirizzo (GET) e il filtraggio avviene nel database, non nel browser:
 * funziona anche senza JavaScript, e il risultato è quello della query.
 */
export function ListaAttesaVista({
  risultato,
  valori,
  conteggi,
  speciali,
  proprietario,
}: {
  readonly risultato: RisultatoAttesa;
  readonly valori: ValoriFiltri;
  readonly conteggi: readonly ConteggioEvento[];
  readonly speciali: readonly EventoSpecialeConData[];
  /** Luca vede da quale PR arriva ognuno e imposta le date; un PR no. */
  readonly proprietario: boolean;
}) {
  const gruppi = raggruppa(risultato.voci);
  const inAttesa = (c: ChiaveEvento): number =>
    conteggi.find((x) => testoDaChiave(x.evento) === testoDaChiave(c))?.inAttesa ?? 0;
  const filtriAttivi =
    valori.evento !== "" || valori.data !== "" || valori.q !== "" || valori.stato !== "in attesa" || valori.passate;

  return (
    <div className={stili.pagina}>
      <section className={`lc-up ${stili.testa}`}>
        <span className="lc-eyebrow">
          {risultato.totale} {risultato.totale === 1 ? "persona" : "persone"}
          {valori.stato === "tutti" ? "" : `, ${valori.stato === "in attesa" ? "in attesa" : valori.stato === "avvisata" ? "avvisate" : "chiuse"}`}
        </span>
        <h1 className="lc-titolo">Attesa</h1>
        <p className={stili.sottotitolo}>
          {legaParole(
            proprietario
              ? "Chi aspetta una serata o un evento speciale. Scegli la lista, la data o cerca per nome e telefono."
              : "Chi è arrivato dal tuo link e aspetta una serata o un evento speciale.",
            { vedova: true },
          )}
        </p>
      </section>

      <form method="get" action="/pannello/attesa" className={`lc-up ${stili.filtri}`} style={{ animationDelay: "60ms" }}>
        {/*
          Sul telefono la ricerca per nome sta sempre in vista e il resto dei filtri si apre
          con "Filtri": l'interruttore è una casella nascosta, quindi funziona anche senza
          JavaScript. Dal computer i filtri stanno tutti su una riga e il pulsante non c'è.
          Se ci sono filtri attivi il blocco parte già aperto.
        */}
        <input
          type="checkbox"
          id="f-mostra"
          className={stili.interruttore}
          defaultChecked={filtriAttivi && (valori.evento !== "" || valori.data !== "" || valori.stato !== "in attesa" || valori.passate)}
        />

        <div className={stili.rigaCerca}>
          <div className={`${stili.campo} ${stili.cerca}`}>
            <label htmlFor="f-q">Cerca</label>
            <input
              id="f-q"
              name="q"
              type="search"
              defaultValue={valori.q}
              placeholder="Nome, telefono o email"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={60}
              className={stili.controllo}
            />
          </div>
          <label htmlFor="f-mostra" className={stili.apriFiltri}>
            Filtri
          </label>
        </div>

        <div className={stili.corpoFiltri}>
          <div className={stili.campo}>
            <label htmlFor="f-evento">Evento</label>
            <select id="f-evento" name="evento" defaultValue={valori.evento} className={stili.controllo}>
              <option value="">Tutti gli eventi</option>
              <optgroup label="Serate">
                {NOTTI.map((n) => {
                  const chiave: ChiaveEvento = { categoria: "serata", notte: n };
                  const quante = inAttesa(chiave);
                  return (
                    <option key={n} value={testoDaChiave(chiave)}>
                      {NOME_NOTTE[n]}
                      {quante > 0 ? ` (${quante})` : ""}
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Eventi speciali">
                {EVENTI_CON_LISTA.map((e) => {
                  const chiave: ChiaveEvento = { categoria: "speciale", evento: e };
                  const quante = inAttesa(chiave);
                  const data = speciali.find((s) => s.codice === e)?.dataIso ?? null;
                  return (
                    <option key={e} value={testoDaChiave(chiave)}>
                      {NOME_SPECIALE[e]}
                      {data === null ? "" : `, ${giornoLungo(data)}`}
                      {quante > 0 ? ` (${quante})` : ""}
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>

          <div className={stili.campo}>
            <label htmlFor="f-data">Data</label>
            <input id="f-data" name="data" type="date" defaultValue={valori.data} className={stili.controllo} />
          </div>

          <div className={stili.campo}>
            <label htmlFor="f-stato">Stato</label>
            <select id="f-stato" name="stato" defaultValue={valori.stato} className={stili.controllo}>
              <option value="in attesa">In attesa</option>
              <option value="avvisata">Avvisate</option>
              <option value="chiusa">Chiuse</option>
              <option value="tutti">Tutti</option>
            </select>
          </div>

          <label className={stili.spunta}>
            <input type="checkbox" name="passate" value="1" defaultChecked={valori.passate} />
            Mostra anche le date già passate
          </label>

          <div className={stili.pulsantiFiltri}>
            <button type="submit" className={`lc-press ${stili.filtra}`}>
              Filtra
            </button>
            {filtriAttivi && (
              <Link href="/pannello/attesa" className={`lc-press ${stili.azzera}`}>
                Azzera
              </Link>
            )}
          </div>
        </div>
      </form>

      {gruppi.length === 0 ? (
        <div className={`lc-up ${stili.vuoto}`} style={{ animationDelay: "120ms" }}>
          <span className={stili.vuotoTitolo}>{filtriAttivi ? "Nessuno con questi filtri" : "Nessuno in lista"}</span>
          <span className={stili.vuotoTesto}>
            {legaParole(
              filtriAttivi
                ? "Prova ad allargare la ricerca o ad azzerare i filtri."
                : "Quando qualcuno si mette in lista dal sito lo trovi qui, già diviso per evento.",
              { vedova: true },
            )}
          </span>
        </div>
      ) : (
        gruppi.map((g, i) => (
          <section
            key={g.chiave}
            className={`lc-up ${stili.gruppo}`}
            style={{ animationDelay: `${120 + Math.min(i, 6) * 50}ms` }}
            aria-label={g.titolo}
          >
            <div className={stili.testaGruppo}>
              <h2 className={stili.titoloGruppo}>{g.titolo}</h2>
              <span className={stili.conteggio}>{g.voci.length}</span>
            </div>
            <ul className={stili.elenco}>
              {g.voci.map((v) => (
                <Riga key={v.id} voce={v} proprietario={proprietario} />
              ))}
            </ul>
          </section>
        ))
      )}

      {risultato.totale > risultato.voci.length && (
        <p className={stili.nota}>
          {legaParole(`Mostro le prime ${risultato.voci.length} di ${risultato.totale}: restringi i filtri per vedere le altre.`, {
            vedova: true,
          })}
        </p>
      )}

      {proprietario && <DateEventi eventi={speciali.filter((s) => eEventoConLista(s.codice))} />}
    </div>
  );
}

function Riga({ voce, proprietario }: { readonly voce: VoceAttesa; readonly proprietario: boolean }) {
  const contatto = normalizzaContatto(voce.contatto);
  const primoNome = voce.nome.split(/\s+/)[0] ?? voce.nome;
  const daChi = proprietario ? (voce.prNome === null ? voce.provenienza : `da ${voce.prNome}`) : null;

  return (
    <li className={stili.riga}>
      <div className={stili.rigaTesta}>
        <span className={stili.nome}>{voce.nome}</span>
        <ChipStato tono={TONO[voce.stato]} testo={voce.stato === "in attesa" ? "In attesa" : voce.stato === "avvisata" ? "Avvisata" : "Chiusa"} />
      </div>

      <span className={stili.contatto}>{voce.contatto}</span>
      <span className={stili.meta}>
        {ORA.format(new Date(voce.creataIso))}
        {daChi === null ? "" : ` · ${daChi}`}
      </span>

      <div className={stili.azioni}>
        {contatto?.tipo === "telefono" && (
          <>
            <a
              className={`lc-press ${stili.azione}`}
              href={`https://wa.me/${contatto.norma}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Scrivi a ${primoNome} su WhatsApp`}
            >
              <IconaMessaggio misura={16} />
              WhatsApp
            </a>
            <a className={`lc-press ${stili.azione}`} href={`tel:+${contatto.norma}`} aria-label={`Chiama ${primoNome}`}>
              <IconaTelefono misura={16} />
              Chiama
            </a>
          </>
        )}
        {contatto?.tipo === "email" && (
          <a className={`lc-press ${stili.azione}`} href={`mailto:${contatto.norma}`} aria-label={`Scrivi a ${primoNome} per email`}>
            Scrivi
          </a>
        )}
        <AzioniAttesa id={voce.id} stato={voce.stato} />
      </div>
    </li>
  );
}
