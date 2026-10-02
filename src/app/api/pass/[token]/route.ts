import { creaBiglietto } from "@/lib/pass/biglietto";
import { bigliettoValido } from "@/lib/pannello/dati";
import { leggiToken } from "@/lib/pass/token";

/** passkit-generator firma con le API di Node: niente runtime edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il biglietto di una prenotazione confermata.
 *
 * Il token è la prenotazione: se si apre, la prenotazione esiste. Il token viene
 * creato solo al momento della conferma, e senza la chiave non se ne può
 * fabbricare uno. Una cosa si controlla però nel database: Luca può cambiare
 * decisione, e una richiesta che non è più confermata non dà più il biglietto
 * (410). Vedi bigliettoValido(): quelli del vecchio flusso restano validi.
 */
export async function GET(
  _richiesta: Request,
  contesto: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await contesto.params;
  const prenotazione = leggiToken(token);

  if (prenotazione === null) {
    return new Response("Biglietto non valido", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  try {
    if (!(await bigliettoValido(prenotazione.serialNumber))) {
      return new Response("Questo biglietto non è più valido", {
        status: 410,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    }

    const pkpass = await creaBiglietto({ ...prenotazione, token });
    const nomeFile = `biglietto-${prenotazione.serata.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pkpass`;

    return new Response(new Uint8Array(pkpass), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${nomeFile}"`,
        "Content-Length": String(pkpass.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (errore: unknown) {
    // Solo il messaggio: nei log non deve finire niente dei certificati.
    const messaggio = errore instanceof Error ? errore.message : "errore sconosciuto";
    console.error("[pass] generazione fallita:", messaggio);

    return new Response(`Biglietto non generato: ${messaggio}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
