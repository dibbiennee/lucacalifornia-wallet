import type { CodiceMotivo } from "./motivi";

/**
 * I messaggi WhatsApp che Luca prepara dalla richiesta.
 *
 * Funzioni pure: li usa il server (la conferma, che ha il link al biglietto) e il
 * browser (il rifiuto, che non ne ha bisogno). Nessun messaggio parte da solo:
 * il pannello costruisce il link wa.me verso il numero del CLIENTE con il testo già
 * scritto, e Luca lo vede in WhatsApp e preme lui "Invia".
 *
 * Un testo per ogni tipo di conferma (tavolo, lista, bracciale, navetta) e uno per il
 * rifiuto, che può dire il motivo. Per una richiesta "in attesa" non c'è nessun
 * messaggio preimpostato. Il bracciale ha lo stesso testo per donna e uomo: il prezzo,
 * che cambia per notte e per genere, non è nel messaggio.
 */

export type TipoMessaggio = "tavolo" | "lista" | "braccialetto" | "navetta";

/** Come si dice il motivo di un rifiuto al cliente. "Altro motivo" non dice niente: il rifiuto resta senza spiegazione. */
export const FRASE_MOTIVO: Readonly<Record<CodiceMotivo, string | null>> = {
  completa: "la serata è al completo",
  tavoli_esauriti: "i tavoli sono esauriti",
  lista_chiusa: "la lista è chiusa",
  gruppo: "il gruppo non è adatto alla serata",
  dati: "i dati che ci hai lasciato non risultano validi",
  altro: null,
};

export interface DatiConferma {
  readonly nome: string;
  readonly tipo: TipoMessaggio;
  /** Il nome della serata come si scrive sul biglietto: "INTERNATIONAL". */
  readonly serata: string;
  /** "sabato 3 ottobre". Manca per la navetta, che sceglie solo il giorno della settimana. */
  readonly data: string | null;
  /** Solo per la navetta: da dove parte. */
  readonly zona?: string | undefined;
  /** Il link al biglietto Wallet. Null per la navetta, che non ha il biglietto. */
  readonly linkBiglietto: string | null;
}

const PER_DATA = (data: string | null): string => (data === null ? "" : ` di ${data}`);

export function messaggioConferma(d: DatiConferma): string {
  const biglietto = `Questo è il tuo biglietto, puoi aggiungerlo al Wallet:\n${d.linkBiglietto ?? ""}`;

  switch (d.tipo) {
    case "tavolo":
      return `Ciao ${d.nome}, il tuo tavolo per ${d.serata}${PER_DATA(d.data)} è confermato.\n${biglietto}\nPer i dettagli del tavolo ti scrivo io.`;
    case "lista":
      return `Ciao ${d.nome}, sei in lista per ${d.serata}${PER_DATA(d.data)}.\n${biglietto}\nAll'ingresso mostralo se ti viene richiesto.`;
    case "braccialetto":
      return `Ciao ${d.nome}, il tuo bracciale per ${d.serata}${PER_DATA(d.data)} è confermato.\n${biglietto}\nAll'ingresso mostralo se ti viene richiesto.`;
    case "navetta":
      return `Ciao ${d.nome}, la tua navetta per ${d.serata}${PER_DATA(d.data)} è confermata.${d.zona === undefined || d.zona === "" ? "" : ` Parti da ${d.zona}.`}\nTi scrivo qui orario e punto di ritrovo.`;
  }
}

export interface DatiRifiuto {
  readonly nome: string;
  readonly serata: string;
  readonly data: string | null;
  readonly motivo?: CodiceMotivo | undefined;
}

export function messaggioRifiuto(d: DatiRifiuto): string {
  const frase = d.motivo === undefined ? null : FRASE_MOTIVO[d.motivo];

  return `Ciao ${d.nome}, per ${d.serata}${PER_DATA(d.data)} purtroppo non riesco a confermarti${frase === null ? "" : `: ${frase}`}.\nGrazie per averci scritto.`;
}

/** Da un telefono scritto come capita a quello che vuole wa.me (con il 39). Null se non è un numero. */
export function numeroPerWhatsapp(telefono: string): string | null {
  const cifre = telefono.replace(/\D/g, "");

  if (cifre.length < 9 || cifre.length > 15) {
    return null;
  }

  return cifre.startsWith("39") ? cifre : `39${cifre}`;
}

/** Il link che apre WhatsApp verso quel numero con quel testo già scritto. Non invia niente. */
export function linkWhatsapp(telefono: string, testo: string): string | null {
  const numero = numeroPerWhatsapp(telefono);
  return numero === null ? null : `https://wa.me/${numero}?text=${encodeURIComponent(testo)}`;
}
