import { dataInLettere } from "@/lib/serate";
import { isCodiceLocale, type Prenotazione } from "@/lib/pass/tipi";
import { creaToken, nuovoSerialNumber } from "@/lib/pass/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * La conferma, cioè il gesto che farà Luca dal pannello.
 *
 * Non salva niente: in questa versione non c'è un archivio. Prende i dati,
 * ne ricava il biglietto e restituisce due link, quello del biglietto e
 * quello di WhatsApp col messaggio già scritto. Il messaggio parte sempre da
 * lui, mai da solo: è una regola del brief del sito.
 */

interface Richiesta {
  readonly nomeCliente: string;
  readonly telefono: string;
  readonly serata: string;
  readonly inizioSerata: string;
  readonly tipo: string;
  readonly locale: string;
  readonly sala?: string;
}

interface Risposta {
  readonly linkBiglietto: string;
  readonly linkWhatsapp: string;
  readonly messaggio: string;
}

function testoRichiesto(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }

  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

/** Da "334 854 8735" a "393348548735", che è quello che vuole wa.me. */
function numeroPerWhatsapp(telefono: string): string | null {
  const cifre = telefono.replace(/\D/g, "");

  if (cifre.length < 9 || cifre.length > 15) {
    return null;
  }

  return cifre.startsWith("39") ? cifre : `39${cifre}`;
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return errore("Richiesta illeggibile");
  }

  const c = corpo as Partial<Richiesta>;

  const nomeCliente = testoRichiesto(c.nomeCliente, 60);
  const serata = testoRichiesto(c.serata, 40);
  const tipo = testoRichiesto(c.tipo, 40);
  const telefono = testoRichiesto(c.telefono, 30);
  const locale = testoRichiesto(c.locale, 20);
  const quando = testoRichiesto(c.inizioSerata, 40);

  if (
    nomeCliente === null ||
    serata === null ||
    tipo === null ||
    telefono === null ||
    locale === null ||
    quando === null
  ) {
    return errore("Manca qualcosa: servono nome, telefono, serata, data e tipo");
  }

  if (!isCodiceLocale(locale)) {
    return errore("Locale sconosciuto");
  }

  const inizioSerata = new Date(quando);

  if (Number.isNaN(inizioSerata.getTime())) {
    return errore("Data non valida");
  }

  const numero = numeroPerWhatsapp(telefono);

  if (numero === null) {
    return errore("Numero di telefono non valido");
  }

  const sala = testoRichiesto(c.sala, 40);

  const prenotazione: Prenotazione = {
    serialNumber: nuovoSerialNumber(),
    nomeCliente,
    serata,
    inizioSerata,
    tipo,
    locale,
    ...(sala !== null ? { sala } : {}),
  };

  const origine = new URL(richiesta.url).origin;
  const linkBiglietto = `${origine}/api/pass/${creaToken(prenotazione)}`;

  const messaggio =
    `Ciao ${nomeCliente}, ti confermo per ${dataInLettere(inizioSerata)} e ${tipo}.\n` +
    `Questo è il tuo biglietto, puoi aggiungerlo al wallet.\n${linkBiglietto}\n\n` +
    `All'ingresso mostralo al PR se ti viene richiesto.`;

  const risposta: Risposta = {
    linkBiglietto,
    linkWhatsapp: `https://wa.me/${numero}?text=${encodeURIComponent(messaggio)}`,
    messaggio,
  };

  return Response.json(risposta, { headers: { "Cache-Control": "no-store" } });
}

function errore(messaggio: string): Response {
  return Response.json({ errore: messaggio }, { status: 400 });
}
