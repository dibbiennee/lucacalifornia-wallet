import { tokenDaSerial } from "@/lib/pannello/dati";

import { GET as biglietto } from "../../pass/[token]/route";

/** passkit-generator firma con le API di Node: niente runtime edge. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Il link corto del biglietto: /api/b/<numero di serie>.
 *
 * Il link lungo (/api/pass/<token>) porta con sé tutto il biglietto cifrato,
 * circa 270 caratteri: troppo per un messaggio WhatsApp. Il numero di serie è
 * un codice casuale di 12 caratteri (72 bit, non indovinabile) già salvato
 * insieme al biglietto: qui si cerca il biglietto con quello e si risponde come
 * fa il link lungo, che continua a funzionare per i messaggi già mandati.
 *
 * Sta sotto /api/ perché è lì che la regola sul bordo limita le richieste per
 * indirizzo: un link corto fuori da /api/ si potrebbe martellare senza limite.
 *
 * L'ANTEPRIMA. Un link che risponde con un file non ha anteprima: WhatsApp e gli
 * altri leggono il titolo e l'immagine da una pagina. Quindi a chi è un'anteprima
 * (WhatsApp, iMessage, Telegram...) si risponde con una paginetta con il loghetto,
 * uguale per tutti i biglietti e senza nessun dato del cliente; a una persona vera
 * si dà il biglietto, con un tocco, come prima. Alle anteprime non serve nemmeno
 * cercare il biglietto nel database, e non si genera niente.
 */

/** Chi legge un link per mostrarne l'anteprima, non per aprirlo. */
const ANTEPRIME = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|skypeuripreview|applebot|googlebot|bingbot|embedly|vkshare|pinterest|redditbot/i;

function paginaAnteprima(origine: string, indirizzo: string): Response {
  const titolo = "Il tuo biglietto, Luca California";
  const descrizione = "Il biglietto della tua serata, in Wallet o in PDF.";
  const immagine = `${origine}/anteprima-biglietto-2.png`;

  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<title>${titolo}</title>
<meta name="description" content="${descrizione}">
<meta name="robots" content="noindex, nofollow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Luca California">
<meta property="og:title" content="${titolo}">
<meta property="og:description" content="${descrizione}">
<meta property="og:url" content="${indirizzo}">
<meta property="og:image" content="${immagine}">
<meta property="og:image:width" content="256">
<meta property="og:image:height" content="256">
<meta property="og:image:alt" content="Il marchio Luca California">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${titolo}">
<meta name="twitter:description" content="${descrizione}">
<meta name="twitter:image" content="${immagine}">
</head>
<body>
<p>${descrizione}</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(
  richiesta: Request,
  contesto: { params: Promise<{ serial: string }> },
): Promise<Response> {
  if (ANTEPRIME.test(richiesta.headers.get("user-agent") ?? "")) {
    const url = new URL(richiesta.url);
    return paginaAnteprima(url.origin, url.href);
  }

  const { serial } = await contesto.params;
  const token = await tokenDaSerial(serial);

  if (token === null) {
    return new Response("Biglietto non valido", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return biglietto(richiesta, { params: Promise.resolve({ token }) });
}
