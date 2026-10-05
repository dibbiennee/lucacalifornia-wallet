import { bigliettoValido } from "@/lib/pannello/dati";

import { creaBiglietto } from "./biglietto";
import { creaPdfBiglietto } from "./pdf";
import { leggiToken } from "./token";

/**
 * Il biglietto di una prenotazione, nel formato giusto per chi lo apre.
 *
 *   wallet  il .pkpass di Apple Wallet (iPhone, iPad, Safari su Mac)
 *   pdf     il PDF con il QR, che si apre su qualunque telefono e sul computer
 *
 * Il token è la prenotazione: se si apre, la prenotazione esiste. Una cosa si controlla però nel database:
 * Luca può cambiare decisione, e una richiesta che non è più confermata non dà più il biglietto (410), in
 * tutti e due i formati. Vedi bigliettoValido().
 */
export type FormatoBiglietto = "wallet" | "pdf";

const TESTO = { "Content-Type": "text/plain; charset=utf-8" } as const;

/** Chi ha un dispositivo Apple apre il biglietto in Wallet; tutti gli altri ricevono il PDF. */
export function formatoPerDispositivo(agente: string | null): FormatoBiglietto {
  return /iPhone|iPad|iPod|Macintosh/i.test(agente ?? "") ? "wallet" : "pdf";
}

/** "?formato=pdf" o "?formato=wallet" lo decide chi apre il link, in tutti i casi. */
export function formatoRichiesto(url: string, agente: string | null): FormatoBiglietto {
  const voluto = new URL(url).searchParams.get("formato");
  return voluto === "pdf" || voluto === "wallet" ? voluto : formatoPerDispositivo(agente);
}

export async function rispostaBiglietto(token: string, formato: FormatoBiglietto): Promise<Response> {
  const prenotazione = leggiToken(token);

  if (prenotazione === null) {
    return new Response("Biglietto non valido", { status: 404, headers: TESTO });
  }

  try {
    if (!(await bigliettoValido(prenotazione.serialNumber))) {
      return new Response("Questo biglietto non è più valido", { status: 410, headers: { ...TESTO, "Cache-Control": "no-store" } });
    }

    const nomeFile = `biglietto-${prenotazione.serata.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    if (formato === "pdf") {
      const pdf = await creaPdfBiglietto({ ...prenotazione, token });

      return new Response(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          // "inline": su Android e sul computer si apre nel lettore invece di restare in una cartella.
          "Content-Disposition": `inline; filename="${nomeFile}.pdf"`,
          "Content-Length": String(pdf.byteLength),
          "Cache-Control": "no-store",
          // La risposta cambia con il dispositivo: niente copie in cache fra un telefono e l'altro.
          Vary: "User-Agent",
        },
      });
    }

    const pkpass = await creaBiglietto({ ...prenotazione, token });

    return new Response(new Uint8Array(pkpass), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="${nomeFile}.pkpass"`,
        "Content-Length": String(pkpass.byteLength),
        "Cache-Control": "no-store",
        Vary: "User-Agent",
      },
    });
  } catch (errore: unknown) {
    // Solo il messaggio: nei log non deve finire niente dei certificati.
    const messaggio = errore instanceof Error ? errore.message : "errore sconosciuto";
    console.error(`[biglietto] ${formato} non generato:`, messaggio);

    return new Response(`Biglietto non generato: ${messaggio}`, { status: 500, headers: TESTO });
  }
}
