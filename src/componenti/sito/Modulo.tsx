"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";

import { calendarioSerate, type NotteSerata, type VoceCalendarioSerata } from "@/lib/calendario-serate";
import { legaParole } from "@/lib/tipografia";

import { BottoneAzione } from "./Bottone";
import stili from "./Modulo.module.css";

/**
 * Il modulo: l'unica cosa che porta soldi.
 *
 * Le scelte sono pillole, tranne la serata: lì servono le date vere, e con
 * tante date in fila la pillola non sta più in uno schermo di telefono. Per
 * quella si usa il menu a tendina del sistema, quello che si apre da solo
 * con le dita o con il mouse.
 *
 * Il tipo e la serata arrivano dall'indirizzo, così ogni pulsante del sito
 * può aprire il modulo già sulla cosa giusta: la serata arriva come codice
 * della notte (milkshake, venerdi, sabato, bailame), e il modulo sceglie da
 * solo la prossima data vera di quella notte.
 */

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
const PERSONE = ["1", "2", "3", "4", "5", "6+"] as const;

/**
 * Il prezzo del braccialetto, dove c'è: solo venerdì e sabato, e solo sabato
 * cambia fra donna e uomo. Le altre notti Luca lo dice su WhatsApp come per
 * lista e tavolo, perché il prezzo non c'è ancora.
 */
function prezzoBraccialetto(notte: NotteSerata | undefined, genere: string): string | null {
  if (notte === "venerdi") {
    return "25 € a testa, con 2 drink inclusi.";
  }
  if (notte === "sabato") {
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
  const [calendario, setCalendario] = useState<readonly VoceCalendarioSerata[]>([]);
  const [serata, setSerata] = useState<string>("");
  const [persone, setPersone] = useState<string>(PERSONE[0]);
  const [gruppo, setGruppo] = useState<string>("Misto");
  const [budget, setBudget] = useState<string>(BUDGET[0]);
  const [occasione, setOccasione] = useState<string>("Nessuna");
  const [genere, setGenere] = useState<string>("");
  const [note, setNote] = useState("");
  const [errori, setErrori] = useState<Errori>({});
  const [inCorso, setInCorso] = useState(false);
  const [problema, setProblema] = useState("");
  const [inviata, setInviata] = useState(false);

  // Le date vere si generano solo nel browser, da "adesso": calcolarle anche
  // sul server darebbe due liste leggermente diverse (secondi di differenza
  // fra quando risponde il server e quando il browser disegna la pagina).
  useEffect(() => {
    const generato = calendarioSerate();
    setCalendario(generato);

    const cerca = new URLSearchParams(window.location.search);

    const tipoIndirizzo = cerca.get("tipo");
    if (tipoIndirizzo === "tavolo" || tipoIndirizzo === "braccialetto" || tipoIndirizzo === "lista") {
      setTipo(tipoIndirizzo);
    }

    // Quello che arriva dall'indirizzo è il codice della notte (es.
    // "venerdi"): si prende la prima data di quella notte, cioè la più
    // vicina, perché la lista è già in ordine di calendario.
    const notteIndirizzo = cerca.get("serata");
    const trovata = generato.find((v) => v.notte === notteIndirizzo);
    setSerata((trovata ?? generato[0])?.data ?? "");
  }, []);

  const voceSerata = calendario.find((v) => v.data === serata);

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
          serata: voceSerata?.valore ?? "",
          dataSerata: serata,
          persone,
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

      <div className={stili.campo}>
        <label htmlFor={`${id}-serata`}>Serata</label>
        <select
          id={`${id}-serata`}
          name="serata"
          value={serata}
          onChange={(e) => setSerata(e.target.value)}
          disabled={calendario.length === 0}
        >
          {calendario.length === 0 ? (
            <option value="">Un attimo...</option>
          ) : (
            calendario.map((v) => (
              <option key={v.data} value={v.data}>
                {v.valore}
              </option>
            ))
          )}
        </select>
      </div>

      <Scelta etichetta="Quante persone" nome="persone" voci={PERSONE} scelto={persone} cambia={setPersone} />

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
          {prezzoBraccialetto(voceSerata?.notte, genere) !== null && (
            <p className={stili.prezzo}>{prezzoBraccialetto(voceSerata?.notte, genere)}</p>
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
