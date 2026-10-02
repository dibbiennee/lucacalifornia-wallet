"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import stili from "./accesso.module.css";

/**
 * L'ingresso al pannello, per due tipi di persona.
 *
 * - Luca entra con la sua password, e basta: un campo solo, come sempre.
 * - Un PR entra con il suo nome (quello del suo link) e la password che gli
 *   ha dato Luca. Per non complicare l'ingresso di Luca il campo "nome" sta
 *   dietro a "Sei un PR?", e di solito non si vede.
 *
 * Dopo l'accesso si va sempre a /pannello: è il server a decidere dove porta
 * (le richieste per Luca, la home per un PR), perché è lui a sapere chi sei.
 * La sessione dura un anno: chi entra una volta resta dentro.
 */
export default function Accesso() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [comePr, setComePr] = useState(false);
  const [nome, setNome] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  async function entra(evento: FormEvent) {
    evento.preventDefault();

    /*
     * Il campo vuoto lo fermiamo qui: mandarlo al server farebbe consumare
     * uno dei cinque tentativi per una distrazione.
     */
    if (comePr && nome.trim() === "") {
      setErrore("Scrivi il tuo nome");
      document.getElementById("nome")?.focus();
      return;
    }

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
        body: JSON.stringify(comePr ? { codice: nome.trim(), password } : { password }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      router.replace("/pannello");
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
          <h1 className={stili.titolo}>{comePr ? "Area PR" : "Pannello PR"}</h1>
          <p className={stili.sotto}>{comePr ? "Nome e password che ti ha dato Luca" : "Inserisci la password"}</p>
        </div>

        <form onSubmit={(e) => void entra(e)} noValidate className={stili.modulo}>
          {comePr && (
            <>
              <label htmlFor="nome" className={stili.etichetta}>
                Il tuo nome
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={errore !== ""}
                className={stili.campo}
              />
            </>
          )}

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

          <button
            type="button"
            className={stili.cambia}
            onClick={() => {
              setComePr((c) => !c);
              setErrore("");
              setPassword("");
            }}
          >
            {comePr ? "Sono Luca" : "Sei un PR? Entra con il tuo nome"}
          </button>
        </form>
      </div>
    </main>
  );
}
