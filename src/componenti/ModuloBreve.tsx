"use client";

import { useId, useRef, useState, type CSSProperties, type FormEvent } from "react";

/**
 * Il modulo corto che si apre sotto un pulsante: lista d'attesa e navetta.
 *
 * Si apre lì dov'è invece di aprire una finestra sopra la pagina: su un
 * telefono una finestra va chiusa, intrappola il fuoco e copre quello che si
 * stava leggendo. Qui si espande, si compila e si chiude da sola con la
 * conferma, senza ricaricare niente.
 */

export interface CampoBreve {
  readonly nome: string;
  readonly etichetta: string;
  readonly tipo?: "tel" | "text";
  readonly obbligatorio: boolean;
  readonly segnaposto?: string;
  readonly opzioni?: readonly string[];
}

const campoStile: CSSProperties = {
  width: "100%",
  minHeight: "3.2rem",
  padding: "0 1rem",
  border: "2px solid rgba(255,255,255,0.4)",
  background: "transparent",
  color: "#fff",
  fontSize: "1rem",
  fontFamily: "inherit",
};

export function ModuloBreve({
  azione,
  etichettaBottone,
  titoloModulo,
  campi,
  corpoFisso,
  conferma,
  bottonePieno = false,
}: {
  readonly azione: string;
  readonly etichettaBottone: string;
  readonly titoloModulo: string;
  readonly campi: readonly CampoBreve[];
  readonly corpoFisso?: Readonly<Record<string, string>>;
  readonly conferma: string;
  readonly bottonePieno?: boolean;
}) {
  const id = useId();
  const primo = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const [aperto, setAperto] = useState(false);
  const [valori, setValori] = useState<Record<string, string>>({});
  const [errori, setErrori] = useState<Record<string, string>>({});
  const [problema, setProblema] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [fatto, setFatto] = useState(false);

  function apri() {
    setAperto(true);
    window.setTimeout(() => primo.current?.focus(), 30);
  }

  function valore(nome: string): string {
    return valori[nome] ?? "";
  }

  async function invia(evento: FormEvent) {
    evento.preventDefault();
    setProblema("");

    const trovati: Record<string, string> = {};

    for (const campo of campi) {
      const v = valore(campo.nome).trim();

      if (campo.obbligatorio && v === "") {
        trovati[campo.nome] = `Manca ${campo.etichetta.toLowerCase()}`;
      } else if (campo.tipo === "tel" && v !== "" && v.replace(/\D/g, "").length < 9) {
        trovati[campo.nome] = "Questo numero sembra incompleto";
      }
    }

    setErrori(trovati);

    if (Object.keys(trovati).length > 0) {
      document.getElementById(`${id}-${Object.keys(trovati)[0]}`)?.focus();
      return;
    }

    setInCorso(true);

    try {
      const risposta = await fetch(azione, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...corpoFisso, ...valori }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setProblema(d.errore ?? "Non ha funzionato, riprova");
        return;
      }

      setFatto(true);
    } catch {
      setProblema("Non sono riuscito a mandare la richiesta, riprova");
    } finally {
      setInCorso(false);
    }
  }

  if (fatto) {
    return (
      <div role="status">
        <p style={{ margin: 0, fontWeight: 700 }}>{conferma}</p>
        <p className="debole" style={{ margin: "0.4rem 0 0", fontSize: "0.875rem" }}>
          Anteprima del sito: il contatto non viene conservato.
        </p>
      </div>
    );
  }

  if (!aperto) {
    return (
      <button
        type="button"
        onClick={apri}
        className={`bottone${bottonePieno ? "" : " bottone-vuoto"}`}
        aria-expanded={false}
        aria-controls={`${id}-modulo`}
      >
        {etichettaBottone}
      </button>
    );
  }

  return (
    <form id={`${id}-modulo`} onSubmit={(e) => void invia(e)} noValidate>
      <p className="etichetta-campo" style={{ marginBottom: "1rem" }}>
        {titoloModulo}
      </p>

      {campi.map((campo, i) => {
        const idCampo = `${id}-${campo.nome}`;
        const errore = errori[campo.nome];

        return (
          <div key={campo.nome} style={{ marginBottom: "1.1rem" }}>
            <label htmlFor={idCampo} className="etichetta-campo">
              {campo.etichetta}
            </label>

            {campo.opzioni === undefined ? (
              <input
                id={idCampo}
                ref={i === 0 ? (e) => { primo.current = e; } : undefined}
                value={valore(campo.nome)}
                onChange={(e) => setValori({ ...valori, [campo.nome]: e.target.value })}
                style={{ ...campoStile, borderColor: errore === undefined ? "rgba(255,255,255,0.4)" : "#FFC2D1" }}
                aria-invalid={errore !== undefined}
                aria-describedby={errore === undefined ? undefined : `${idCampo}-errore`}
                {...(campo.tipo === "tel" ? { inputMode: "tel" as const, autoComplete: "tel" } : {})}
                {...(campo.segnaposto === undefined ? {} : { placeholder: campo.segnaposto })}
              />
            ) : (
              <select
                id={idCampo}
                ref={i === 0 ? (e) => { primo.current = e; } : undefined}
                value={valore(campo.nome)}
                onChange={(e) => setValori({ ...valori, [campo.nome]: e.target.value })}
                style={campoStile}
              >
                {campo.opzioni.map((opzione) => (
                  <option key={opzione} value={opzione} style={{ color: "#140C5C" }}>
                    {opzione}
                  </option>
                ))}
              </select>
            )}

            {errore !== undefined && (
              <p id={`${idCampo}-errore`} role="alert" style={{ margin: "0.5rem 0 0", color: "#FFC2D1", fontSize: "0.9375rem" }}>
                {errore}
              </p>
            )}
          </div>
        );
      })}

      {problema !== "" && (
        <p role="alert" style={{ color: "#FFC2D1", margin: "0 0 1rem" }}>
          {problema}
        </p>
      )}

      <button type="submit" className="bottone" disabled={inCorso} style={{ width: "100%", opacity: inCorso ? 0.6 : 1 }}>
        {inCorso ? "Un attimo..." : "Invia"}
      </button>
    </form>
  );
}
