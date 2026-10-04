"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";

import { ISO_PREDEFINITO } from "@/contenuti/prefissi";
import { cifreMinime } from "@/lib/telefono";
import { legaParole } from "@/lib/tipografia";

import { BottoneAzione } from "./Bottone";
import { CampoTelefono } from "./CampoTelefono";
import stili from "./FoglioAvvisami.module.css";

/**
 * La candidatura per entrare nella squadra.
 *
 * Non manda niente a nessuno: come il resto dei moduli in anteprima, la
 * richiesta viene controllata e confermata ma non conservata, e la pagina lo
 * dice. Con il database diventerà una riga come le altre.
 */
export function FoglioCandidatura() {
  const id = useId();
  const finestra = useRef<HTMLDialogElement | null>(null);
  const [aperto, setAperto] = useState(false);
  const [nome, setNome] = useState("");
  const [citta, setCitta] = useState("");
  // Come risponderti: per telefono (con il prefisso del paese) o su Instagram.
  const [modo, setModo] = useState<"telefono" | "instagram">("telefono");
  const [paeseTel, setPaeseTel] = useState<string>(ISO_PREDEFINITO);
  const [numeroTel, setNumeroTel] = useState("");
  const [instagram, setInstagram] = useState("");
  const [errori, setErrori] = useState<Record<string, string>>({});
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

  function manda(evento: FormEvent) {
    evento.preventDefault();

    const trovati: Record<string, string> = {};
    if (nome.trim() === "") {
      trovati["nome"] = "Scrivi il tuo nome";
    }
    if (citta.trim() === "") {
      trovati["citta"] = "Dimmi da dove vieni";
    }
    if (modo === "telefono") {
      if (numeroTel.trim() === "") {
        trovati["contatto"] = "Serve un numero per risponderti";
      } else if (numeroTel.replace(/\D/g, "").length < cifreMinime(paeseTel)) {
        trovati["contatto"] = "Questo numero sembra incompleto";
      }
    } else if (instagram.trim().replace(/^@/, "") === "") {
      trovati["contatto"] = "Serve il tuo nome su Instagram";
    }

    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    setFatto(true);
  }

  return (
    <>
      <BottoneAzione aspetto="chiaro" pieno onClick={() => setAperto(true)}>
        Candidati
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
            <h2 style={{ "--n": 10 } as CSSProperties}>
              {(fatto ? ["Ricevuta"] : ["Raccontami", "di te"]).map((riga) => (
                <span key={riga} className={stili.riga}>
                  {legaParole(riga, { titolo: true, vedova: false })}
                </span>
              ))}
            </h2>
            <button type="button" className={stili.chiudi} onClick={() => setAperto(false)} aria-label="Chiudi">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden focusable="false">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          </div>

          {fatto ? (
            <>
              <p className={stili.fatto} role="status">
                Ti scrivo io su WhatsApp.
              </p>
              <p className={stili.spiega}>
                {legaParole("Questa è un'anteprima: la candidatura non viene conservata da nessuna parte.", { vedova: true })}
              </p>
            </>
          ) : (
            <form onSubmit={manda} noValidate style={{ display: "grid", gap: 18 }}>
              <p className={stili.spiega}>
                {legaParole("Non serve esperienza. Dimmi chi sei e dove vivi, al resto pensiamo insieme.", { vedova: true })}
              </p>

              <Campo id={`${id}-nome`} etichetta="Nome" valore={nome} cambia={setNome} errore={errori["nome"]} autoComplete="name" />
              <Campo id={`${id}-citta`} etichetta="Città o zona" valore={citta} cambia={setCitta} errore={errori["citta"]} />
              <div className={stili.modi} role="group" aria-label="Come vuoi essere ricontattato">
                {(
                  [
                    ["telefono", "Telefono"],
                    ["instagram", "Instagram"],
                  ] as const
                ).map(([valore, testo]) => (
                  <button
                    key={valore}
                    type="button"
                    className={stili.modo}
                    aria-pressed={modo === valore}
                    onClick={() => {
                      setModo(valore);
                      setErrori((e) => {
                        const { contatto: _tolto, ...resto } = e;
                        return resto;
                      });
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
                  errore={errori["contatto"]}
                  bordo="lieve"
                />
              ) : (
                <Campo
                  id={`${id}-contatto`}
                  etichetta="Instagram"
                  valore={instagram}
                  cambia={setInstagram}
                  errore={errori["contatto"]}
                  segnaposto="@iltuonome"
                />
              )}

              <BottoneAzione aspetto="nero" pieno type="submit">
                Manda la candidatura
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
