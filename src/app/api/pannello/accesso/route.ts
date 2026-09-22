import { attesaResidua, bloccato, segnaTentativo } from "@/lib/pannello/blocco-tentativi";
import { impostazioniBiscotto, passwordGiusta, valoreBiscotto } from "@/lib/pannello/sessione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(richiesta: Request): Promise<Response> {
  // Il blocco si controlla PRIMA della password: chi ha davvero dimenticato
  // deve sapere che deve aspettare, non credere di averla riscritta male.
  if (bloccato(richiesta)) {
    const attesa = attesaResidua(richiesta);

    return Response.json(
      { errore: `Troppi tentativi. Riprova fra ${Math.ceil(attesa / 60)} minuti.` },
      { status: 429, headers: { "Retry-After": String(attesa), "Cache-Control": "no-store" } },
    );
  }

  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    corpo = {};
  }

  const password = (corpo as { password?: unknown }).password;
  const giusta = typeof password === "string" && passwordGiusta(password);

  segnaTentativo(richiesta, giusta);

  if (!giusta) {
    return Response.json(
      { errore: "Password sbagliata" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const risposta = Response.json({ dentro: true }, { headers: { "Cache-Control": "no-store" } });
  const { name, ...resto } = impostazioniBiscotto;

  risposta.headers.append(
    "Set-Cookie",
    `${name}=${valoreBiscotto()}; Max-Age=${resto.maxAge}; Path=${resto.path}; HttpOnly; Secure; SameSite=Lax`,
  );

  return risposta;
}
