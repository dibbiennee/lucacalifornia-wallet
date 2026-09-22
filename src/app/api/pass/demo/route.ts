import { creaBiglietto } from "@/lib/pass/biglietto";
import { bigliettoDiProva } from "@/lib/pass/demo";

/** passkit-generator firma con le API di Node: niente runtime edge. */
export const runtime = "nodejs";
/** Ogni chiamata genera un serialNumber nuovo: niente cache. */
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  // Interruttore spento di default: il biglietto finto non deve esistere
  // in produzione, va acceso a mano sul deploy di prova.
  if (process.env["ABILITA_PASS_DEMO"] !== "1") {
    return new Response("Non trovato", { status: 404 });
  }

  try {
    const pkpass = await creaBiglietto(bigliettoDiProva());

    return new Response(new Uint8Array(pkpass), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="biglietto-demo.pkpass"',
        "Content-Length": String(pkpass.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (errore: unknown) {
    // Solo il messaggio: nei log non deve finire niente dei certificati.
    const messaggio = errore instanceof Error ? errore.message : "errore sconosciuto";
    console.error("[pass demo] generazione fallita:", messaggio);

    return new Response(`Biglietto non generato: ${messaggio}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
