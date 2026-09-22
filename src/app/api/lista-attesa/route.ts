export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Le liste d'attesa: special guest e Capodanno.
 *
 * Nel sito vero questi contatti finiscono nella tabella liste_attesa, con il
 * tipo accanto, così quando Luca pubblica date e prezzi ha già chi avvisare.
 * In anteprima non c'è database: la richiesta viene controllata e confermata,
 * ma non conservata, e la pagina lo dice a chi la manda.
 */

const TIPI = ["special_guest", "capodanno"] as const;
type Tipo = (typeof TIPI)[number];

function testo(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }
  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ errore: "Richiesta illeggibile" }, { status: 400 });
  }

  const c = corpo as Record<string, unknown>;
  const tipo = testo(c["tipo"], 20);
  const nome = testo(c["nome"], 60);
  const contatto = testo(c["contatto"], 80);

  if (tipo === null || !TIPI.includes(tipo as Tipo)) {
    return Response.json({ errore: "Tipo di lista sconosciuto" }, { status: 400 });
  }
  if (nome === null) {
    return Response.json({ errore: "Serve il nome" }, { status: 400 });
  }
  if (contatto === null) {
    return Response.json({ errore: "Serve un telefono o un'email" }, { status: 400 });
  }

  const sembraEmail = contatto.includes("@");
  const cifre = contatto.replace(/\D/g, "").length;

  if (!sembraEmail && cifre < 9) {
    return Response.json({ errore: "Scrivi un telefono valido o un'email" }, { status: 400 });
  }

  return Response.json(
    {
      salvata: false,
      nota: "Anteprima del sito: il contatto non viene conservato.",
      ricevuta: { tipo, nome, contatto },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
