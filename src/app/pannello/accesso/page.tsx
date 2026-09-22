"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/** L'ingresso al pannello: una password sola, quella che Luca dà a chi serve. */
export default function Accesso() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  async function entra(evento: FormEvent) {
    evento.preventDefault();
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

      router.replace("/pannello");
      router.refresh();
    } catch {
      setErrore("Non sono riuscito a parlare col server");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <main className="pannello-accesso">
      <form onSubmit={(e) => void entra(e)} noValidate>
        <p className="pannello-occhiello">PANNELLO</p>
        <h1 className="pannello-titolo">Entra</h1>

        <label htmlFor="password" className="etichetta-campo" style={{ marginTop: "2rem" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="pannello-campo"
          aria-invalid={errore !== ""}
          aria-describedby={errore === "" ? undefined : "errore-accesso"}
        />

        {errore !== "" && (
          <p id="errore-accesso" role="alert" className="pannello-errore">
            {errore}
          </p>
        )}

        <button type="submit" className="bottone" disabled={inCorso} style={{ width: "100%", marginTop: "1.5rem" }}>
          {inCorso ? "Un attimo..." : "Entra"}
        </button>
      </form>
    </main>
  );
}
