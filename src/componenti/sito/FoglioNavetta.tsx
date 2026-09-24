"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { SERATE } from "@/contenuti/sito";

import { BottoneAzione } from "./Bottone";
import stili from "./FoglioAvvisami.module.css";

/**
 * La richiesta della navetta.
 *
 * Quattro campi e basta: nome, telefono, serata e da dove parti. Il cognome
 * non si chiede, perché è un modulo che si compila mentre si sta già
 * uscendo di casa.
 */
const SERATE_NAVETTA = SERATE.map((s) => `${s.giorno} ${s.nome}`);

export function FoglioNavetta() {
  const id = useId();
  const finestra = useRef<HTMLDialogElement | null>(null);
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefono, setTelefono] = useState("");
  const [serata, setSerata] = useState<string>(SERATE_NAVETTA[0] ?? "");
  const [zona, setZona] = useState("");
  const [errori, setErrori] = useState<Record<string, string>>({});
  const [inCorso, setInCorso] = useState(false);
  const [fatto, setFatto] = useState(false);

  useEffect(() => {
    const f = finestra.current;
    if (f === null) {
      return;
    }

    if (aperto && !f.open) {
      f.showModal();
    } else if (!aperto && f.open) {
      f.close();
    }
  }, [aperto]);

  async function manda(evento: FormEvent) {
    evento.preventDefault();

    const trovati: Record<string, string> = {};
    if (nome.trim() === "") {
      trovati["nome"] = "Scrivi il tuo nome";
    }
    if (telefono.replace(/\D/g, "").length < 9) {
      trovati["telefono"] = "Serve un numero per ricontattarti";
    }
    if (zona.trim() === "") {
      trovati["zona"] = "Dimmi da dove parti";
    }

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
        body: JSON.stringify({ tipo: "navetta", nome, telefono, serata, zona }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrori({ zona: d.errore ?? "Non ha funzionato, riprova" });
        return;
      }

      setFatto(true);
    } catch {
      setErrori({ zona: "Non sono riuscito a mandare la richiesta, riprova" });
    } finally {
      setInCorso(false);
    }
  }

  return (
    <>
      <BottoneAzione
        pieno
        onClick={() => setAperto(true)}
        style={{ background: "var(--cyan)", color: "var(--ink)" }}
      >
        Chiedi la navetta
      </BottoneAzione>

      <dialog
        ref={finestra}
        className={stili.finestra}
        onClose={() => setAperto(false)}
        onClick={(e) => {
          if (e.target === finestra.current) {
            setAperto(false);
          }
        }}
      >
        <div className={stili.foglio}>
          <div className={stili.testa}>
            <h2>{fatto ? "Fatto" : "Dimmi da dove parti"}</h2>
            <button type="button" className={stili.chiudi} onClick={() => setAperto(false)} aria-label="Chiudi">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          {fatto ? (
            <p className={stili.fatto} role="status">
              Richiesta ricevuta: Luca ti scrive con orari e posti.
            </p>
          ) : (
            <form onSubmit={(e) => void manda(e)} noValidate style={{ display: "grid", gap: 18 }}>
              <p className={stili.spiega}>
                Ti ricontatto io su WhatsApp con l&apos;orario e il punto di ritrovo.
              </p>

              <Campo id={`${id}-nome`} etichetta="Nome" valore={nome} cambia={setNome} errore={errori["nome"]} autoComplete="given-name" />
              <Campo id={`${id}-telefono`} etichetta="Telefono" valore={telefono} cambia={setTelefono} errore={errori["telefono"]} autoComplete="tel" />

              <div className={stili.campo}>
                <label htmlFor={`${id}-serata`}>Serata</label>
                <select
                  id={`${id}-serata`}
                  value={serata}
                  onChange={(e) => setSerata(e.target.value)}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    border: "1.5px solid rgba(0,0,0,.25)",
                    background: "#fff",
                    color: "var(--ink)",
                    padding: "0 14px",
                    fontSize: 16,
                  }}
                >
                  {SERATE_NAVETTA.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <Campo
                id={`${id}-zona`}
                etichetta="Da dove parti"
                valore={zona}
                cambia={setZona}
                errore={errori["zona"]}
                segnaposto="Zona o quartiere"
              />

              <BottoneAzione aspetto="nero" pieno type="submit" disabled={inCorso}>
                {inCorso ? "Un attimo..." : "Chiedi la navetta"}
              </BottoneAzione>
            </form>
          )}
        </div>
      </dialog>
    </>
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
}: {
  readonly id: string;
  readonly etichetta: string;
  readonly valore: string;
  readonly cambia: (v: string) => void;
  readonly errore?: string | undefined;
  readonly segnaposto?: string | undefined;
  readonly autoComplete?: string | undefined;
}) {
  return (
    <div className={stili.campo}>
      <label htmlFor={id}>{etichetta}</label>
      <input
        id={id}
        value={valore}
        onChange={(e) => cambia(e.target.value)}
        maxLength={80}
        aria-invalid={errore !== undefined}
        {...(segnaposto === undefined ? {} : { placeholder: segnaposto })}
        {...(autoComplete === undefined ? {} : { autoComplete })}
      />
      {errore !== undefined && (
        <p className={stili.errore} role="alert">
          {errore}
        </p>
      )}
    </div>
  );
}
