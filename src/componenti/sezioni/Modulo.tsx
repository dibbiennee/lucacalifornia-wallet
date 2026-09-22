"use client";

import { useEffect, useId, useState, type CSSProperties, type FormEvent } from "react";

import { Pila } from "@/componenti/Pila";
import { SceltaSingola } from "@/componenti/SceltaSingola";

/**
 * Il modulo di prenotazione.
 *
 * Tutte le scelte sono bottoni e non menu a tendina: è una richiesta del
 * brief, e di notte con una mano sola un bottone si prende sempre.
 *
 * Il numero di persone non si chiede mai, nemmeno per il tavolo: lo ha
 * chiesto Luca.
 *
 * Con ?tipo=tavolo oppure ?tipo=lista nell'indirizzo il modulo si apre già
 * sulla scelta giusta: serve ai due pulsanti della barra in basso.
 */

const SERATE_MODULO = [
  "Gio Milkshake",
  "Ven commerciale",
  "Sab sala 1 house",
  "Sab sala 2 reggaeton",
  "Dom Báilame",
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

const campo: CSSProperties = {
  width: "100%",
  minHeight: "3.2rem",
  padding: "0 1rem",
  border: "2px solid rgba(255,255,255,0.4)",
  background: "transparent",
  color: "#fff",
  fontSize: "1rem",
  fontFamily: "inherit",
};

interface Errori {
  nome?: string;
  cognome?: string;
  telefono?: string;
}

export function Modulo({ serataIniziale }: { readonly serataIniziale?: string }) {
  const id = useId();
  const [tavolo, setTavolo] = useState(false);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serata, setSerata] = useState<string>(
    serataIniziale !== undefined && SERATE_MODULO.includes(serataIniziale as (typeof SERATE_MODULO)[number])
      ? serataIniziale
      : SERATE_MODULO[0],
  );
  const [gruppo, setGruppo] = useState<string>(GRUPPI[2]);
  const [budget, setBudget] = useState<string>(BUDGET[0]);
  const [occasione, setOccasione] = useState<string>(OCCASIONI[6]);
  const [note, setNote] = useState("");
  const [errori, setErrori] = useState<Errori>({});
  const [inCorso, setInCorso] = useState(false);
  const [problema, setProblema] = useState("");
  const [inviata, setInviata] = useState(false);

  // I due pulsanti della barra in basso arrivano qui con ?tipo=
  useEffect(() => {
    const tipo = new URLSearchParams(window.location.search).get("tipo");
    if (tipo === "tavolo") {
      setTavolo(true);
    } else if (tipo === "lista") {
      setTavolo(false);
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
          tipo: tavolo ? "tavolo" : "lista",
          nome,
          cognome,
          telefono,
          serata,
          ...(tavolo ? { gruppo, budget, occasione, note } : {}),
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
      <section className="fascia" id="prenota">
        <div className="dentro">
          <Pila occhiello="CI SIAMO" righe={["RICHIESTA", "INVIATA"]} livello={2} />
          <p style={{ margin: "1.6rem 0 0" }}>
            Luca la vede e ti scrive su WhatsApp con disponibilità e prezzo.
          </p>
          <p className="debole" style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
            Questa è un&apos;anteprima del sito: la richiesta non viene conservata.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="fascia" id="prenota">
      <div className="dentro">
        <Pila occhiello="IN 30 SECONDI" righe={["ENTRA IN LISTA", "O PRENOTA"]} livello={2} />

        <form onSubmit={(e) => void invia(e)} noValidate style={{ marginTop: "2rem" }}>
          <SceltaSingola
            etichetta="Cosa vuoi"
            opzioni={["LISTA", "TAVOLO"]}
            scelta={tavolo ? "TAVOLO" : "LISTA"}
            cambia={(v) => setTavolo(v === "TAVOLO")}
            colonne={2}
          />

          <CampoTesto
            id={`${id}-nome`}
            etichetta="Nome"
            valore={nome}
            cambia={setNome}
            errore={errori.nome}
            autoComplete="given-name"
          />
          <CampoTesto
            id={`${id}-cognome`}
            etichetta="Cognome"
            valore={cognome}
            cambia={setCognome}
            errore={errori.cognome}
            autoComplete="family-name"
          />
          <CampoTesto
            id={`${id}-telefono`}
            etichetta="Telefono"
            valore={telefono}
            cambia={setTelefono}
            errore={errori.telefono}
            autoComplete="tel"
            inputMode="tel"
          />

          <SceltaSingola
            etichetta="Serata"
            opzioni={SERATE_MODULO}
            scelta={serata}
            cambia={setSerata}
          />

          {tavolo && (
            <>
              <SceltaSingola
                etichetta="Chi c'è al tavolo"
                opzioni={GRUPPI}
                scelta={gruppo}
                cambia={setGruppo}
              />
              <SceltaSingola
                etichetta="Budget a testa"
                opzioni={BUDGET}
                scelta={budget}
                cambia={setBudget}
              />
              <SceltaSingola
                etichetta="Occasione speciale"
                opzioni={OCCASIONI}
                scelta={occasione}
                cambia={setOccasione}
              />
              <CampoTesto
                id={`${id}-note`}
                etichetta="Altre richieste"
                valore={note}
                cambia={setNote}
                segnaposto="Torta, bottiglia, decorazioni..."
              />
            </>
          )}

          {problema !== "" && (
            <p role="alert" style={{ color: "#FFC2D1", margin: "0 0 1rem" }}>
              {problema}
            </p>
          )}

          <button type="submit" className="bottone" disabled={inCorso} style={{ width: "100%", opacity: inCorso ? 0.6 : 1 }}>
            {inCorso ? "Un attimo..." : "Invia la richiesta"}
          </button>

          <p className="debole" style={{ margin: "1rem 0 0", fontSize: "0.875rem" }}>
            La richiesta arriva direttamente a Luca. Quando conferma, ricevi il biglietto da
            aggiungere al Wallet.
          </p>
        </form>
      </div>
    </section>
  );
}

function CampoTesto({
  id,
  etichetta,
  valore,
  cambia,
  errore,
  segnaposto,
  autoComplete,
  inputMode,
}: {
  readonly id: string;
  readonly etichetta: string;
  readonly valore: string;
  readonly cambia: (v: string) => void;
  readonly errore?: string | undefined;
  readonly segnaposto?: string | undefined;
  readonly autoComplete?: string | undefined;
  readonly inputMode?: "tel" | "text" | undefined;
}) {
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <label htmlFor={id} className="etichetta-campo">
        {etichetta}
      </label>
      <input
        id={id}
        value={valore}
        onChange={(e) => cambia(e.target.value)}
        style={{
          ...campo,
          borderColor: errore === undefined ? "rgba(255,255,255,0.4)" : "#FFC2D1",
        }}
        aria-invalid={errore !== undefined}
        aria-describedby={errore === undefined ? undefined : `${id}-errore`}
        {...(segnaposto === undefined ? {} : { placeholder: segnaposto })}
        {...(autoComplete === undefined ? {} : { autoComplete })}
        {...(inputMode === undefined ? {} : { inputMode })}
      />
      {errore !== undefined && (
        <p id={`${id}-errore`} role="alert" style={{ margin: "0.5rem 0 0", color: "#FFC2D1", fontSize: "0.9375rem" }}>
          {errore}
        </p>
      )}
    </div>
  );
}
