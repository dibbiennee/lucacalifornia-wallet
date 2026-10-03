import { tokenDaSerial } from "@/lib/pannello/dati";

import { GET as biglietto } from "../../pass/[token]/route";

/** passkit-generator firma con le API di Node: niente runtime edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il link corto del biglietto: /api/b/<numero di serie>.
 *
 * Il link lungo (/api/pass/<token>) porta con sé tutto il biglietto cifrato,
 * circa 270 caratteri: troppo per un messaggio WhatsApp. Il numero di serie è
 * un codice casuale di 12 caratteri (72 bit, non indovinabile) già salvato
 * insieme al biglietto: qui si cerca il biglietto con quello e si risponde come
 * fa il link lungo, che continua a funzionare per i messaggi già mandati.
 *
 * Sta sotto /api/ perché è lì che la regola sul bordo limita le richieste per
 * indirizzo: un link corto fuori da /api/ si potrebbe martellare senza limite.
 */
export async function GET(
  richiesta: Request,
  contesto: { params: Promise<{ serial: string }> },
): Promise<Response> {
  const { serial } = await contesto.params;
  const token = await tokenDaSerial(serial);

  if (token === null) {
    return new Response("Biglietto non valido", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return biglietto(richiesta, { params: Promise.resolve({ token }) });
}
