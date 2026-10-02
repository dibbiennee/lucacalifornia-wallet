import { BISCOTTO_PROVENIENZA, DURATA_PROVENIENZA, riconosci } from "@/contenuti/canali";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il percorso corto.
 *
 * Un canale (/ig, /tiktok, /storiainstagram...) segna da dove arrivi e ti porta
 * sulla home pulita: non è una pagina, nessuno deve vederla. Segna il
 * biscotto e rimanda subito, così nell'indirizzo del browser resta il sito e
 * non il codice del canale, che sennò finirebbe in ogni link condiviso.
 *
 * Un PR attivo (/antonio, il vecchio formato) rimanda al suo link vero,
 * /pr/antonio, senza biscotti. Un PR spento, o una parola qualunque, è pagina
 * non trovata: gli indirizzi conosciuti stanno in un elenco chiuso, altrimenti
 * qualsiasi parola dopo la barra diventerebbe un canale.
 */
export async function GET(
  _richiesta: Request,
  contesto: { params: Promise<{ canale: string }> },
): Promise<Response> {
  const { canale } = await contesto.params;
  const trovato = await riconosci(canale);

  if (trovato === null) {
    return new Response("Non trovato", { status: 404 });
  }

  if (trovato.tipo === "pr") {
    return new Response(null, { status: 307, headers: { Location: `/pr/${trovato.codice}` } });
  }

  const risposta = new Response(null, { status: 307, headers: { Location: "/" } });

  risposta.headers.append(
    "Set-Cookie",
    `${BISCOTTO_PROVENIENZA}=${encodeURIComponent(trovato.valore)}; Max-Age=${DURATA_PROVENIENZA}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );

  return risposta;
}
