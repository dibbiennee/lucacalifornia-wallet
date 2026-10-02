"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cambiaStatoLista } from "@/app/pannello/azioni";
import type { StatoAttesa } from "@/lib/lista-attesa";

import stili from "./Attesa.module.css";
import { useToast } from "./Toast";

/**
 * I due gesti su una persona in lista: "Avvisata" (le ho scritto) e "Chiudi"
 * (non serve più). Il flusso lo decide il server (STATI_PRECEDENTI in
 * lista-attesa.ts): qui si mostrano solo i pulsanti che hanno senso per lo
 * stato di adesso, e se la lista è cambiata da un'altra scheda il server lo
 * dice e la pagina si ricarica.
 */
export function AzioniAttesa({ id, stato }: { readonly id: string; readonly stato: StatoAttesa }) {
  const router = useRouter();
  const toast = useToast();
  const [lavoro, setLavoro] = useState(false);

  async function segna(verso: "avvisata" | "chiusa") {
    if (lavoro) {
      return;
    }

    setLavoro(true);

    try {
      const esito = await cambiaStatoLista(id, verso);
      toast(esito.messaggio);
      // Anche se non è riuscito: lo stato vero può essere cambiato da un'altra scheda.
      router.refresh();
    } catch {
      toast("Non sono riuscito a cambiare lo stato");
    } finally {
      setLavoro(false);
    }
  }

  if (stato === "chiusa") {
    return null;
  }

  return (
    <>
      {stato === "in attesa" && (
        <button type="button" className={`lc-press ${stili.azione}`} disabled={lavoro} onClick={() => void segna("avvisata")}>
          Segna avvisata
        </button>
      )}
      <button type="button" className={`lc-press ${stili.azione}`} disabled={lavoro} onClick={() => void segna("chiusa")}>
        Chiudi
      </button>
    </>
  );
}
