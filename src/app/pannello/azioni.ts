"use server";

import { revalidatePath } from "next/cache";

import {
  aggiornaStato,
  aggiungiOspite,
  aggiungiPr,
  impostaEtichetta,
  pubblicaPacchetti,
  type EtichettaSerata,
  type StatoRichiesta,
} from "@/lib/pannello/dati";
import { sessioneAperta } from "@/lib/pannello/sessione";
import { avvisaTutti } from "@/lib/push";

/**
 * Le azioni del pannello.
 *
 * Ognuna controlla la sessione prima di fare qualsiasi cosa. Non è una
 * ripetizione inutile del controllo che sta nel layout: una Server Action è
 * un indirizzo come un altro, e chi la chiama da fuori non passa da nessuna
 * pagina.
 *
 * Il lavoro vero lo fanno le funzioni di dati.ts, che resta l'unico posto da
 * cui i dati entrano ed escono.
 */

async function dentro(): Promise<void> {
  if (!(await sessioneAperta())) {
    throw new Error("Non autorizzato");
  }
}

const TESTI: Readonly<Record<StatoRichiesta, string>> = {
  nuova: "Rimessa fra le nuove.",
  confermata: "Confermata.",
  "in attesa": "Segnata in attesa.",
  rifiutata: "Richiesta rifiutata.",
};

export async function cambiaStato(id: string, stato: StatoRichiesta): Promise<string> {
  await dentro();
  await aggiornaStato(id, stato);

  // Cambia il numero sulla scheda "Richieste", quindi si aggiorna tutto il gruppo.
  revalidatePath("/pannello", "layout");

  return TESTI[stato];
}

export async function cambiaEtichetta(
  codice: string,
  etichetta: EtichettaSerata,
  nomeSerata: string,
): Promise<string> {
  await dentro();
  impostaEtichetta(codice, etichetta);
  revalidatePath("/pannello/serate");

  /*
   * Finché non c'è il database la scelta non arriva davvero al sito, e il
   * messaggio lo dice: promettere "Sul sito ora" sarebbe una bugia.
   */
  return `Anteprima: la scelta non è ancora salvata. ${nomeSerata}, ${etichetta.toLowerCase()}.`;
}

export async function nuovoOspite(nome: string): Promise<string> {
  await dentro();
  const quanti = aggiungiOspite(nome);
  revalidatePath("/pannello/serate");

  return `Anteprima: con il database, ${quanti} persone riceverebbero l'avviso.`;
}

export async function pubblica(): Promise<string> {
  await dentro();
  const quanti = pubblicaPacchetti();
  revalidatePath("/pannello/serate");

  return `Anteprima: con il database, ${quanti} persone riceverebbero l'avviso.`;
}

export async function nuovoPr(nome: string): Promise<string> {
  await dentro();
  const pr = aggiungiPr(nome);
  revalidatePath("/pannello/squadra");

  return `Link creato: ${pr.link}`;
}

/** Manda una notifica di prova a tutti i telefoni iscritti, per verificare che arrivi. */
export async function provaNotifica(): Promise<string> {
  await dentro();
  await avvisaTutti("Prova", "Se leggi questa, le notifiche funzionano.", "/pannello/richieste");

  return "Notifica di prova mandata.";
}
