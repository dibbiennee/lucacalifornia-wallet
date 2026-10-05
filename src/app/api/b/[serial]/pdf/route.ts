import { tokenDaSerial } from "@/lib/pannello/dati";
import { rispostaBiglietto } from "@/lib/pass/rispondi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il biglietto in PDF, sempre: /api/b/<serie>/pdf. Per chi ha un iPhone ma preferisce il PDF a Wallet.
 * Sta sotto /api/ come il link corto, quindi sotto la stessa regola sul bordo che limita le richieste.
 */
export async function GET(
  _richiesta: Request,
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

  return rispostaBiglietto(token, "pdf");
}
