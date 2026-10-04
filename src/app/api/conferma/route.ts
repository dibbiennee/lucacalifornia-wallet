import {
  richiesta,
  riservaSerialWallet,
  salvaWalletPronto,
  segnaWalletInErrore,
  transizione,
  walletDi,
  type RichiestaPannello,
} from "@/lib/pannello/dati";
import { prenotazioneDa } from "@/lib/pannello/biglietto";
import { linkWhatsapp, messaggioConferma } from "@/lib/pannello/messaggi";
import { INDIRIZZO } from "@/lib/pubblico";
import { dataInLettere } from "@/lib/serate";
import { leggiSessione, type Sessione } from "@/lib/pannello/sessione";
import { creaToken, leggiToken, nuovoSerialNumber } from "@/lib/pass/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * La conferma di una richiesta: il gesto che fa Luca. Solo lui: un PR riceve 403.
 *
 * POST { "richiestaId": "<id>" }, e basta. Il server decide tutto il resto.
 *
 * Il browser dice SOLO quale richiesta. Nome, telefono, serata, data, tipo,
 * locale e sala li legge il server dal database: non si accetta niente di
 * quello che finisce nel biglietto da chi chiama, perché chiunque può
 * scrivere una richiesta a mano. Senza sessione non si entra, e con la
 * sessione di un PR neppure: decide solo Luca.
 *
 * Cosa fa, nell'ordine:
 *   1. sessione obbligatoria (401), e solo quella di Luca (403);
 *   2. la richiesta si carica dal database (404);
 *   3. se è "in attesa" o "rifiutata" (Luca può cambiare idea) la porta a
 *      "confermata" con un UPDATE condizionale (vedi transizione in dati.ts).
 *      Se è già "confermata" non rifà la transizione e prosegue: ripetere la
 *      conferma è innocuo;
 *   4. il biglietto Wallet. Se è già "pronto" restituisce QUELLO, salvato nel
 *      database: niente token nuovo, niente serial nuovo, niente effetti. Se
 *      non c'è o è in "errore" lo prepara (o lo riprepara) con il numero di
 *      serie legato a quella richiesta, che non cambia mai;
 *   5. risponde col link del biglietto e col link di WhatsApp già scritto.
 *
 * Idempotenza: due clic, due schede, due persone che confermano insieme
 * ottengono lo stesso biglietto. Se due richieste arrivano nello stesso
 * istante e generano entrambe un token, il database ne tiene uno solo (il
 * primo scritto) e restituisce quello a tutte e due.
 *
 * Se il Wallet si rompe, la prenotazione RESTA confermata: la risposta è 200
 * con wallet.stato = "errore", e il pannello può mostrare l'errore e far
 * riprovare (si richiama questa stessa route: è l'unico caso in cui si
 * rigenera). WhatsApp non parte mai da qui: il messaggio lo manda chi usa il
 * pannello, con un tocco.
 */

type RispostaWallet =
  | {
      readonly stato: "pronto";
      readonly linkBiglietto: string;
      /** Null se il numero di telefono della richiesta non è un numero valido. */
      readonly linkWhatsapp: string | null;
      readonly messaggio: string;
    }
  /** La navetta non ha il biglietto: la conferma è solo il messaggio. */
  | {
      readonly stato: "non_previsto";
      readonly linkWhatsapp: string | null;
      readonly messaggio: string;
    }
  | { readonly stato: "errore"; readonly errore: string };

interface Risposta {
  readonly richiestaId: string;
  readonly stato: "confermata";
  readonly wallet: RispostaWallet;
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

function errore(messaggio: string, status: number, extra: Record<string, unknown> = {}): Response {
  return Response.json({ errore: messaggio, ...extra }, { status, headers: NO_STORE });
}

export async function POST(req: Request): Promise<Response> {
  // 1. Sessione. Nessun accesso anonimo, nemmeno per "provare".
  const sessione = await leggiSessione();

  if (sessione === null) {
    return errore("Non autorizzato", 401);
  }

  // Un PR è dentro, ma non decide: la sua sessione non basta.
  if (sessione.ruolo !== "owner") {
    return errore("Solo Luca può confermare", 403);
  }

  let corpo: unknown;

  try {
    corpo = await req.json();
  } catch {
    return errore("Richiesta illeggibile", 400);
  }

  const id = (corpo as { richiestaId?: unknown } | null)?.richiestaId;

  if (typeof id !== "string" || id.length === 0 || id.length > 120) {
    return errore("Manca la richiesta da confermare", 400);
  }

  // 2. La richiesta, dal database e dentro l'ambito di chi chiede.
  const trovata = await richiesta(sessione, id);

  if (trovata === undefined) {
    return errore("Richiesta non trovata", 404);
  }

  // 3. Lo stato. Da "in attesa" o da "rifiutata" si conferma; se è già confermata si prosegue.
  let corrente: RichiestaPannello = trovata;

  if (trovata.stato !== "confermata") {
    const esito = await transizione(sessione, id, "confermata");

    if (esito.ok) {
      corrente = esito.richiesta;
    } else if (esito.motivo === "inesistente") {
      return errore("Richiesta non trovata", 404);
    } else {
      // Un'altra scheda (o un altro doppio clic) ha confermato un istante prima: non è un errore, si prosegue.
      corrente = (await richiesta(sessione, id)) ?? trovata;
    }
  }

  // La navetta non ha il biglietto: la conferma è il solo messaggio WhatsApp, già scritto.
  if (corrente.tipo === "navetta") {
    return rispostaNavetta(corrente);
  }

  // 4 e 5. Il biglietto. Un errore qui non annulla la conferma.
  return await preparaWallet(sessione, corrente);
}

/** La navetta: nessun biglietto, nessun serial, nessuna scrittura sul Wallet. Solo il testo e il link verso il cliente. */
function rispostaNavetta(r: RichiestaPannello): Response {
  const messaggio = messaggioConferma({
    nome: r.nome,
    tipo: "navetta",
    serata: r.nomeSerata,
    data: null,
    zona: r.zona,
    linkBiglietto: null,
  });

  const risposta: Risposta = {
    richiestaId: r.id,
    stato: "confermata",
    wallet: { stato: "non_previsto", linkWhatsapp: linkWhatsapp(r.telefono ?? "", messaggio), messaggio },
  };

  return Response.json(risposta, { headers: NO_STORE });
}

/** La risposta "pronto" per un biglietto già deciso: le stesse cose, ogni volta che si chiede. */
function rispostaPronta(r: RichiestaPannello, serial: string, token: string): Response {
  // I dati si leggono dal biglietto salvato, non si ricalcolano: per le richieste senza data vera la
  // "prossima serata" cambierebbe di settimana in settimana, e il messaggio non sarebbe più lo stesso.
  const prenotazione = leggiToken(token) ?? prenotazioneDa(r, serial);
  // Il link corto, col numero di serie (12 caratteri) invece del biglietto intero (circa 270): vedi api/b/[serial]/route.ts.
  // Il dominio vero del sito (INDIRIZZO), non quello da cui Luca ha aperto il pannello: un biglietto mandato da un indirizzo
  // di servizio (come un alias di prova) arriverebbe al cliente con quel nome nel link.
  const linkBiglietto = `${INDIRIZZO}/api/b/${serial}`;
  const messaggio = messaggioConferma({
    nome: prenotazione.nomeCliente,
    tipo: r.tipo,
    serata: prenotazione.serata,
    data: dataInLettere(prenotazione.inizioSerata),
    zona: r.zona,
    linkBiglietto,
  });

  const risposta: Risposta = {
    richiestaId: r.id,
    stato: "confermata",
    wallet: {
      stato: "pronto",
      linkBiglietto,
      linkWhatsapp: linkWhatsapp(r.telefono ?? "", messaggio),
      messaggio,
    },
  };

  return Response.json(risposta, { headers: NO_STORE });
}

async function preparaWallet(sessione: Sessione, r: RichiestaPannello): Promise<Response> {
  try {
    const salvato = await walletDi(sessione, r.id);

    if (salvato === null) {
      throw new Error("Wallet non leggibile: la richiesta non è più confermata o non è visibile");
    }

    // Già pronto: si restituisce quello che c'è. Nessuna generazione, nessuna scrittura.
    if (salvato.stato === "pronto" && salvato.serial !== null && salvato.token !== null) {
      return rispostaPronta(r, salvato.serial, salvato.token);
    }

    // Non c'è ancora, o l'ultima volta è andata male: si prepara. Il numero di serie, se c'è già, resta quello.
    const serial = await riservaSerialWallet(sessione, r.id, nuovoSerialNumber());

    if (serial === null) {
      throw new Error("Numero di serie non assegnabile");
    }

    const generato = creaToken(prenotazioneDa(r, serial));
    // Se un'altra scheda ha salvato il suo token un istante prima, qui torna il suo, non questo.
    const token = await salvaWalletPronto(sessione, r.id, generato);

    if (token === null) {
      throw new Error("Biglietto non salvabile");
    }

    return rispostaPronta(r, serial, token);
  } catch (causa) {
    // Il dettaglio resta nei log del server; a chi guarda il pannello basta sapere che si può riprovare.
    console.error(`Wallet non preparato per la richiesta ${r.id}:`, causa);

    try {
      await segnaWalletInErrore(sessione, r.id);
    } catch (secondo) {
      console.error(`Stato del Wallet non registrato per la richiesta ${r.id}:`, secondo);
    }

    const risposta: Risposta = {
      richiestaId: r.id,
      stato: "confermata",
      wallet: {
        stato: "errore",
        errore: "La richiesta è confermata, ma il biglietto non si è generato. Riprova fra un attimo.",
      },
    };

    return Response.json(risposta, { headers: NO_STORE });
  }
}
