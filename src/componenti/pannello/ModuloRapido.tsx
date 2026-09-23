"use client";

import { useId, useState, type FormEvent } from "react";

import { Avviso } from "./Avviso";
import { Campo, Errore } from "./Campo";
import { Pulsante } from "./Pulsante";
import { Riquadro } from "./Scelta";

/**
 * Un pulsante che, premuto, diventa un campo.
 *
 * Lo usano "Aggiungi un ospite" e "Aggiungi un PR": due cose che si fanno di
 * rado, e che non meritano un campo sempre aperto in mezzo alla schermata.
 *
 * Il campo compare già col fuoco dentro, così la tastiera si apre da sola e
 * non serve un secondo tocco.
 */
export function ModuloRapido({
  apri,
  etichetta,
  invia,
  azione,
}: {
  /** Il testo del pulsante chiuso: "Aggiungi un PR". */
  readonly apri: string;
  /** L'etichetta del campo: "Nome del PR". */
  readonly etichetta: string;
  /** Il testo del pulsante che conferma: "Crea il suo link". */
  readonly invia: string;
  /** Cosa fare col nome scritto. Torna la frase da mostrare come avviso. */
  readonly azione: (nome: string) => Promise<string>;
}) {
  const id = useId();
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [avviso, setAvviso] = useState("");

  async function manda(evento: FormEvent) {
    evento.preventDefault();

    if (nome.trim() === "") {
      setErrore(`Scrivi ${etichetta.toLowerCase()}`);
      return;
    }

    setErrore("");
    setInCorso(true);

    try {
      setAvviso(await azione(nome.trim()));
      setNome("");
      setAperto(false);
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <>
      {aperto ? (
        <form onSubmit={(e) => void manda(e)} noValidate>
          <Riquadro>
            <Campo
              id={`${id}-nome`}
              etichetta={etichetta}
              autoComplete="off"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              errore={errore}
            />
            <Pulsante type="submit" disabled={inCorso}>
              {inCorso ? "Un attimo..." : invia}
            </Pulsante>
            <Pulsante
              aspetto="vuoto"
              type="button"
              onClick={() => {
                setAperto(false);
                setErrore("");
              }}
            >
              Annulla
            </Pulsante>
          </Riquadro>
        </form>
      ) : (
        <Pulsante aspetto="vuoto" onClick={() => setAperto(true)}>
          {apri}
        </Pulsante>
      )}

      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </>
  );
}

/** Lo stesso, senza campo: un pulsante solo che fa una cosa e lo dice. */
export function PulsanteAzione({
  testo,
  azione,
}: {
  readonly testo: string;
  readonly azione: () => Promise<string>;
}) {
  const [inCorso, setInCorso] = useState(false);
  const [avviso, setAvviso] = useState("");
  const [errore, setErrore] = useState("");

  async function premi() {
    setErrore("");
    setInCorso(true);

    try {
      setAvviso(await azione());
    } catch {
      setErrore("Non ha funzionato, riprova");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <>
      {errore !== "" && <Errore>{errore}</Errore>}
      <Pulsante aspetto="vuoto" onClick={() => void premi()} disabled={inCorso}>
        {inCorso ? "Un attimo..." : testo}
      </Pulsante>
      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </>
  );
}
