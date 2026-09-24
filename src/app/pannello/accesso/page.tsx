"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Campo } from "@/componenti/pannello/Campo";
import { Pulsante } from "@/componenti/pannello/Pulsante";
import { Testata } from "@/componenti/pannello/Testata";

/** L'ingresso al pannello: una password sola, quella che Luca dà a chi serve. */
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
    <main className="pagina senza-barra pagina-accesso">
      <Testata occhiello="Pannello" titolo="Entra" />

      <form onSubmit={(e) => void entra(e)} noValidate className="sezione">
        <Campo
          id="password"
          etichetta="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          errore={errore}
        />

        <Pulsante type="submit" disabled={inCorso}>
          {inCorso ? "Un attimo..." : "Entra"}
        </Pulsante>
      </form>
    </main>
  );
}
