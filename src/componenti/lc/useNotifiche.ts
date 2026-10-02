"use client";

import { useCallback, useEffect, useState } from "react";

import { provaNotifica } from "@/app/pannello/azioni";

import { useToast } from "./Toast";

export type StatoNotifiche = "non-supportato" | "spente" | "accendo" | "accese" | "negate";

const CHIAVE_PUBBLICA =
  "BHmNceJ6546XttdQ5jmikCt8esWukbohk5CVq_c9VI4kSBIZJO1_KIFeM9GuGdZymbBX7ZxHko6aZK1-1nEw9d8";

/** Il formato che il browser vuole per la chiave: bytes, non base64. */
function chiaveABytes(base64: string): Uint8Array {
  const testo = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const grezzo = window.atob(testo);
  return Uint8Array.from([...grezzo].map((carattere) => carattere.charCodeAt(0)));
}

/**
 * Le notifiche push di questo dispositivo: accendere, spegnere, mandare una
 * prova. È la stessa logica di prima (AttivaNotifiche), spostata in un hook
 * perché adesso la usano tre punti dello stesso guscio: la campanella in
 * testata, il menu e la barra laterale. Un'istanza sola, un solo stato.
 *
 * Un'iscrizione per dispositivo, non per persona: se Luca apre il pannello
 * dal telefono e dal computer, li accende e li spegne separatamente.
 */
export function useNotifiche() {
  const toast = useToast();
  const [stato, setStato] = useState<StatoNotifiche>("spente");
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

  const accendi = useCallback(async () => {
    setStato("accendo");

    try {
      const permesso = await Notification.requestPermission();
      if (permesso !== "granted") {
        setStato("negate");
        toast("Notifiche bloccate nelle impostazioni");
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
      toast("Notifiche attive");
    } catch {
      setStato("spente");
      toast("Non sono riuscito ad accenderle");
    }
  }, [toast]);

  const spegni = useCallback(async () => {
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
      toast("Notifiche spente");
    } catch {
      toast("Non sono riuscito a spegnerle");
    }
  }, [toast]);

  const alterna = useCallback(async () => {
    if (stato === "accese") {
      await spegni();
    } else if (stato === "spente") {
      await accendi();
    } else if (stato === "negate") {
      toast("Sono bloccate nelle impostazioni del telefono");
    }
  }, [stato, accendi, spegni, toast]);

  const prova = useCallback(async () => {
    setProvaInCorso(true);
    try {
      toast(await provaNotifica());
    } catch {
      toast("Non sono riuscito a mandarla");
    } finally {
      setProvaInCorso(false);
    }
  }, [toast]);

  return { stato, accese: stato === "accese", provaInCorso, alterna, prova };
}
