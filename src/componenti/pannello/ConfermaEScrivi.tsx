"use client";

import { useState } from "react";

/**
 * Il gesto che chiude la richiesta.
 *
 * Non manda niente da solo: prepara il biglietto vero e apre WhatsApp col
 * messaggio già scritto. È una regola del brief, ogni messaggio al cliente
 * parte da Luca.
 *
 * Il biglietto è quello vero: la rotta /api/conferma crea il token cifrato e
 * restituisce il link al .pkpass, lo stesso che il cliente aggiunge al
 * Wallet. Questa è l'unica parte del pannello che non è di esempio.
 */
export function ConfermaEScrivi({
  nome,
  telefono,
  serata,
  sala,
  tipo,
  giaConfermata,
  inviatoAlle,
}: {
  readonly nome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly sala?: string;
  readonly tipo: string;
  readonly giaConfermata: boolean;
  readonly inviatoAlle?: string;
}) {
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [fatto, setFatto] = useState<{ linkWhatsapp: string; linkBiglietto: string } | null>(null);

  async function conferma() {
    setErrore("");
    setInCorso(true);

    try {
      // La serata di prova è la prossima domenica alle 23:30: senza database
      // non c'è una data vera da cui partire.
      const inizio = new Date();
      inizio.setHours(23, 30, 0, 0);
      inizio.setDate(inizio.getDate() + ((7 - inizio.getDay()) % 7 || 7));

      const risposta = await fetch("/api/conferma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeCliente: nome,
          telefono,
          serata: serata.toUpperCase(),
          inizioSerata: inizio.toISOString(),
          tipo,
          locale: "room26",
          ...(sala === undefined ? {} : { sala }),
        }),
      });

      if (!risposta.ok) {
        const d = (await risposta.json()) as { errore?: string };
        setErrore(d.errore ?? "Non ha funzionato");
        return;
      }

      setFatto((await risposta.json()) as { linkWhatsapp: string; linkBiglietto: string });
    } catch {
      setErrore("Non sono riuscito a preparare il biglietto");
    } finally {
      setInCorso(false);
    }
  }

  if (fatto !== null) {
    return (
      <section style={{ marginTop: "2rem" }} role="status">
        <p style={{ fontWeight: 700, margin: "0 0 1rem" }}>Biglietto pronto.</p>
        <a href={fatto.linkWhatsapp} className="bottone" style={{ width: "100%", background: "#25D366", color: "#04250f", marginBottom: "0.8rem" }}>
          Apri WhatsApp col messaggio
        </a>
        <a href={fatto.linkBiglietto} className="bottone bottone-vuoto" style={{ width: "100%" }}>
          Guarda il biglietto
        </a>
      </section>
    );
  }

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 className="etichetta-campo">Quando confermi</h2>
      <p className="debole" style={{ margin: "0 0 1.2rem", fontSize: "0.9375rem" }}>
        Si apre WhatsApp con il messaggio già scritto e il link al biglietto da aggiungere al
        Wallet. Niente parte da solo.
      </p>

      {giaConfermata && inviatoAlle !== undefined && (
        <p className="debole" style={{ margin: "0 0 1rem", fontSize: "0.875rem" }}>
          Biglietto già inviato alle {inviatoAlle}.
        </p>
      )}

      {errore !== "" && (
        <p role="alert" className="pannello-errore" style={{ margin: "0 0 1rem" }}>
          {errore}
        </p>
      )}

      <button onClick={() => void conferma()} disabled={inCorso} className="bottone" style={{ width: "100%", opacity: inCorso ? 0.6 : 1 }}>
        {inCorso ? "Preparo il biglietto..." : giaConfermata ? "Rimanda il biglietto" : "Conferma e scrivi"}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.8rem" }}>
        <button type="button" className="scelta">
          In attesa
        </button>
        <button type="button" className="scelta">
          Rifiuta
        </button>
      </div>
    </section>
  );
}
