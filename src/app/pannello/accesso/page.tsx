"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import stili from "./accesso.module.css";

/**
 * L'ingresso al pannello: una password sola, quella che Luca dà a chi serve.
 *
 * Il disegno prevedeva un PIN a 4 cifre; si è scelto di tenere la password
 * di prima e di far restare dentro chi entra (la sessione dura un anno),
 * quindi qui c'è un campo solo, nello stile nuovo.
 */
export default function Accesso() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  async function entra(evento: FormEvent) {
    evento.preventDefault();

    /*
     * Il campo vuoto lo fermiamo qui: mandarlo al server farebbe consumare
     * uno dei cinque tentativi per una distrazione.
     */
    if (password === "") {
      setErrore("Scrivi la password");
      document.getElementById("password")?.focus();
      return;
    }

    setErrore("");
    setInCorso(true);

    try {
      const risposta = await fetch("/api/pannello/accesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      router.replace("/pannello/richieste");
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a parlare col server");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <main className={stili.pagina}>
      <div className={`lc-fade ${stili.scheda}`}>
        <div className={`lc-pop ${stili.logo}`} aria-hidden>
          LC
        </div>

        <div className={stili.titoli}>
          <h1 className={stili.titolo}>Pannello PR</h1>
          <p className={stili.sotto}>Inserisci la password</p>
        </div>

        <form onSubmit={(e) => void entra(e)} noValidate className={stili.modulo}>
          <label htmlFor="password" className={stili.etichetta}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={errore !== ""}
            aria-describedby={errore === "" ? undefined : "password-errore"}
            className={stili.campo}
          />

          {errore !== "" && (
            <p id="password-errore" role="alert" className={stili.errore}>
              {errore}
            </p>
          )}

          <button type="submit" className={`lc-press ${stili.entra}`} disabled={inCorso}>
            {inCorso ? "Un attimo…" : "Entra"}
          </button>
        </form>
      </div>
    </main>
  );
}
