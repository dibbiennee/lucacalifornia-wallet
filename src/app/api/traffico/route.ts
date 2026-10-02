import { cookies } from "next/headers";

import { BISCOTTO_PROVENIENZA, canaleDaBiscotto, prAttivoPerCodice } from "@/contenuti/canali";
import { chiaveIndirizzo, segnaFallito, statoBlocco } from "@/lib/pannello/blocco-tentativi";
import { FORMA_SESSIONE, registraEvento } from "@/lib/traffico";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve un evento di traffico: una visita, o l'inizio del modulo.
 *
 * POST { sessione, evento: "visita" | "inizio", nuova, pr? }
 *
 * L'invio del modulo non passa di qui: lo scrive /api/richiesta quando la
 * richiesta è davvero salvata. Qui il browser non può dire "ho inviato".
 *
 * Il PR non arriva come id: il browser manda il codice della pagina /pr/<codice>
 * e il server lo controlla (deve essere un PR attivo). Un codice sbagliato conta
 * come visita senza PR. L'origine (un canale come /ig o /tiktok) la legge il
 * server dal biscotto che il percorso corto ha lasciato, non dal browser.
 *
 * Non si salva niente che identifichi una persona: né indirizzo né dispositivo.
 * Contro i flussi di spazzatura: il limite per indirizzo (240 eventi ogni 10
 * minuti, nel database) e la forma obbligata della sessione.
 */

const EVENTI_PER_INDIRIZZO = 240;
const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ errore: "Richiesta illeggibile" }, { status: 400, headers: NO_STORE });
  }

  const c = (corpo ?? {}) as Record<string, unknown>;
  const sessione = c["sessione"];
  const evento = c["evento"];

  if (typeof sessione !== "string" || !FORMA_SESSIONE.test(sessione) || (evento !== "visita" && evento !== "inizio")) {
    return Response.json({ errore: "Evento non valido" }, { status: 400, headers: NO_STORE });
  }

  const chiave = `trf:${chiaveIndirizzo(richiesta)}`;
  const limite = await statoBlocco(chiave, EVENTI_PER_INDIRIZZO, false);

  // Il traffico è un di più: se il database non risponde o l'indirizzo esagera, si scarta in silenzio.
  if (limite.nonDisponibile || limite.bloccato) {
    return new Response(null, { status: 204, headers: NO_STORE });
  }

  await segnaFallito(chiave, false);

  const pr = typeof c["pr"] === "string" ? await prAttivoPerCodice(c["pr"]) : null;
  const biscotto = (await cookies()).get(BISCOTTO_PROVENIENZA)?.value;
  const origine = pr !== null ? "pr" : (canaleDaBiscotto(biscotto) ?? "diretto");

  await registraEvento({
    sessione,
    evento,
    nuova: c["nuova"] === true,
    origine,
    prId: pr?.id ?? null,
  }).catch(() => undefined);

  return new Response(null, { status: 204, headers: NO_STORE });
}
