"use server";

import { revalidatePath } from "next/cache";

import { aggiungiPr, cambiaCodicePr, impostaAttivoPr, rigeneraAccessoPr, transizione } from "@/lib/pannello/dati";
import { eMotivoRifiuto } from "@/lib/pannello/motivi";
import { richiediOwner, richiediSessione } from "@/lib/pannello/sessione";
import { avvisaTutti } from "@/lib/push";
import { eDataIso, eEventoSpeciale, eStatoAttesa, type StatoAttesa } from "@/lib/lista-attesa";
import { cambiaStatoAttesa, impostaDataEventoSpeciale } from "@/lib/pannello/attesa";
import { caricaElenco, type DatasetElenco } from "@/lib/pannello/elenco";
import { filtriDaOggetto } from "@/lib/pannello/filtri-richieste";

/**
 * Le azioni del pannello.
 *
 * Ognuna controlla chi la chiama prima di fare qualsiasi cosa. Non è una
 * ripetizione inutile del controllo che sta nel layout: una Server Action è
 * un indirizzo come un altro, e chi la chiama da fuori non passa da nessuna
 * pagina.
 *
 * Tutto quello che cambia qualcosa è solo di Luca (richiediOwner): decidere
 * una richiesta, creare o spegnere un PR, rigenerare una password, cambiare
 * un codice, mandare notifiche, cambiare lo stato in lista d'attesa. Un PR
 * può solo leggere ciò che è suo, e non ha nessuna azione qui dentro.
 *
 * Il lavoro vero lo fanno le funzioni di dati.ts, che resta l'unico posto da
 * cui i dati entrano ed escono.
 */

/** Gli unici passaggi che si fanno da qui. La conferma no: passa da /api/conferma, che prepara anche il biglietto. */
export type StatoScelto = "in attesa" | "rifiutata";

const TESTI: Readonly<Record<StatoScelto, string>> = {
  "in attesa": "Rimessa in attesa.",
  rifiutata: "Richiesta rifiutata.",
};

export interface EsitoCambio {
  readonly ok: boolean;
  /** Da mostrare così com'è a chi ha premuto il pulsante. */
  readonly messaggio: string;
}

/**
 * Il passaggio di stato: solo Luca, su qualsiasi richiesta, anche per cambiare
 * una decisione già presa. Rifiutare chiede un motivo dell'elenco fisso.
 *
 * Non lancia errori per i casi normali (una richiesta cambiata da un'altra
 * scheda, una che non esiste): restituisce ok: false con una frase. La regola
 * vera sta in dati.ts, non nella pagina.
 */
export async function cambiaStato(id: string, stato: StatoScelto, motivo?: string): Promise<EsitoCambio> {
  const sessione = await richiediOwner();

  if (stato !== "in attesa" && stato !== "rifiutata") {
    return { ok: false, messaggio: "Passaggio non consentito da qui." };
  }

  if (stato === "rifiutata" && !eMotivoRifiuto(motivo)) {
    return { ok: false, messaggio: "Scegli il motivo del rifiuto." };
  }

  const esito = await transizione(sessione, id, stato, eMotivoRifiuto(motivo) ? motivo : undefined);

  if (!esito.ok) {
    return {
      ok: false,
      messaggio:
        esito.motivo === "inesistente"
          ? "Richiesta non trovata."
          : esito.motivo === "serve_motivo"
            ? "Scegli il motivo del rifiuto."
            : stato === "rifiutata"
              ? "Questa richiesta è già rifiutata con questo motivo."
              : "Questa richiesta è già in attesa.",
    };
  }

  // Cambia il numero sulla scheda "Richieste", quindi si aggiorna tutto il gruppo.
  revalidatePath("/pannello", "layout");

  return { ok: true, messaggio: TESTI[stato] };
}

/** Quello che Luca deve dare al PR: il link e le credenziali. La password si vede qui, una volta, e non si può rileggere. */
export interface CredenzialiPr {
  readonly nome: string;
  readonly link: string;
  /** Il "nome utente" con cui il PR entra: la parte finale del suo link. */
  readonly codice: string;
  readonly password: string;
}

export async function nuovoPr(nome: string): Promise<CredenzialiPr> {
  await richiediOwner();
  const { pr, password } = await aggiungiPr(nome);
  revalidatePath("/pannello/squadra");

  return { nome: pr.nome, link: pr.link, codice: pr.codice, password };
}

/**
 * Una password nuova per un PR (anche per chi non ne aveva ancora una).
 * La vecchia smette di valere e le sessioni aperte di quel PR si chiudono.
 */
export async function rigeneraPassword(prId: string): Promise<CredenzialiPr> {
  await richiediOwner();
  const { pr, password } = await rigeneraAccessoPr(prId);
  revalidatePath("/pannello/squadra");

  return { nome: pr.nome, link: pr.link, codice: pr.codice, password };
}

/** Spegne un PR: il suo link e il suo accesso smettono di funzionare, lo storico resta. */
export async function spegniPr(prId: string): Promise<EsitoCambio> {
  await richiediOwner();
  const fatto = await impostaAttivoPr(prId, false);
  revalidatePath("/pannello", "layout");

  return fatto ? { ok: true, messaggio: "PR disattivato. Link e accesso non funzionano più." } : { ok: false, messaggio: "PR non trovato." };
}

/** Riaccende un PR spento: link e accesso tornano a funzionare (con la password che aveva). */
export async function riaccendiPr(prId: string): Promise<EsitoCambio> {
  await richiediOwner();
  const fatto = await impostaAttivoPr(prId, true);
  revalidatePath("/pannello", "layout");

  return fatto ? { ok: true, messaggio: "PR riattivato." } : { ok: false, messaggio: "PR non trovato." };
}

const MESSAGGI_CODICE = {
  inesistente: "PR non trovato.",
  non_valido: "Il codice deve avere da 2 a 30 tra lettere e cifre.",
  riservato: "Questo codice è una pagina del sito: scegline un altro.",
  occupato: "Questo codice ce l'ha già un altro PR.",
} as const;

/** Cambia il codice di un PR, cioè la fine del suo link e il suo nome per entrare. Il vecchio link smette di funzionare. */
export async function cambiaCodice(prId: string, codice: string): Promise<EsitoCambio & { readonly codice?: string }> {
  await richiediOwner();
  const esito = await cambiaCodicePr(prId, codice);

  if (!esito.ok) {
    return { ok: false, messaggio: MESSAGGI_CODICE[esito.motivo] };
  }

  revalidatePath("/pannello", "layout");
  return { ok: true, messaggio: "Codice cambiato. Il vecchio link non funziona più.", codice: esito.codice };
}

/** Manda una notifica di prova a tutti i telefoni iscritti, per verificare che arrivi. */
export async function provaNotifica(): Promise<string> {
  await richiediOwner();
  await avvisaTutti("Prova", "Se leggi questa, le notifiche funzionano.", "/pannello/richieste");

  return "Notifica di prova mandata.";
}

/* ------------------------------ lista d'attesa ------------------------------ */

const TESTI_ATTESA: Readonly<Record<StatoAttesa, string>> = {
  "in attesa": "Rimessa in attesa.",
  avvisata: "Segnata come avvisata.",
  chiusa: "Chiusa.",
};

const NON_VALIDA_ATTESA: Readonly<Record<StatoAttesa, string>> = {
  "in attesa": "Questa persona è ancora in attesa.",
  avvisata: "Questa persona è già stata avvisata.",
  chiusa: "Questa persona è già stata chiusa e non si può più cambiare.",
};

/**
 * Il passaggio di stato di una persona in lista: solo Luca, come per le
 * richieste. Per i casi normali non lancia errori, risponde ok: false con una
 * frase.
 */
export async function cambiaStatoLista(id: string, stato: string): Promise<EsitoCambio> {
  const sessione = await richiediOwner();

  if (!eStatoAttesa(stato) || stato === "in attesa") {
    return { ok: false, messaggio: "Passaggio non consentito da qui." };
  }

  const esito = await cambiaStatoAttesa(sessione, id, stato);

  if (!esito.ok) {
    return {
      ok: false,
      messaggio: esito.motivo === "inesistente" ? "Persona non trovata." : NON_VALIDA_ATTESA[esito.statoAttuale],
    };
  }

  revalidatePath("/pannello", "layout");

  return { ok: true, messaggio: TESTI_ATTESA[stato] };
}

/**
 * La data di un evento speciale (o nessuna, con testo vuoto). Solo Luca: un PR
 * non decide le date, e la funzione di dati lo ricontrolla.
 */
export async function impostaDataEvento(codice: string, data: string): Promise<EsitoCambio> {
  await richiediOwner();

  if (!eEventoSpeciale(codice)) {
    return { ok: false, messaggio: "Evento sconosciuto." };
  }

  const pulita = data.trim();

  if (pulita !== "" && !eDataIso(pulita)) {
    return { ok: false, messaggio: "La data non è valida." };
  }

  const sessione = await richiediSessione();
  await impostaDataEventoSpeciale(sessione, codice, pulita === "" ? null : pulita);
  revalidatePath("/pannello/attesa");

  return { ok: true, messaggio: pulita === "" ? "Data tolta." : "Data salvata." };
}

/* ------------------------------ elenco richieste ------------------------------ */

/**
 * Una pagina dell'elenco richieste con i filtri scelti nel browser.
 *
 * I filtri arrivano dal browser e si ripuliscono qui (filtriDaOggetto scarta
 * ogni valore sbagliato), poi si applicano NELLA QUERY, nell'ambito di chi
 * chiede: Luca vede tutto, un PR solo le sue. Il browser non decide mai cosa
 * può vedere: manda dei filtri, il server li incrocia con la sessione.
 */
export async function cercaRichieste(filtri: unknown, offset: number): Promise<DatasetElenco> {
  const sessione = await richiediSessione();
  const da = Number.isFinite(offset) && offset > 0 ? Math.min(Math.trunc(offset), 100_000) : 0;

  return caricaElenco(sessione, filtriDaOggetto(filtri), da);
}
