import { LOCALE, SERATE } from "@/contenuti/sito";

export const dynamic = "force-dynamic";

/** Da nome del giorno a indice JS (0 = domenica) e codice RRULE. */
const GIORNI_SETTIMANA: Record<string, { indice: number; codice: string }> = {
  Giovedì: { indice: 4, codice: "TH" },
  Venerdì: { indice: 5, codice: "FR" },
  Sabato: { indice: 6, codice: "SA" },
  Domenica: { indice: 0, codice: "SU" },
};

function comeData(d: Date): string {
  const anno = d.getFullYear();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${anno}${mese}${giorno}`;
}

function comeUtc(d: Date): string {
  return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** Le virgole e i punto e virgola nel testo confonderebbero il formato iCalendar. */
function escapa(testo: string): string {
  return testo.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Il file .ics di una serata: ricorrente ogni settimana, sullo stesso giorno.
 *
 * Non c'è un orario vero nei contenuti (solo "Ogni giovedì" e simili): finché
 * Luca non dà orari diversi per serata, si usa 23:30-04:00 per tutte.
 */
export async function GET(_richiesta: Request, { params }: { params: Promise<{ codice: string }> }) {
  const { codice } = await params;
  const serata = SERATE.find((s) => s.codice === codice);

  if (serata === undefined) {
    return new Response("Serata non trovata", { status: 404 });
  }

  const giornoInfo = GIORNI_SETTIMANA[serata.giorno];
  if (giornoInfo === undefined) {
    return new Response("Giorno sconosciuto", { status: 500 });
  }

  const oggi = new Date();
  const differenza = (giornoInfo.indice - oggi.getDay() + 7) % 7;
  const inizio = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() + differenza);
  const fine = new Date(inizio);
  fine.setDate(fine.getDate() + 1);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Luca California//Serate//IT",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${serata.codice}@lucacalifornia.satoshiweb.it`,
    `DTSTAMP:${comeUtc(new Date())}`,
    `DTSTART;TZID=Europe/Rome:${comeData(inizio)}T233000`,
    `DTEND;TZID=Europe/Rome:${comeData(fine)}T040000`,
    `RRULE:FREQ=WEEKLY;BYDAY=${giornoInfo.codice}`,
    `SUMMARY:${escapa(`${serata.nome} al ${LOCALE.nome}`)}`,
    `DESCRIPTION:${escapa(serata.descrizione)}`,
    `LOCATION:${escapa(LOCALE.indirizzo)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${serata.codice}.ics"`,
    },
  });
}
