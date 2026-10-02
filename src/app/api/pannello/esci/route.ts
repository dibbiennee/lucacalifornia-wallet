import { intestazioneUscita } from "@/lib/pannello/sessione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * L'uscita dal pannello.
 *
 * Cancella il biscotto della sessione scrivendone uno vuoto e già scaduto:
 * è il modo di dire al browser di buttarlo via. Non c'è niente da invalidare
 * sul server per questo browser: il biscotto è firmato e non una riga in un
 * archivio. (Per chiudere TUTTE le sessioni di un PR si rigenera la sua
 * password: vedi rigeneraAccessoPr in dati.ts.)
 */
export async function POST(): Promise<Response> {
  const risposta = Response.json({ fuori: true }, { headers: { "Cache-Control": "no-store" } });
  risposta.headers.append("Set-Cookie", intestazioneUscita());

  return risposta;
}
