import { LOCALI } from "@/lib/pass/tipi";
import { leggiToken } from "@/lib/pass/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifica un QR letto all'ingresso.
 *
 * La chiave resta qui: il telefono alla porta manda il token e riceve solo
 * l'esito. Così nessuno può ricavare la chiave guardando il codice della
 * pagina, e i dati del cliente non stanno nel QR ma escono da qui.
 *
 * In questa versione non c'è un archivio, quindi non si può sapere se un
 * biglietto è già passato: l'esito è valido oppure non valido.
 */

interface Esito {
  readonly valido: boolean;
  readonly nome?: string;
  readonly tipo?: string;
  readonly serata?: string;
  readonly sala?: string;
  readonly locale?: string;
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ valido: false } satisfies Esito, { status: 200 });
  }

  const token = (corpo as { token?: unknown }).token;

  if (typeof token !== "string" || token.length === 0 || token.length > 2000) {
    return Response.json({ valido: false } satisfies Esito);
  }

  const prenotazione = leggiToken(token);

  if (prenotazione === null) {
    return Response.json({ valido: false } satisfies Esito, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const esito: Esito = {
    valido: true,
    nome: prenotazione.nomeCliente,
    tipo: prenotazione.tipo,
    serata: prenotazione.serata,
    locale: LOCALI[prenotazione.locale].nome,
    ...(prenotazione.sala !== undefined ? { sala: prenotazione.sala } : {}),
  };

  return Response.json(esito, { headers: { "Cache-Control": "no-store" } });
}
