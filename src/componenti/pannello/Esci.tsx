"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import stili from "./Testata.module.css";

/**
 * Il modo di uscire dal pannello.
 *
 * Prima non c'era: la sessione dura dodici ore e l'unico modo di chiuderla
 * era aspettare o cambiare la password. Su un telefono che gira fra le mani
 * in una serata, è poco.
 */
export function Esci() {
  const router = useRouter();
  const [inCorso, setInCorso] = useState(false);

  async function esci() {
    setInCorso(true);

    try {
      await fetch("/api/pannello/esci", { method: "POST" });
    } finally {
      // Anche se la chiamata fallisce si torna all'accesso: il layout
      // ricontrolla la sessione e rimanda qui chi è ancora dentro.
      router.replace("/pannello/accesso");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className={stili.azione}
      onClick={() => void esci()}
      disabled={inCorso}
    >
      {inCorso ? "Esco..." : "Esci"}
    </button>
  );
}
