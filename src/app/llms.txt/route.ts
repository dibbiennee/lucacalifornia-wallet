import { LOCALI_STAGIONE } from "@/contenuti/locali";
import { SERATE } from "@/contenuti/sito";
import { INDIRIZZO, SITO_PUBBLICO } from "@/lib/pubblico";

export const dynamic = "force-static";

/**
 * Il file che spiega il sito ai motori che rispondono con l'AI.
 *
 * Quelli non eseguono il codice: leggono il sorgente e basta. Qui trovano in
 * chiaro chi è Luca, dove lavora, che serate fa e come si prenota, senza
 * doverlo dedurre.
 *
 * È generato dalle stesse liste che fanno il sito, quindi quando si aggiunge
 * una serata o un locale si aggiorna da solo invece di invecchiare.
 */
export function GET(): Response {
  const righe = [
    "# Luca California",
    "",
    "> Luca Curella, in arte Luca California, è un PR di Roma: mette in lista e prenota",
    "> tavoli al Room 26 di Roma d'inverno, al Ninfeo di Roma e al Morgan Beach Club di",
    "> Civitavecchia d'estate. Si prenota dal sito, lui conferma su WhatsApp e il",
    "> biglietto arriva nel telefono, da aggiungere ad Apple Wallet o Google Wallet.",
    "",
    "## Serate al Room 26",
    "",
    ...SERATE.map((s) => `- [${s.giorno} ${s.nome}](${INDIRIZZO}/serate/${s.codice}): ${s.musica.toLowerCase()}`),
    "",
    "## Locali, uno per stagione",
    "",
    ...LOCALI_STAGIONE.map((l) => `- [${l.nome}, ${l.citta}](${INDIRIZZO}/locali/${l.codice}): ${l.sottotitolo.toLowerCase()}`),
    "",
    "## Altro",
    "",
    `- [Servizio navetta](${INDIRIZZO}/navetta): dalla tua zona al locale e ritorno a fine serata`,
    `- [Capodanno](${INDIRIZZO}/capodanno): pacchetti serata, cena e hotel`,
    `- [Diventa PR](${INDIRIZZO}/diventa-pr): candidature aperte, formazione in due giorni`,
    `- [Chi è Luca](${INDIRIZZO}/chi-sono)`,
    "",
    SITO_PUBBLICO ? "" : "## Nota\n\nQuesta è un'anteprima del sito, non ancora pubblica.",
  ];

  return new Response(righe.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
