export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve una richiesta di lista o tavolo.
 *
 * IN ANTEPRIMA NON SALVA NIENTE, e lo dice a chi la manda. Nel sito vero la
 * richiesta finisce su Supabase e compare nel pannello di Luca. Finché quel
 * pezzo non c'è, fingere di aver salvato sarebbe peggio che dirlo.
 *
 * Qui non parte nessun messaggio: ogni messaggio ai clienti lo manda Luca a
 * mano, ed è una regola del brief.
 */

interface Richiesta {
  readonly tipo: string;
  readonly nome: string;
  readonly cognome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly note?: string;
}

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

  const c = corpo as Partial<Richiesta>;
  const nome = testo(c.nome, 60);
  const cognome = testo(c.cognome, 60);
  const telefono = testo(c.telefono, 30);
  const serata = testo(c.serata, 60);
  const tipo = testo(c.tipo, 20);

  if (nome === null || cognome === null || telefono === null || serata === null || tipo === null) {
    return Response.json(
      { errore: "Servono nome, cognome, telefono e la serata" },
      { status: 400 },
    );
  }

  if (telefono.replace(/\D/g, "").length < 9) {
    return Response.json({ errore: "Il numero di telefono non sembra giusto" }, { status: 400 });
  }

  return Response.json(
    { salvata: false, nota: "Anteprima: la richiesta non viene salvata." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
