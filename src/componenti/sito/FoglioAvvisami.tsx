"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { BottoneAzione } from "./Bottone";
import stili from "./FoglioAvvisami.module.css";

/**
 * "Avvisami": un nome, un contatto, e basta.
 *
 * Lo usano lo special guest, Halloween, il Capodanno e le due stagioni
 * estive: cose che non hanno ancora una data, ma hanno già chi le aspetta.
 *
 * Il foglio sale dal basso perché è lì che sta il pollice, e si chiude
 * toccando fuori o con Esc, senza dover centrare la crocetta.
 */
export function FoglioAvvisami({
  tipo,
  etichetta,
  titolo,
  spiegazione,
  aspetto = "chiaro",
}: {
  readonly tipo: "special_guest" | "halloween" | "capodanno" | "ninfeo" | "morgan";
  /** Il testo del pulsante che lo apre. */
  readonly etichetta: string;
  readonly titolo: string;
  readonly spiegazione: string;
  readonly aspetto?: "chiaro" | "caldo" | "contorno" | "nero";
}) {
  const id = useId();
  const finestra = useRef<HTMLDialogElement | null>(null);
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState("");
  const [contatto, setContatto] = useState("");
  const [errori, setErrori] = useState<{ nome?: string; contatto?: string }>({});
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

    const trovati: { nome?: string; contatto?: string } = {};
    if (nome.trim() === "") {
      trovati.nome = "Scrivi il tuo nome";
    }
    if (contatto.trim() === "") {
      trovati.contatto = "Serve un telefono o un'email per avvisarti";
    } else if (!contatto.includes("@") && contatto.replace(/\D/g, "").length < 9) {
      trovati.contatto = "Scrivi un telefono valido o un'email";
    }

    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    setInCorso(true);

    try {
      const risposta = await fetch("/api/lista-attesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nome, contatto }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrori({ contatto: d.errore ?? "Non ha funzionato, riprova" });
        return;
      }

      setFatto(true);
    } catch {
      setErrori({ contatto: "Non sono riuscito a mandare la richiesta, riprova" });
    } finally {
      setInCorso(false);
    }
  }

  return (
    <>
      <BottoneAzione aspetto={aspetto} stretto onClick={() => setAperto(true)}>
        {etichetta}
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
            <h2>{fatto ? "Fatto" : titolo}</h2>
            <button
              type="button"
              className={stili.chiudi}
              onClick={() => setAperto(false)}
              aria-label="Chiudi"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          {fatto ? (
            <p className={stili.fatto} role="status">
              Ti avviso io, appena c&apos;è qualcosa da sapere.
            </p>
          ) : (
            <form onSubmit={(e) => void manda(e)} noValidate style={{ display: "grid", gap: 18 }}>
              <p className={stili.spiega}>{spiegazione}</p>

              <div className={stili.campo}>
                <label htmlFor={`${id}-nome`}>Nome</label>
                <input
                  id={`${id}-nome`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoComplete="given-name"
                  maxLength={60}
                  aria-invalid={errori.nome !== undefined}
                />
                {errori.nome !== undefined && (
                  <p className={stili.errore} role="alert">
                    {errori.nome}
                  </p>
                )}
              </div>

              <div className={stili.campo}>
                <label htmlFor={`${id}-contatto`}>Telefono o email</label>
                <input
                  id={`${id}-contatto`}
                  value={contatto}
                  onChange={(e) => setContatto(e.target.value)}
                  autoComplete="tel"
                  maxLength={80}
                  aria-invalid={errori.contatto !== undefined}
                />
                {errori.contatto !== undefined && (
                  <p className={stili.errore} role="alert">
                    {errori.contatto}
                  </p>
                )}
              </div>

              <BottoneAzione aspetto="nero" pieno type="submit" disabled={inCorso}>
                {inCorso ? "Un attimo..." : "Avvisami"}
              </BottoneAzione>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
