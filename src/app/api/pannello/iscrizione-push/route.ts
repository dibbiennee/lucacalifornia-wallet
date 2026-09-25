import { salvaIscrizione, togliIscrizione, type Iscrizione } from "@/lib/push";
import { sessioneAperta } from "@/lib/pannello/sessione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Salva o toglie l'iscrizione al push di chi ha il pannello aperto.
 *
 * Protetta come le altre azioni del pannello: chi non ha la sessione non
 * deve poter riempire la tabella di iscrizioni a caso.
 */
function iscrizioneValida(corpo: unknown): corpo is Iscrizione {
  if (typeof corpo !== "object" || corpo === null) {
    return false;
  }
  const c = corpo as Partial<Iscrizione>;
  return (
    typeof c.endpoint === "string" &&
    typeof c.keys === "object" &&
    c.keys !== null &&
    typeof c.keys.p256dh === "string" &&
    typeof c.keys.auth === "string"
  );
}

export async function POST(richiesta: Request): Promise<Response> {
  if (!(await sessioneAperta())) {
    return Response.json({ errore: "Non autorizzato" }, { status: 401 });
  }

  let corpo: unknown;
  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ errore: "Richiesta illeggibile" }, { status: 400 });
  }

  if (!iscrizioneValida(corpo)) {
    return Response.json({ errore: "Iscrizione incompleta" }, { status: 400 });
  }

  await salvaIscrizione(corpo);
  return Response.json({ salvata: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(richiesta: Request): Promise<Response> {
  if (!(await sessioneAperta())) {
    return Response.json({ errore: "Non autorizzato" }, { status: 401 });
  }

  const { endpoint } = (await richiesta.json().catch(() => ({}))) as { endpoint?: unknown };

  if (typeof endpoint !== "string" || endpoint === "") {
    return Response.json({ errore: "Manca l'endpoint" }, { status: 400 });
  }

  await togliIscrizione(endpoint);
  return Response.json({ tolta: true }, { headers: { "Cache-Control": "no-store" } });
}
