import { formatoRichiesto, rispostaBiglietto } from "@/lib/pass/rispondi";

/** passkit-generator firma con le API di Node: niente runtime edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il biglietto di una prenotazione confermata, nel formato giusto per chi lo apre: Apple Wallet su iPhone,
 * iPad e Mac, PDF su tutto il resto (Android, computer). Con "?formato=pdf" o "?formato=wallet" si sceglie a mano.
 *
 * Il token è la prenotazione: se si apre, la prenotazione esiste. Il token viene creato solo al momento della
 * conferma, e senza la chiave non se ne può fabbricare uno. Una cosa si controlla però nel database: Luca può
 * cambiare decisione, e una richiesta che non è più confermata non dà più il biglietto (410). La logica sta
 * in lib/pass/rispondi.ts, la stessa per il link corto (/api/b/<serie>).
 */
export async function GET(
  richiesta: Request,
  contesto: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await contesto.params;

  return rispostaBiglietto(token, formatoRichiesto(richiesta.url, richiesta.headers.get("user-agent")));
}
