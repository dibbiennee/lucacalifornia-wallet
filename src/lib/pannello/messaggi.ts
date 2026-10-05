import { LOCALE } from "@/contenuti/sito";
import { normalizzaTelefono } from "@/lib/telefono";

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
  dati: "i dati che mi hai lasciato non risultano validi",
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

const IN_MAIUSCOLO = (testo: string): string => testo.charAt(0).toUpperCase() + testo.slice(1);

/**
 * L'aspetto dei messaggi: blocchi separati da una riga vuota, la frase che conta in grassetto
 * (WhatsApp: *testo*), una etichetta per riga di dettaglio ("Serata:", "Data:", "Dove:") e il link su
 * una riga sua, così WhatsApp ci mostra sotto l'anteprima. Il messaggio è in prima persona
 * (lo manda Luca) e finisce con la sua firma.
 *
 * NIENTE EMOJI. Provate su un Android non nuovo, tutte arrivavano come un rombo nero con il punto
 * interrogativo: il telefono di chi riceve non le sa disegnare, e non lo possiamo sapere prima.
 * Un messaggio con righe ordinate ed etichette si legge bene su qualunque telefono.
 */
const FIRMA = "Luca";

/** Le righe di dettaglio: la serata, il giorno e (per chi ha un posto) dove. */
function dettagli(d: { readonly serata: string; readonly data: string | null }, conLuogo: boolean): string[] {
  return [
    `Serata: ${d.serata}`,
    ...(d.data === null ? [] : [`Data: ${IN_MAIUSCOLO(d.data)}`]),
    ...(conLuogo ? [`Dove: ROOM26, ${LOCALE.indirizzo}`] : []),
  ];
}

export function messaggioConferma(d: DatiConferma): string {
  // Il link sceglie da solo: Wallet su iPhone e Mac, PDF su Android e computer. La seconda riga è per chi ha un iPhone
  // ma preferisce il PDF (il link corto con /pdf in fondo dà sempre il PDF). La navetta non ha biglietto: non passa di qui.
  const biglietto =
    d.linkBiglietto === null
      ? ""
      : `Il tuo biglietto (Wallet su iPhone):\n${d.linkBiglietto}\n\nHai Android o preferisci il PDF? Scaricalo qui:\n${d.linkBiglietto}/pdf`;
  const saluto = `Ciao ${d.nome}!`;

  switch (d.tipo) {
    case "tavolo":
      return [
        saluto,
        ["*Il tuo tavolo è confermato*", ...dettagli(d, true)].join("\n"),
        biglietto,
        `I dettagli del tavolo te li scrivo io.\nA presto!\n${FIRMA}`,
      ].join("\n\n");
    case "lista":
      return [
        saluto,
        ["*Sei in lista*", ...dettagli(d, true)].join("\n"),
        biglietto,
        `All'ingresso mostra il biglietto se ti viene richiesto.\nA presto!\n${FIRMA}`,
      ].join("\n\n");
    case "braccialetto":
      return [
        saluto,
        ["*Il tuo bracciale è confermato*", ...dettagli(d, true)].join("\n"),
        biglietto,
        `All'ingresso mostra il biglietto se ti viene richiesto.\nA presto!\n${FIRMA}`,
      ].join("\n\n");
    case "navetta":
      return [
        saluto,
        [
          "*La tua navetta è confermata*",
          ...dettagli(d, false),
          ...(d.zona === undefined || d.zona === "" ? [] : [`Parti da: ${d.zona}`]),
        ].join("\n"),
        `Orario e punto di ritrovo te li scrivo qui.\nA presto!\n${FIRMA}`,
      ].join("\n\n");
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
  const quando = d.data === null ? "" : ` di ${d.data}`;

  return [
    `Ciao ${d.nome},`,
    `per ${d.serata}${quando} purtroppo non riesco a confermarti.${frase === null ? "" : `\nMotivo: ${frase}.`}`,
    `Grazie per avermi scritto.\nA presto,\n${FIRMA}`,
  ].join("\n\n");
}

/**
 * Da un telefono scritto come capita a quello che vuole wa.me: le cifre col prefisso.
 * Un numero già internazionale ("+44 7911 123456") resta com'è; uno senza prefisso è italiano e prende il 39.
 * Null se non è un numero. Le regole stanno in lib/telefono.ts, le stesse del modulo.
 */
export function numeroPerWhatsapp(telefono: string): string | null {
  return normalizzaTelefono(telefono);
}

/** Il link che apre WhatsApp verso quel numero con quel testo già scritto. Non invia niente. */
export function linkWhatsapp(telefono: string, testo: string): string | null {
  const numero = numeroPerWhatsapp(telefono);
  return numero === null ? null : `https://wa.me/${numero}?text=${encodeURIComponent(testo)}`;
}

/** Quello che serve per scrivere a un PR il suo accesso. */
export interface DatiAccesso {
  readonly nome: string;
  /** Il codice: fine del suo link e nome con cui entra. */
  readonly codice: string;
  readonly password: string;
  /** Il link per le prenotazioni: https://dominio/pr/<codice>. */
  readonly link: string;
}

/**
 * Il messaggio che Luca manda al PR con il suo accesso: si legge da solo, senza aggiungere altro.
 * L'indirizzo è /pannello (non /pannello/accesso): chi è già dentro va dove deve, chi no trova la pagina
 * con i due campi. Sta su una riga sua, così basta toccarlo. La password è fatta di parole semplici.
 */
export function messaggioAccesso(d: DatiAccesso, indirizzo: string): string {
  const nome = d.nome.split(/\s+/)[0] ?? d.nome;

  return [
    `Ciao ${nome}!`,
    "Ecco il tuo accesso al pannello di Luca California: lì vedi in tempo reale le richieste che arrivano dal tuo link.",
    `*1.* Tocca il link qui sotto, si apre la pagina di accesso:\n${indirizzo}/pannello`,
    `*2.* Nella pagina tocca "Sei un PR? Entra con il tuo nome", poi scrivi questi dati e tocca "Entra":\nIl tuo nome: ${d.codice}\nPassword: ${d.password}`,
    "*3.* Appena entri ti faccio vedere come aggiungere il pannello alla schermata Home: lo apri con un tocco, come un'app.",
    `Questo invece è il tuo link per le prenotazioni, mandalo ai tuoi amici:\n${d.link}`,
    "Se qualcosa non funziona scrivimi. A presto!\nLuca",
  ].join("\n\n");
}
