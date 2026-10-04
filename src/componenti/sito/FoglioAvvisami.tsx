"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { ISO_PREDEFINITO } from "@/contenuti/prefissi";
import { cifreMinime, telefonoCompleto } from "@/lib/telefono";
import { legaParole } from "@/lib/tipografia";

import { BottoneAzione } from "./Bottone";
import { CampoTelefono } from "./CampoTelefono";
import stili from "./FoglioAvvisami.module.css";

/**
 * "Avvisami": un nome, un contatto, e basta.
 *
 * Lo usano Halloween e il Capodanno: cose che non hanno ancora una data,
 * ma hanno già chi le aspetta.
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
  readonly tipo: "halloween" | "capodanno";
  /** Il testo del pulsante che lo apre. */
  readonly etichetta: string;
  /** Le righe del titolo, separate da | (le va a capo chi scrive: lo spazio è poco, e un titolo spezzato dal browser viene male). */
  readonly titolo: string;
  readonly spiegazione: string;
  readonly aspetto?: "chiaro" | "caldo" | "contorno" | "nero";
}) {
  const id = useId();
  const finestra = useRef<HTMLDialogElement | null>(null);
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState("");
  // Come avvisarti: per telefono (con il prefisso del paese) o per email.
  const [modo, setModo] = useState<"telefono" | "email">("telefono");
  const [paeseTel, setPaeseTel] = useState<string>(ISO_PREDEFINITO);
  const [numeroTel, setNumeroTel] = useState("");
  const [email, setEmail] = useState("");
  const [trappola, setTrappola] = useState("");
  const [errori, setErrori] = useState<{ nome?: string; contatto?: string }>({});
  const [inCorso, setInCorso] = useState(false);
  const [fatto, setFatto] = useState(false);
  // Le righe le decide chi scrive il titolo; "Fatto" è una riga sola.
  const righe = fatto ? ["Fatto"] : titolo.split("|").map((r) => r.trim());

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
    if (modo === "telefono") {
      if (numeroTel.trim() === "") {
        trovati.contatto = "Serve un numero per avvisarti";
      } else if (numeroTel.replace(/\D/g, "").length < cifreMinime(paeseTel)) {
        trovati.contatto = "Questo numero sembra incompleto";
      }
    } else if (email.trim() === "") {
      trovati.contatto = "Serve un'email per avvisarti";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      trovati.contatto = "Scrivi un'email valida";
    }

    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    // Quello che parte è un contatto solo: il numero col prefisso (+39 333...) oppure l'email.
    const contatto = modo === "telefono" ? telefonoCompleto(paeseTel, numeroTel) : email.trim();

    setInCorso(true);

    try {
      const risposta = await fetch("/api/lista-attesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, nome, contatto, sito: trappola }),
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
            <h2 style={{ "--n": Math.max(...righe.map((r) => r.length)) } as CSSProperties}>
              {righe.map((riga) => (
                <span key={riga} className={stili.riga}>
                  {legaParole(riga, { titolo: true, vedova: false })}
                </span>
              ))}
            </h2>
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
              <p className={stili.spiega}>{legaParole(spiegazione, { vedova: true })}</p>

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

              <div className={stili.modi} role="group" aria-label="Come vuoi essere avvisato">
                {(
                  [
                    ["telefono", "Telefono"],
                    ["email", "Email"],
                  ] as const
                ).map(([valore, testo]) => (
                  <button
                    key={valore}
                    type="button"
                    className={stili.modo}
                    aria-pressed={modo === valore}
                    onClick={() => {
                      setModo(valore);
                      setErrori((e) => (e.nome === undefined ? {} : { nome: e.nome }));
                    }}
                  >
                    {testo}
                  </button>
                ))}
              </div>

              {modo === "telefono" ? (
                <CampoTelefono
                  id={`${id}-contatto`}
                  iso={paeseTel}
                  numero={numeroTel}
                  cambia={(v) => {
                    setPaeseTel(v.iso);
                    setNumeroTel(v.numero);
                  }}
                  errore={errori.contatto}
                  bordo="lieve"
                />
              ) : (
                <div className={stili.campo}>
                  <label htmlFor={`${id}-contatto`}>Email</label>
                  <input
                    id={`${id}-contatto`}
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    maxLength={80}
                    placeholder="nome@esempio.it"
                    aria-invalid={errori.contatto !== undefined}
                  />
                  {errori.contatto !== undefined && (
                    <p className={stili.errore} role="alert">
                      {errori.contatto}
                    </p>
                  )}
                </div>
              )}

              {/*
                Il campo trappola: fuori dallo schermo e fuori dalla tastiera, per chi usa il
                sito non esiste. Un bot che riempie ogni campo lo riempie, e il server lo scarta.
              */}
              <div aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor={`${id}-sito`}>Non compilare</label>
                <input
                  id={`${id}-sito`}
                  name="sito"
                  tabIndex={-1}
                  autoComplete="off"
                  value={trappola}
                  onChange={(e) => setTrappola(e.target.value)}
                />
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
