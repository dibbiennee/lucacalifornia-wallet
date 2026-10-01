/**
 * Le date vere fra cui scegliere nel modulo.
 *
 * Non più "ogni giovedì" in astratto: il calendario di Luca ha una fine al
 * ROOM26 e un cambio di locale, quindi il modulo deve mostrare i giorni
 * veri, non solo il nome della serata che si ripete all'infinito.
 *
 * Gira anche nel browser: niente API di Node qui dentro.
 */

export type NotteSerata = "milkshake" | "venerdi" | "sabato" | "bailame" | "ninfeo";

interface GiornoAnno {
  readonly anno: number;
  readonly mese: number;
  readonly giorno: number;
}

/** L'ultima domenica al ROOM26, prima del trasloco estivo al Ninfeo. */
const FINE_ROOM26: GiornoAnno = { anno: 2027, mese: 5, giorno: 9 };
/** Il primo giovedì al Ninfeo. */
const INIZIO_NINFEO: GiornoAnno = { anno: 2027, mese: 5, giorno: 13 };
/** L'ultimo weekend che il modulo lascia scegliere: il calendario di Luca non arriva oltre. */
const FINE_NINFEO: GiornoAnno = { anno: 2027, mese: 9, giorno: 30 };

/** Le quattro serate del ROOM26, dal giorno della settimana (0 domenica … 6 sabato). */
const NOTTI_ROOM26: Readonly<Record<number, { readonly notte: NotteSerata; readonly nome: string }>> = {
  4: { notte: "milkshake", nome: "Milkshake" },
  5: { notte: "venerdi", nome: "Drip" },
  6: { notte: "sabato", nome: "International" },
  0: { notte: "bailame", nome: "Bàilame" },
};

/** Il nome da biglietto di ogni notte: quello che Luca scrive su WhatsApp e che finisce nel pass. */
const NOMI_BIGLIETTO: Readonly<Record<NotteSerata, string>> = {
  milkshake: "MILKSHAKE",
  venerdi: "DRIP",
  sabato: "INTERNATIONAL",
  bailame: "BÀILAME",
  ninfeo: "NINFEO",
};

function comeData(g: GiornoAnno): Date {
  return new Date(g.anno, g.mese - 1, g.giorno);
}

function comeIso(d: Date): string {
  const anno = d.getFullYear();
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function maiuscolaIniziale(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

const FORMATO_GIORNO = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" });

function etichetta(d: Date, nome: string): string {
  return `${maiuscolaIniziale(FORMATO_GIORNO.format(d))}, ${nome}`;
}

export interface VoceCalendarioSerata {
  /** Quello che si legge nel menu, e che Luca rivede tale e quale nel pannello. */
  readonly valore: string;
  /** AAAA-MM-GG, per il prezzo e per il biglietto. */
  readonly data: string;
  readonly notte: NotteSerata;
}

/**
 * Le serate selezionabili, da oggi in poi: le quattro del ROOM26 fino a
 * domenica 9 maggio 2027, poi NINFEO (giovedì, venerdì, sabato) fino a fine
 * settembre 2027. Una serata già passata non ha senso da prenotare, quindi
 * la lista parte sempre da "oggi".
 */
export function calendarioSerate(oggi: Date = new Date()): readonly VoceCalendarioSerata[] {
  const voci: VoceCalendarioSerata[] = [];
  const fineRoom26 = comeData(FINE_ROOM26);
  const inizioNinfeo = comeData(INIZIO_NINFEO);
  const fineNinfeo = comeData(FINE_NINFEO);

  const cursore = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate());

  while (cursore.getTime() <= fineRoom26.getTime()) {
    const notte = NOTTI_ROOM26[cursore.getDay()];
    if (notte !== undefined) {
      voci.push({ valore: etichetta(cursore, notte.nome), data: comeIso(cursore), notte: notte.notte });
    }
    cursore.setDate(cursore.getDate() + 1);
  }

  const cursoreNinfeo = cursore.getTime() < inizioNinfeo.getTime() ? new Date(inizioNinfeo) : cursore;
  while (cursoreNinfeo.getTime() <= fineNinfeo.getTime()) {
    const giorno = cursoreNinfeo.getDay();
    if (giorno === 4 || giorno === 5 || giorno === 6) {
      voci.push({ valore: etichetta(cursoreNinfeo, "NINFEO"), data: comeIso(cursoreNinfeo), notte: "ninfeo" });
    }
    cursoreNinfeo.setDate(cursoreNinfeo.getDate() + 1);
  }

  return voci;
}

/**
 * La notte e il nome da biglietto di una data già scelta, con la stessa
 * regola di calendarioSerate: usata lato server, per non fidarsi di quello
 * che manda il browser.
 */
export function serataPerData(dataIso: string): { readonly notte: NotteSerata; readonly nomeSerata: string } | null {
  const pezzi = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataIso);
  if (pezzi === null) {
    return null;
  }

  const data = new Date(Number(pezzi[1]), Number(pezzi[2]) - 1, Number(pezzi[3]));
  if (Number.isNaN(data.getTime())) {
    return null;
  }

  const fineRoom26 = comeData(FINE_ROOM26);
  const inizioNinfeo = comeData(INIZIO_NINFEO);
  const fineNinfeo = comeData(FINE_NINFEO);

  if (data.getTime() <= fineRoom26.getTime()) {
    const notte = NOTTI_ROOM26[data.getDay()];
    return notte === undefined ? null : { notte: notte.notte, nomeSerata: NOMI_BIGLIETTO[notte.notte] };
  }

  if (data.getTime() >= inizioNinfeo.getTime() && data.getTime() <= fineNinfeo.getTime() && [4, 5, 6].includes(data.getDay())) {
    return { notte: "ninfeo", nomeSerata: NOMI_BIGLIETTO.ninfeo };
  }

  return null;
}
