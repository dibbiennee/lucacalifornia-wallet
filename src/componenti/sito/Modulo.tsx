"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";


import { legaParole } from "@/lib/tipografia";

import { BottoneAzione } from "./Bottone";
import stili from "./Modulo.module.css";

/**
 * Il modulo: l'unica cosa che porta soldi.
 *
 * Tutte le scelte sono pillole e non menu a tendina: è una richiesta del
 * brief, e di notte con una mano sola una pillola si prende sempre.
 *
 * Il numero di persone non si chiede mai, nemmeno per il tavolo: lo ha
 * chiesto Luca.
 *
 * Il tipo e la serata arrivano dall'indirizzo, così ogni pulsante del sito
 * può aprire il modulo già sulla cosa giusta.
 */

/** Le quattro serate, una per giorno. */
const SERATE_MODULO = [
  { valore: "Gio Milkshake", colore: "milk" },
  { valore: "Ven Drip", colore: "acid" },
  { valore: "Sab International", colore: "cyan" },
  { valore: "Dom Bàilame", colore: "red" },
] as const;

const GRUPPI = ["Solo ragazzi", "Solo ragazze", "Misto"] as const;
const BUDGET = ["25–30 €", "35–50 €", "Oltre 50 €"] as const;
const OCCASIONI = [
  "Compleanno",
  "Laurea",
  "Diciottesimo",
  "Addio al nubilato",
  "Addio al celibato",
  "Anniversario",
  "Nessuna",
] as const;

const GENERI = ["Donna", "Uomo"] as const;

/**
 * Il prezzo del braccialetto, dove c'è: solo venerdì e sabato, e solo sabato
 * cambia fra donna e uomo. Le altre sere Luca lo dice su WhatsApp come per
 * lista e tavolo, perché il prezzo non c'è ancora.
 */
function prezzoBraccialetto(serata: string, genere: string): string | null {
  if (serata === "Ven Drip") {
    return "25 € a testa, con 2 drink inclusi.";
  }
  if (serata === "Sab International") {
    return genere === "Uomo"
      ? "30 € a testa, con 2 drink inclusi."
      : genere === "Donna"
        ? "25 € a testa, con 2 drink inclusi."
        : "25 € donna, 30 € uomo, con 2 drink inclusi.";
  }
  return null;
}

interface Errori {
  nome?: string;
  cognome?: string;
  telefono?: string;
  genere?: string;
}

type TipoIngresso = "lista" | "tavolo" | "braccialetto";

export function Modulo() {
  const id = useId();
  // Il tavolo è la priorità: chi apre il modulo senza un tipo scelto prima
  // (dal link fisso, per esempio) parte da lì, non dalla lista.
  const [tipo, setTipo] = useState<TipoIngresso>("tavolo");
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serata, setSerata] = useState<string>(SERATE_MODULO[0].valore);
  const [gruppo, setGruppo] = useState<string>("Misto");
  const [budget, setBudget] = useState<string>(BUDGET[0]);
  const [occasione, setOccasione] = useState<string>("Nessuna");
  const [genere, setGenere] = useState<string>("");
  const [note, setNote] = useState("");
  const [errori, setErrori] = useState<Errori>({});
  const [inCorso, setInCorso] = useState(false);
  const [problema, setProblema] = useState("");
  const [inviata, setInviata] = useState(false);

  // Quello che arriva dall'indirizzo: ?tipo=tavolo e ?serata=Dom Bàilame
  useEffect(() => {
    const cerca = new URLSearchParams(window.location.search);

    const tipoIndirizzo = cerca.get("tipo");
    if (tipoIndirizzo === "tavolo" || tipoIndirizzo === "braccialetto" || tipoIndirizzo === "lista") {
      setTipo(tipoIndirizzo);
    }

    const scelta = cerca.get("serata");
    if (scelta !== null && SERATE_MODULO.some((s) => s.valore === scelta)) {
      setSerata(scelta);
    }
  }, []);

  function controlla(): Errori {
    const trovati: Errori = {};

    if (nome.trim() === "") {
      trovati.nome = "Scrivi il tuo nome";
    }
    if (cognome.trim() === "") {
      trovati.cognome = "Scrivi il tuo cognome";
    }
    if (telefono.trim() === "") {
      trovati.telefono = "Serve un numero per ricontattarti";
    } else if (telefono.replace(/\D/g, "").length < 9) {
      trovati.telefono = "Questo numero sembra incompleto";
    }
    if (tipo === "braccialetto" && genere === "") {
      trovati.genere = "Dicci se è per una donna o un uomo";
    }

    return trovati;
  }

  async function invia(evento: FormEvent) {
    evento.preventDefault();
    setProblema("");

    const trovati = controlla();
    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    setInCorso(true);

    try {
      const risposta = await fetch("/api/richiesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nome,
          cognome,
          telefono,
          serata,
          ...(tipo === "tavolo" ? { gruppo, budget, occasione, note } : {}),
          ...(tipo === "braccialetto" ? { genere } : {}),
        }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setProblema(d.errore ?? "Non ha funzionato, riprova");
        return;
      }

      setInviata(true);
    } catch {
      setProblema("Non sono riuscito a mandare la richiesta, riprova");
    } finally {
      setInCorso(false);
    }
  }

  if (inviata) {
    return (
      <div className={stili.fatto} role="status">
        <h2>Richiesta inviata</h2>
        <p className="introduzione">
          {legaParole("Luca la vede e ti scrive su WhatsApp con disponibilità e prezzo.", {
            vedova: true,
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void invia(e)} noValidate className={stili.modulo}>
      <div className={stili["scelta-tipo"]} role="radiogroup" aria-label="Cosa vuoi">
        {(
          [
            ["Tavolo", "tavolo"],
            ["Bracciale", "braccialetto"],
            ["Lista", "lista"],
          ] as const
        ).map(([testo, valore]) => (
          <label key={valore}>
            <input type="radio" name="tipo" checked={tipo === valore} onChange={() => setTipo(valore)} />
            <span>{testo}</span>
          </label>
        ))}
      </div>

      <div className={stili.due}>
        <Campo
          id={`${id}-nome`}
          etichetta="Nome"
          valore={nome}
          cambia={setNome}
          errore={errori.nome}
          autoComplete="given-name"
        />
        <Campo
          id={`${id}-cognome`}
          etichetta="Cognome"
          valore={cognome}
          cambia={setCognome}
          errore={errori.cognome}
          autoComplete="family-name"
        />
      </div>

      <Campo
        id={`${id}-telefono`}
        etichetta="Telefono"
        valore={telefono}
        cambia={setTelefono}
        errore={errori.telefono}
        autoComplete="tel"
        inputMode="tel"
        tipo="tel"
        segnaposto="333 123 4567"
      />

      <fieldset className={stili.gruppo}>
        <legend>Serata</legend>
        <div className={stili.pillole}>
          {SERATE_MODULO.map((s) => (
            <label key={s.valore} className={stili.pillola}>
              <input
                type="radio"
                name="serata"
                checked={serata === s.valore}
                onChange={() => setSerata(s.valore)}
              />
              <span>
                <i style={{ background: `var(--${s.colore})` }} aria-hidden />
                {s.valore}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {tipo === "tavolo" && (
        <>
          <Scelta etichetta="Chi c'è al tavolo" nome="gruppo" voci={GRUPPI} scelto={gruppo} cambia={setGruppo} />
          <Scelta etichetta="Budget a testa" nome="budget" voci={BUDGET} scelto={budget} cambia={setBudget} />
          <Scelta etichetta="Occasione speciale" nome="occasione" voci={OCCASIONI} scelto={occasione} cambia={setOccasione} />
          <Campo
            id={`${id}-note`}
            etichetta="Altre richieste"
            facoltativo
            valore={note}
            cambia={setNote}
            segnaposto="Torta, bottiglia, decorazioni..."
          />
        </>
      )}

      {tipo === "braccialetto" && (
        <>
          <Scelta etichetta="Per chi è" nome="genere" voci={GENERI} scelto={genere} cambia={setGenere} />
          {errori.genere !== undefined && (
            <p role="alert" className={stili.errore}>
              {errori.genere}
            </p>
          )}
          {prezzoBraccialetto(serata, genere) !== null && (
            <p className={stili.prezzo}>{prezzoBraccialetto(serata, genere)}</p>
          )}
        </>
      )}

      {problema !== "" && (
        <p role="alert" className={stili.errore}>
          {problema}
        </p>
      )}

      <BottoneAzione aspetto="nero" pieno type="submit" disabled={inCorso}>
        {inCorso ? "Un attimo..." : "Invia la richiesta"}
      </BottoneAzione>

      <p className={stili.dopo}>
        {legaParole(
          "Dopo aver compilato il form, riceverai direttamente conferma su WhatsApp.",
          { vedova: true },
        )}
      </p>

      {/*
        Il modulo raccoglie nome e telefono: chi li lascia deve poter sapere
        che fine fanno, senza doverlo cercare nel piè di pagina.
      */}
      <p className={stili.dopo}>
        I tuoi dati servono solo a ricontattarti: <Link href="/privacy">come li trattiamo</Link>.
      </p>
    </form>
  );
}

function Campo({
  id,
  etichetta,
  valore,
  cambia,
  errore,
  segnaposto,
  autoComplete,
  inputMode,
  tipo,
  facoltativo = false,
}: {
  readonly id: string;
  readonly etichetta: string;
  readonly valore: string;
  readonly cambia: (v: string) => void;
  readonly errore?: string | undefined;
  readonly segnaposto?: string | undefined;
  readonly autoComplete?: string | undefined;
  readonly inputMode?: "tel" | "text" | undefined;
  readonly tipo?: string | undefined;
  readonly facoltativo?: boolean;
}) {
  return (
    <div className={stili.campo}>
      <label htmlFor={id}>
        {etichetta}
        {facoltativo && <span style={{ fontWeight: 500, color: "var(--ink-2)" }}> (facoltativo)</span>}
      </label>
      <input
        id={id}
        value={valore}
        onChange={(e) => cambia(e.target.value)}
        aria-invalid={errore !== undefined}
        aria-describedby={errore === undefined ? undefined : `${id}-errore`}
        maxLength={300}
        {...(segnaposto === undefined ? {} : { placeholder: segnaposto })}
        {...(autoComplete === undefined ? {} : { autoComplete })}
        {...(inputMode === undefined ? {} : { inputMode })}
        {...(tipo === undefined ? {} : { type: tipo })}
      />
      {errore !== undefined && (
        <p id={`${id}-errore`} role="alert" className={stili.errore}>
          {errore}
        </p>
      )}
    </div>
  );
}

function Scelta({
  etichetta,
  nome,
  voci,
  scelto,
  cambia,
}: {
  readonly etichetta: string;
  readonly nome: string;
  readonly voci: readonly string[];
  readonly scelto: string;
  readonly cambia: (v: string) => void;
}) {
  return (
    <fieldset className={stili.gruppo}>
      <legend>{etichetta}</legend>
      <div className={stili.pillole}>
        {voci.map((voce) => (
          <label key={voce} className={stili.pillola}>
            <input type="radio" name={nome} checked={scelto === voce} onChange={() => cambia(voce)} />
            <span>{voce}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
