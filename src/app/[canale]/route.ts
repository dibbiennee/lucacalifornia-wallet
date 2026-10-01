
import { BISCOTTO_PROVENIENZA, DURATA_PROVENIENZA, riconosci } from "@/contenuti/canali";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il percorso corto: segna da dove arrivi e ti porta sulla home pulita.
 *
 * Non è una pagina: nessuno deve vederla. Segna il biscotto e rimanda
 * subito, così nell'indirizzo del browser resta il sito e non il codice del
 * canale, che sennò finirebbe in ogni link condiviso.
 *
 * I link dei PR fanno eccezione: non portano alla home, ma dritti al modulo
 * isolato in /pr. Un PR manda il link e basta: chi lo apre deve vedere solo
 * il modulo, senza dover prima capire cos'è il sito.
 *
 * Gli indirizzi conosciuti stanno in un elenco chiuso: tutto il resto è
 * pagina non trovata, altrimenti qualsiasi parola dopo la barra diventerebbe
 * un canale.
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

  const destinazione = trovato.valore.startsWith("pr:") ? "/pr" : "/";
  const risposta = new Response(null, { status: 307, headers: { Location: destinazione } });

  risposta.headers.append(
    "Set-Cookie",
    `${BISCOTTO_PROVENIENZA}=${encodeURIComponent(trovato.valore)}; Max-Age=${DURATA_PROVENIENZA}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  );

  return risposta;
}
