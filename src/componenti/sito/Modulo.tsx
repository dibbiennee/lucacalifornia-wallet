"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";

import { calendarioSerate, type VoceCalendarioSerata } from "@/lib/calendario-serate";
import { prezzoBraccialetto } from "@/lib/prezzo-braccialetto";
import { legaParole } from "@/lib/tipografia";

import { BottoneAzione } from "./Bottone";
import stili from "./Modulo.module.css";
import { segnaEvento, sessioneTraffico } from "./traffico-client";

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

const GENERI = ["Donna", "Uomo", "Misti"] as const;
const PERSONE = ["1", "2", "3", "4", "5", "6+"] as const;

interface Errori {
  nome?: string;
  cognome?: string;
  telefono?: string;
  serata?: string;
  genere?: string;
}

type TipoIngresso = "lista" | "tavolo" | "braccialetto";

/**
 * `codicePr`: il codice della pagina /pr/<codice> da cui si apre il modulo, se è
 * quella di un PR. Non è un id e non decide niente da solo: il server lo controlla
 * (un PR attivo) e da lui ricava a chi attribuire la richiesta.
 */
export function Modulo({ codicePr }: { readonly codicePr?: string } = {}) {
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
  const [trappola, setTrappola] = useState("");
  /*
   * Il modulo si apre a gradini: all'inizio il tipo, il nome e il cognome; poi,
   * man mano che si compila, il telefono, la data e il resto. Una fase aperta
   * non si richiude (se si cancella il nome, il telefono non sparisce).
   *   0 tipo, nome, cognome
   *   1 + telefono          (nome e cognome scritti)
   *   2 + data              (telefono completo)
   *   3 + persone, il resto del tipo e il pulsante   (data scelta)
   */
  const [fase, setFase] = useState(0);

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

    // Nessuna data preselezionata: è una scelta vera, non va data per
    // scontata nemmeno quando si arriva da un link già sulla notte giusta.
  }, []);

  const voceSerata = calendario.find((v) => v.data === serata);

  // Fino a dove si può arrivare coi dati che ci sono adesso.
  const cifre = telefono.replace(/\D/g, "").length;
  const raggiungibile = nome.trim().length >= 2 && cognome.trim().length >= 2 ? (cifre >= 9 ? (serata !== "" ? 3 : 2) : 1) : 0;

  useEffect(() => {
    setFase((prima) => Math.max(prima, raggiungibile));
  }, [raggiungibile]);

  // Quando si apre un gruppo, lo si porta in vista (con la tastiera aperta sul telefono resterebbe sotto).
  useEffect(() => {
    if (fase === 0) {
      return;
    }
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const attesa = window.setTimeout(() => {
      document.getElementById(`${id}-fase-${fase}`)?.scrollIntoView({ block: "nearest", behavior: riduci ? "auto" : "smooth" });
    }, 180);
    return () => window.clearTimeout(attesa);
  }, [fase, id]);

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
    if (serata === "") {
      trovati.serata = "Scegli una data";
    }
    if (tipo === "braccialetto" && genere === "") {
      trovati.genere = "Dicci se è per una donna o un uomo";
    }

    return trovati;
  }

  async function invia(evento: FormEvent) {
    evento.preventDefault();
    setProblema("");

    // Si controllano solo i campi già comparsi: gli altri non si vedono e non possono dare errore.
    const tutti = controlla();
    const visibili: (keyof Errori)[] = ["nome", "cognome", ...(fase >= 1 ? (["telefono"] as const) : []), ...(fase >= 2 ? (["serata"] as const) : []), ...(fase >= 3 ? (["genere"] as const) : [])];
    const trovati: Errori = {};
    for (const chiave of visibili) {
      if (tutti[chiave] !== undefined) {
        trovati[chiave] = tutti[chiave];
      }
    }
    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    // "Invio" dalla tastiera con il modulo non ancora aperto del tutto: si apre il gruppo dopo, non si invia.
    if (fase < 3) {
      setFase(fase + 1);
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
          ...(codicePr === undefined ? {} : { codicePr }),
          sessione: sessioneTraffico().sessione,
          sito: trappola,
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
          {legaParole("La vedo io e ti scrivo su WhatsApp con disponibilità e prezzo.", {
            vedova: true,
          })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void invia(e)}
      // "Modulo iniziato" = la persona ha toccato davvero un campo, non solo aperto la pagina.
      onInput={() => segnaEvento("inizio", codicePr)}
      noValidate
      className={stili.modulo}
    >
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

      <div className={stili.fasi} data-vuoto={fase === 0 ? "" : undefined}>
      <Fase id={`${id}-fase-1`} aperta={fase >= 1}>
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
      </Fase>

      <Fase id={`${id}-fase-2`} aperta={fase >= 2}>
        <div className={stili.campo}>
          <label htmlFor={`${id}-serata`}>Data</label>
          <select
            id={`${id}-serata`}
            name="serata"
            required
            value={serata}
            onChange={(e) => setSerata(e.target.value)}
            disabled={calendario.length === 0}
            aria-invalid={errori.serata !== undefined}
            aria-describedby={errori.serata === undefined ? undefined : `${id}-serata-errore`}
          >
            <option value="" disabled hidden>
              {calendario.length === 0 ? "Un attimo..." : "Tocca per scegliere la data"}
            </option>
            {calendario.map((v) => (
              <option key={v.data} value={v.data}>
                {v.valore}
              </option>
            ))}
          </select>
          {errori.serata !== undefined && (
            <p id={`${id}-serata-errore`} role="alert" className={stili.errore}>
              {errori.serata}
            </p>
          )}
        </div>
      </Fase>

      <Fase id={`${id}-fase-3`} aperta={fase >= 3}>
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
      </Fase>
      </div>

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
      {/*
        Il campo trappola: fuori dallo schermo e fuori dalla tastiera, per chi usa il
        sito non esiste. Un bot che riempie ogni campo lo riempie, e il server lo scarta.
      */}
      <div aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor={`${id}-sito`}>Non compilare</label>
        <input id={`${id}-sito`} name="sito" tabIndex={-1} autoComplete="off" value={trappola} onChange={(e) => setTrappola(e.target.value)} />
      </div>

      <p className={stili.dopo}>
        I tuoi dati servono solo a ricontattarti: <Link href="/privacy">come li trattiamo</Link>.
      </p>
    </form>
  );
}

/**
 * Un gruppo di campi che compare quando serve. Chiuso non occupa spazio e non
 * si raggiunge con la tastiera (inert); si apre con un'animazione di altezza e
 * dissolvenza, che col movimento ridotto diventa un cambio secco.
 */
function Fase({ id, aperta, children }: { readonly id: string; readonly aperta: boolean; readonly children: React.ReactNode }) {
  return (
    <div id={id} className={stili.fase} data-aperta={aperta ? "" : undefined} inert={!aperta}>
      <div className={stili.faseDentro}>{children}</div>
    </div>
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
