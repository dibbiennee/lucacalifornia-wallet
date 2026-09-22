"use client";

import { useState } from "react";

/** Il link personale del PR, con il tasto per copiarlo. */
export function CopiaLink({ link }: { readonly link: string }) {
  const [copiato, setCopiato] = useState(false);

  async function copia() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopiato(true);
      window.setTimeout(() => setCopiato(false), 2000);
    } catch {
      setCopiato(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
      <code style={{ fontSize: "0.8125rem", color: "var(--testo-debole)", wordBreak: "break-all" }}>{link}</code>
      <button type="button" onClick={() => void copia()} className="scelta" style={{ minHeight: "2.5rem", padding: "0 0.9rem", fontSize: "0.8125rem" }}>
        {copiato ? "Copiato" : "Copia"}
      </button>
    </div>
  );
}
