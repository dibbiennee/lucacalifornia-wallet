import { LOCALE, MESSAGGI_WHATSAPP, percorsoSerata, SERATE, type SerataSito } from "@/contenuti/sito";
import { DRINK_INCLUSI, PREZZI_BRACCIALETTO } from "@/lib/prezzo-braccialetto";

/**
 * L'assistente del sito: tutte le risposte e il modo di capire una frase.
 *
 * Non è un'intelligenza: è un albero di risposte scritte a mano e un
 * riconoscimento a regole. Per questo non può inventare: ogni cosa che dice sta
 * qui sotto, e i numeri (prezzi, indirizzo, generi) vengono dagli stessi file
 * che alimentano il resto del sito. Quando non riconosce la domanda, o la
 * risposta non è un dato confermato, manda a WhatsApp.
 *
 * Niente DOM qui dentro: gira anche su Node, ed è così che si prova.
 */

/** Dove porta una scelta: un'altra risposta, una pagina, WhatsApp o la mappa. */
export type Azione =
  | { readonly tipo: "vai"; readonly etichetta: string; readonly dove: Destinazione }
  | { readonly tipo: "pagina"; readonly etichetta: string; readonly href: string }
  | { readonly tipo: "whatsapp"; readonly etichetta: string; readonly messaggio: string }
  | { readonly tipo: "mappa"; readonly etichetta: string };

export type CodiceSerata = SerataSito["codice"];

/** Una risposta dell'albero, con (se serve) la serata di cui si sta parlando. */
export interface Destinazione {
  readonly id:
    | "menu"
    | "prenotare"
    | "serate"
    | "serata"
    | "costo"
    | "costo-tavolo"
    | "costo-bracciale"
    | "costo-lista"
    | "navetta"
    | "dove"
    | "luca"
    | "eta"
    | "disponibilita"
    | "non-so";
  readonly serata?: CodiceSerata;
}

export interface Risposta {
  readonly testo: string;
  readonly azioni: readonly Azione[];
}

export const MENU: Destinazione = { id: "menu" };

const SALUTO = "Ciao, sono l'assistente di Luca California. Come posso aiutarti?";

function serataPerCodice(codice: CodiceSerata | undefined): SerataSito | undefined {
  return SERATE.find((s) => s.codice === codice);
}

/** "Giovedì · Milkshake": il pulsante che sceglie una serata. */
function etichettaSerata(s: SerataSito): string {
  return `${s.giorno} · ${s.nome}`;
}

function pulsantiSerate(verso: (s: SerataSito) => Destinazione): readonly Azione[] {
  return SERATE.map((s) => ({ tipo: "vai", etichetta: etichettaSerata(s), dove: verso(s) }));
}

const SCRIVI_A_LUCA = (messaggio: string = MESSAGGI_WHATSAPP.generico): Azione => ({
  tipo: "whatsapp",
  etichetta: "Scrivi a Luca",
  messaggio,
});

/** Il testo e le scelte di ogni risposta. L'interfaccia aggiunge da sola il ritorno al menu. */
export function risposta(dove: Destinazione): Risposta {
  const serata = serataPerCodice(dove.serata);

  switch (dove.id) {
    case "menu":
      return {
        testo: SALUTO,
        azioni: [
          { tipo: "vai", etichetta: "Voglio prenotare", dove: { id: "prenotare" } },
          { tipo: "vai", etichetta: "Che serata c'è?", dove: { id: "serate" } },
          { tipo: "vai", etichetta: "Quanto costa?", dove: { id: "costo" } },
          { tipo: "vai", etichetta: "Mi interessa la navetta", dove: { id: "navetta" } },
          { tipo: "vai", etichetta: "Dove siete?", dove: { id: "dove" } },
          { tipo: "whatsapp", etichetta: "Parla con Luca", messaggio: MESSAGGI_WHATSAPP.generico },
        ],
      };

    case "prenotare":
      return {
        testo: "Certo. Puoi scegliere tra tavolo, bracciale VIP o lista. Dimmi cosa vuoi prenotare.",
        azioni: [
          { tipo: "pagina", etichetta: "Prenota un tavolo", href: "/tavoli" },
          { tipo: "pagina", etichetta: "Prenota un bracciale", href: "/prenota?tipo=braccialetto" },
          { tipo: "pagina", etichetta: "Entra in lista", href: "/prenota?tipo=lista" },
        ],
      };

    case "serate":
      return {
        testo: "Ogni giorno al ROOM26 trovi una musica diversa.",
        azioni: pulsantiSerate((s) => ({ id: "serata", serata: s.codice })),
      };

    case "serata": {
      if (serata === undefined) {
        return risposta({ id: "serate" });
      }
      return {
        testo: `${serata.giorno} c'è ${serata.nome}: ${serata.genere.toLowerCase()}.`,
        azioni: [
          { tipo: "pagina", etichetta: "Prenota questa serata", href: percorsoSerata(serata) },
          { tipo: "vai", etichetta: "Torna alle serate", dove: { id: "serate" } },
        ],
      };
    }

    case "costo":
      return {
        testo: serata === undefined ? "Cosa vuoi prenotare?" : `Cosa vuoi prenotare per ${serata.giorno.toLowerCase()}?`,
        azioni: [
          { tipo: "vai", etichetta: "Tavolo", dove: { id: "costo-tavolo" } },
          { tipo: "vai", etichetta: "Bracciale VIP", dove: { id: "costo-bracciale", ...(serata === undefined ? {} : { serata: serata.codice }) } },
          { tipo: "vai", etichetta: "Lista", dove: { id: "costo-lista" } },
        ],
      };

    case "costo-tavolo":
      return {
        testo:
          "Per i tavoli puoi indicare un budget di 25–30 €, 35–50 € oppure oltre 50 € a persona. Poi ti rispondo io su WhatsApp con disponibilità e prezzo.",
        azioni: [{ tipo: "pagina", etichetta: "Prenota un tavolo", href: "/tavoli" }],
      };

    case "costo-bracciale": {
      if (serata === undefined) {
        return {
          testo: "Per quale serata?",
          azioni: pulsantiSerate((s) => ({ id: "costo-bracciale", serata: s.codice })),
        };
      }

      if (serata.codice === "venerdi") {
        return {
          testo: `Il venerdì il bracciale VIP costa ${PREZZI_BRACCIALETTO.venerdi.donna} € a persona, con ${DRINK_INCLUSI} drink inclusi.`,
          azioni: [
            { tipo: "pagina", etichetta: "Prenota", href: "/prenota?tipo=braccialetto" },
            SCRIVI_A_LUCA(),
          ],
        };
      }

      if (serata.codice === "sabato") {
        const { donna, uomo } = PREZZI_BRACCIALETTO.sabato;
        return {
          testo: `Il sabato il bracciale VIP costa ${donna} € per le donne e ${uomo} € per gli uomini, con ${DRINK_INCLUSI} drink inclusi.`,
          azioni: [
            { tipo: "pagina", etichetta: "Prenota", href: "/prenota?tipo=braccialetto" },
            SCRIVI_A_LUCA(),
          ],
        };
      }

      // Giovedì e domenica: nessun prezzo confermato, nessun prezzo scritto.
      return {
        testo:
          "Per questa serata il prezzo del bracciale non è ancora indicato. Se vuoi, posso portarti alla richiesta oppure puoi scrivere direttamente a Luca.",
        azioni: [
          { tipo: "pagina", etichetta: "Prenota", href: "/prenota?tipo=braccialetto" },
          SCRIVI_A_LUCA(`Ciao Luca, vorrei sapere il prezzo del bracciale VIP per ${serata.giorno.toLowerCase()}.`),
        ],
      };
    }

    case "costo-lista":
      return {
        testo:
          "Per la lista non ho un prezzo confermato da indicarti. Puoi mandare la richiesta e ti rispondo io con le informazioni.",
        azioni: [{ tipo: "pagina", etichetta: "Prenota", href: "/prenota?tipo=lista" }],
      };

    case "navetta":
      return {
        testo:
          "Posso organizzare la navetta da qualsiasi zona. Disponibilità, orari e costo li concordiamo direttamente in base alla tua richiesta.",
        azioni: [
          { tipo: "pagina", etichetta: "Prima prenoto la serata", href: "/prenota" },
          { tipo: "whatsapp", etichetta: "Voglio informazioni sulla navetta", messaggio: MESSAGGI_WHATSAPP.navetta },
        ],
      };

    case "dove":
      return {
        testo: `Il ROOM26 è all'EUR, a Roma: ${LOCALE.indirizzo}.`,
        azioni: [{ tipo: "mappa", etichetta: "Apri la mappa" }],
      };

    case "luca":
      return {
        testo: "Scrivimi pure su WhatsApp, ti rispondo io.",
        azioni: [SCRIVI_A_LUCA()],
      };

    case "eta":
      return {
        testo: "L'età minima per entrare è 18 anni.",
        azioni: [{ tipo: "pagina", etichetta: "Guarda le serate", href: "/serate" }, SCRIVI_A_LUCA()],
      };

    case "disponibilita":
      return {
        testo: "La disponibilità non posso confermartela da qui: te la dico io su WhatsApp dopo la richiesta.",
        azioni: [{ tipo: "pagina", etichetta: "Prenota un tavolo", href: "/tavoli" }, SCRIVI_A_LUCA()],
      };

    case "non-so":
      return {
        testo: "Su questo non voglio darti un'informazione sbagliata. Scrivimi su WhatsApp e ti rispondo io.",
        azioni: [SCRIVI_A_LUCA()],
      };
  }
}

/* ------------------------------ capire una frase ------------------------------ */

/** Minuscolo, senza accenti né punteggiatura: "Cos'è giovedì?" diventa "cos e giovedi". */
export function normalizza(testo: string): string {
  return testo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** La serata nominata nella frase, dal giorno o dal nome del format. */
function serataNominata(t: string): CodiceSerata | undefined {
  if (/\b(giovedi|milkshake)\b/.test(t)) {
    return "milkshake";
  }
  if (/\b(venerdi|drip)\b/.test(t)) {
    return "venerdi";
  }
  if (/\b(sabato|international)\b/.test(t)) {
    return "sabato";
  }
  if (/\b(domenica|bailame)\b/.test(t)) {
    return "bailame";
  }
  return undefined;
}

const conSerata = (id: Destinazione["id"], serata: CodiceSerata | undefined): Destinazione =>
  serata === undefined ? { id } : { id, serata };

/**
 * Da una frase scritta a una risposta. L'ordine conta: le cose su cui non si
 * deve rischiare (navetta, orari, disponibilità) vengono prima di quelle generiche.
 * Quello che non si riconosce finisce su WhatsApp.
 */
export function capisci(frase: string): Destinazione {
  const t = normalizza(frase);
  const serata = serataNominata(t);

  if (t === "" || /^(ciao|salve|buongiorno|buonasera|hey|ehi|menu)$/.test(t)) {
    return MENU;
  }

  if (/\b(parlare|parla|parlo|contatt\w*|scrivere|scrivo|chiamare|chiamo)\b.*\b(luca|te|lui)\b|\bwhatsapp\b|\bnumero (di )?(luca|telefono|whatsapp)\b|\b(tuo|vostro) numero\b|\btelefon\w*|\bluca\b.*\b(parlare|contatt\w*)/.test(t)) {
    return { id: "luca" };
  }

  if (/\b(eta|anni|minorenn\w*|maggiorenn\w*|minorenne)\b/.test(t)) {
    return { id: "eta" };
  }

  if (/\b(navetta|navette|bus|pullman|passaggio|trasporto|riportat\w*|vengo da)\b/.test(t)) {
    return { id: "navetta" };
  }

  if (/\b(dove siete|dove si trova|dove vi trovate|dov e|indirizzo|mappa|come arrivo|come si arriva|in che zona|posizione)\b/.test(t)) {
    return { id: "dove" };
  }

  if (/\b(disponibil\w*|sold out|esaurit\w*|pieno|piena|posti|posto)\b|\bci sono (ancora )?(tavol\w*|posti|liste|bracciali)\b/.test(t)) {
    return { id: "disponibilita" };
  }

  if (/\b(a che ora|orario|orari|apre|aprite|apertura|chiude|chiudete|chiusura|quando riapr\w*)\b/.test(t)) {
    return { id: "non-so" };
  }

  if (/\b(quanto cost\w*|costo|costi|costano|prezzo|prezzi|quanto si paga|quanto spendo|quanto spendere|budget|tariffa)\b/.test(t)) {
    if (/\b(tavol\w*)\b/.test(t)) {
      return { id: "costo-tavolo" };
    }
    if (/\b(bracciale|bracciali|braccialetto|braccialetti|vip)\b/.test(t)) {
      return conSerata("costo-bracciale", serata);
    }
    if (/\b(lista|liste)\b/.test(t)) {
      return { id: "costo-lista" };
    }
    return conSerata("costo", serata);
  }

  if (
    serata !== undefined ||
    /\b(che serata|che serate|cosa c e|che musica|musica|genere|reggaeton|afro|house|commerciale|serate|programma|stasera|stanotte|oggi|domani|weekend)\b/.test(t)
  ) {
    return serata === undefined ? { id: "serate" } : { id: "serata", serata };
  }

  if (/\b(prenot\w*|riserv\w*|tavol\w*|bracciale|bracciali|braccialetto|braccialetti|lista|liste|entrare|ingresso)\b/.test(t)) {
    return { id: "prenotare" };
  }

  return { id: "non-so" };
}
