import { impostazioniBiscotto } from "@/lib/pannello/sessione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * L'uscita dal pannello.
 *
 * Cancella il biscotto della sessione scrivendone uno vuoto e già scaduto:
 * è il modo di dire al browser di buttarlo via. Non c'è niente da invalidare
 * sul server, perché la sessione è la firma della password e non una riga in
 * un archivio.
 */
export async function POST(): Promise<Response> {
  const risposta = Response.json({ fuori: true }, { headers: { "Cache-Control": "no-store" } });
  const { name, path } = impostazioniBiscotto;

  risposta.headers.append(
    "Set-Cookie",
    `${name}=; Max-Age=0; Path=${path}; HttpOnly${process.env.NODE_ENV === "production" ? "; Secure" : ""}; SameSite=Lax`,
  );

  return risposta;
}
