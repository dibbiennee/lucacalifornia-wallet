"use client";

import { useEffect, useState } from "react";

import { provaNotifica } from "@/app/pannello/azioni";

import { Avviso } from "./Avviso";
import { Pulsante } from "./Pulsante";

type Stato = "non-supportato" | "spente" | "accendo" | "accese" | "negate";

const CHIAVE_PUBBLICA =
  "BHmNceJ6546XttdQ5jmikCt8esWukbohk5CVq_c9VI4kSBIZJO1_KIFeM9GuGdZymbBX7ZxHko6aZK1-1nEw9d8";

/** Il formato che il browser vuole per la chiave: bytes, non base64. */
function chiaveABytes(base64: string): Uint8Array {
  const testo = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const grezzo = window.atob(testo);
  return Uint8Array.from([...grezzo].map((carattere) => carattere.charCodeAt(0)));
}

/**
 * Il pulsante che accende le notifiche push nel telefono di chi lo preme.
 *
 * Un'iscrizione per dispositivo, non per persona: se Luca apre il pannello
 * dal telefono e dal computer, li accende separatamente, e li spegne
 * separatamente.
 */
export function AttivaNotifiche() {
  const [stato, setStato] = useState<Stato>("spente");
  const [avviso, setAvviso] = useState("");
  const [provaInCorso, setProvaInCorso] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStato("non-supportato");
      return;
    }

    if (Notification.permission === "denied") {
      setStato("negate");
      return;
    }

    navigator.serviceWorker.getRegistration("/sw.js").then(async (registrazione) => {
      const iscrizione = await registrazione?.pushManager.getSubscription();
      setStato(iscrizione ? "accese" : "spente");
    });
  }, []);

  async function accendi() {
    setStato("accendo");

    try {
      const permesso = await Notification.requestPermission();
      if (permesso !== "granted") {
        setStato("negate");
        return;
      }

      const registrazione = await navigator.serviceWorker.register("/sw.js");
      const iscrizione = await registrazione.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: chiaveABytes(CHIAVE_PUBBLICA) as BufferSource,
      });

      const risposta = await fetch("/api/pannello/iscrizione-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(iscrizione.toJSON()),
      });

      if (!risposta.ok) {
        throw new Error("salvataggio fallito");
      }

      setStato("accese");
      setAvviso("Notifiche accese su questo telefono.");
    } catch {
      setStato("spente");
      setAvviso("Non sono riuscito ad accenderle. Riprova.");
    }
  }

  async function spegni() {
    try {
      const registrazione = await navigator.serviceWorker.getRegistration("/sw.js");
      const iscrizione = await registrazione?.pushManager.getSubscription();

      if (iscrizione) {
        await fetch("/api/pannello/iscrizione-push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: iscrizione.endpoint }),
        });
        await iscrizione.unsubscribe();
      }

      setStato("spente");
      setAvviso("Notifiche spente su questo telefono.");
    } catch {
      setAvviso("Non sono riuscito a spegnerle. Riprova.");
    }
  }

  async function prova() {
    setProvaInCorso(true);
    try {
      const esito = await provaNotifica();
      setAvviso(esito);
    } catch {
      setAvviso("Non sono riuscito a mandarla. Riprova.");
    } finally {
      setProvaInCorso(false);
    }
  }

  if (stato === "non-supportato") {
    return null;
  }

  if (stato === "negate") {
    return <p className="testo-piccolo">Le notifiche sono bloccate per questo sito nelle impostazioni del telefono.</p>;
  }

  return (
    <div>
      {stato === "accese" ? (
        <>
          <Pulsante aspetto="vuoto" piccolo onClick={spegni}>
            Spegni le notifiche
          </Pulsante>{" "}
          <Pulsante aspetto="vuoto" piccolo disabled={provaInCorso} onClick={prova}>
            {provaInCorso ? "Mando..." : "Manda una prova"}
          </Pulsante>
        </>
      ) : (
        <Pulsante aspetto="pieno" piccolo disabled={stato === "accendo"} onClick={accendi}>
          {stato === "accendo" ? "Accendo..." : "Accendi le notifiche"}
        </Pulsante>
      )}
      <Avviso testo={avviso} chiudi={() => setAvviso("")} />
    </div>
  );
}
