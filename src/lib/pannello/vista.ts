import { legaParole } from "@/lib/tipografia";

import type { RichiestaPannello, StatoRichiesta } from "./dati";
import { etichettaMotivo, type CodiceMotivo } from "./motivi";

/**
 * Lega le parole che non devono andare a capo da sole ("Sala 1", "35–50 €",
 * "5 persone"), più i pochi casi che legaParole non conosce: "1 persona",
 * "Oltre 50", e la data breve ("Sab 3 ott").
 */
function lega(testo: string): string {
  return legaParole(testo, { vedova: false })
    .replace(/(\d\+?) (persone|persona)\b/g, "$1 $2")
    .replace(/\b(Oltre|oltre) (\d)/g, "$1 $2")
    .replace(/\b(Lun|Mar|Mer|Gio|Ven|Sab|Dom) (\d)/g, "$1 $2")
    .replace(/(\d) (gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)\b/g, "$1 $2");
}

/**
 * Da una richiesta del database a quello che si legge nelle schermate.
 *
 * Funzioni pure e oggetti semplici: le chiamano i componenti server (che
 * preparano le voci) e le leggono quelli client (che le mostrano), quindi
 * niente date "di adesso" calcolate nel browser: due calcoli diversi per la
 * stessa pagina darebbero un errore di idratazione.
 */

export type Filtro = "attesa" | "confermate" | "tutte";

export type Tono = "nuova" | "ok" | "attesa" | "off";

/** Le serate in ordine, con il giorno in cui cadono. Ninfeo e "altro" chiudono l'elenco. */
export const GRUPPI = [
  { codice: "milkshake", nome: "Milkshake", giorno: "Giovedì" },
  { codice: "venerdi", nome: "Drip", giorno: "Venerdì" },
  { codice: "sabato", nome: "International", giorno: "Sabato" },
  { codice: "bailame", nome: "Bàilame", giorno: "Domenica" },
  { codice: "ninfeo", nome: "NINFEO", giorno: "" },
  { codice: "altro", nome: "Altre", giorno: "" },
] as const;

export type CodiceGruppo = (typeof GRUPPI)[number]["codice"];

/** "Giovedì · Milkshake"; per chi non ha un giorno fisso, solo il nome. */
export function etichettaGruppo(codice: CodiceGruppo): string {
  const g = GRUPPI.find((x) => x.codice === codice);
  if (g === undefined || g.giorno === "") {
    return g?.nome ?? "Altre";
  }
  return `${g.giorno} · ${g.nome}`;
}

export interface VoceRichiesta {
  readonly id: string;
  readonly nome: string;
  readonly iniziali: string;
  /** Solo per Luca: a un PR la voce arriva senza (vedi COLONNE_PR in dati.ts). */
  readonly telefono?: string;
  readonly stato: StatoRichiesta;
  /** L'etichetta nella scheda in elenco: "Biglietto inviato", non "Confermata". */
  readonly chip: string;
  /** L'etichetta nel dettaglio: "Confermata". */
  readonly statoEsteso: string;
  readonly tono: Tono;
  readonly gruppo: CodiceGruppo;
  /** Il nome della serata: "International". */
  readonly notte: string;
  /** "Sab 12 dic", o la scritta di prima per le richieste senza data. */
  readonly giorno: string;
  /** AAAA-MM-GG, per dividere per data nel riepilogo. Manca nelle richieste di prima del calendario. */
  readonly dataIso?: string;
  readonly sala?: string;
  /** "Tavolo misto", "Bracciale donna", "Lista". */
  readonly tipo: string;
  /** Una riga di numeri per il riepilogo: "tavolo", "lista", "bracciale", "navetta". */
  readonly tipoBase: "tavolo" | "lista" | "braccialetto" | "navetta";
  readonly persone?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly messaggio?: string;
  /** "International · Sala 1 · Sab 12 dic · Tavolo misto · 4 persone · 25–30 €". */
  readonly riga: string;
  /** L'ora che si vede a destra: quella del biglietto, se già inviato. */
  readonly ora: string;
  /** "oggi 20:04", "ieri 18:40", "12 dic 10:20". */
  readonly arrivata: string;
  readonly inviatoAlle?: string;
  readonly creataIso: string;
  /** Il PR che l'ha portata ("Antonio"), per Luca. Senza, la richiesta è diretta. */
  readonly prNome?: string;
  /** L'id del PR, per Luca. */
  readonly prId?: string;
  /** Il motivo del rifiuto, com'è scritto nell'elenco: lo vedono Luca e il PR. */
  readonly motivo?: string;
  readonly motivoCodice?: CodiceMotivo;
}

const STATO: Readonly<Record<StatoRichiesta, { chip: string; esteso: string; tono: Tono }>> = {
  confermata: { chip: "Biglietto inviato", esteso: "Confermata", tono: "ok" },
  "in attesa": { chip: "In attesa", esteso: "In attesa", tono: "attesa" },
  rifiutata: { chip: "Rifiutata", esteso: "Rifiutata", tono: "off" },
};

const GIORNO_BREVE = new Intl.DateTimeFormat("it-IT", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

const SOLO_DATA = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", day: "numeric", month: "short" });

const GIORNO_ROMA = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });

const ORA_ROMA = new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" });

function maiuscola(testo: string): string {
  return testo.length === 0 ? testo : testo.charAt(0).toUpperCase() + testo.slice(1);
}

const GIORNO_LUNGO = new Intl.DateTimeFormat("it-IT", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** "2026-12-12" → "Sabato 12 dicembre". */
export function giornoLungo(dataIso: string): string {
  const [a, m, g] = dataIso.split("-").map(Number);
  if (a === undefined || m === undefined || g === undefined || Number.isNaN(a + m + g)) {
    return dataIso;
  }
  return maiuscola(GIORNO_LUNGO.format(new Date(Date.UTC(a, m - 1, g))));
}

/** "2026-12-12" → "Sab 12 dic". */
export function giornoBreve(dataIso: string): string {
  const [a, m, g] = dataIso.split("-").map(Number);
  if (a === undefined || m === undefined || g === undefined || Number.isNaN(a + m + g)) {
    return dataIso;
  }
  return maiuscola(GIORNO_BREVE.format(new Date(Date.UTC(a, m - 1, g))).replace(/\./g, ""));
}

/** "Gian Marco" → "gianmarco": quello che finisce nel link. Stessa regola di nomeCorto() in dati.ts, che sta lato server. */
export function slugDaNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function iniziali(nome: string): string {
  return (
    nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

/** "oggi 20:04", "ieri 18:40", "12 dic 10:20": il giorno è quello di Roma, non del server. */
function quandoArrivata(creataIso: string, adesso: Date): string {
  const creata = new Date(creataIso);
  const ora = ORA_ROMA.format(creata);
  const giorno = GIORNO_ROMA.format(creata);

  if (giorno === GIORNO_ROMA.format(adesso)) {
    return `oggi ${ora}`;
  }
  if (giorno === GIORNO_ROMA.format(new Date(adesso.getTime() - 24 * 60 * 60 * 1000))) {
    return `ieri ${ora}`;
  }

  const [a, m, g] = giorno.split("-").map(Number);
  const data = a === undefined || m === undefined || g === undefined ? giorno : SOLO_DATA.format(new Date(Date.UTC(a, m - 1, g))).replace(/\./g, "");
  return `${data} ${ora}`;
}

function codiceGruppo(codice: string): CodiceGruppo {
  return GRUPPI.some((g) => g.codice === codice) ? (codice as CodiceGruppo) : "altro";
}

function etichettaTipo(r: RichiestaPannello): string {
  const gruppo = r.gruppo?.toLowerCase();

  switch (r.tipo) {
    case "tavolo":
      return gruppo === undefined ? "Tavolo" : `Tavolo ${gruppo}`;
    case "braccialetto":
      return gruppo === undefined ? "Bracciale" : `Bracciale ${gruppo}`;
    case "navetta":
      return r.zona === undefined ? "Navetta" : `Navetta da ${r.zona}`;
    default:
      return "Lista";
  }
}

function etichettaPersone(persone: string | undefined): string | undefined {
  if (persone === undefined) {
    return undefined;
  }
  return persone === "1" ? "1 persona" : `${persone} persone`;
}

export function daRichiesta(r: RichiestaPannello, adesso: Date = new Date()): VoceRichiesta {
  const stato = STATO[r.stato];
  const gruppo = codiceGruppo(r.codiceSerata);
  const nomeGruppo = GRUPPI.find((g) => g.codice === gruppo)?.nome ?? r.serata;
  // Chi è senza data (prima del calendario) mostra la scritta che aveva: "Sabato", "Domenica Bàilame".
  const giorno = lega(r.dataSerata === undefined ? r.serata : giornoBreve(r.dataSerata));
  const tipo = etichettaTipo(r);
  const personeGrezze = etichettaPersone(r.persone);
  const persone = personeGrezze === undefined ? undefined : lega(personeGrezze);
  const occasione = r.occasione === undefined || r.occasione === "Nessuna" ? undefined : r.occasione;

  return {
    id: r.id,
    nome: r.nome,
    iniziali: iniziali(r.nome),
    ...(r.telefono === undefined ? {} : { telefono: r.telefono }),
    stato: r.stato,
    chip: stato.chip,
    statoEsteso: stato.esteso,
    tono: stato.tono,
    gruppo,
    notte: gruppo === "altro" ? r.nomeSerata : nomeGruppo,
    giorno,
    ...(r.dataSerata === undefined ? {} : { dataIso: r.dataSerata }),
    ...(r.sala === undefined ? {} : { sala: lega(r.sala) }),
    tipo,
    tipoBase: r.tipo,
    ...(persone === undefined ? {} : { persone }),
    ...(r.budget === undefined ? {} : { budget: lega(r.budget) }),
    ...(occasione === undefined ? {} : { occasione }),
    ...(r.messaggio === undefined ? {} : { messaggio: r.messaggio }),
    riga: lega(
      [
        r.sala === undefined ? (gruppo === "altro" ? r.nomeSerata : nomeGruppo) : `${nomeGruppo} · ${r.sala}`,
        giorno,
        tipo,
        persone,
        r.budget,
      ]
        .filter((p): p is string => p !== undefined && p !== "")
        .join(" · "),
    ),
    ora: r.stato === "confermata" && r.bigliettoInviatoAlle !== undefined ? r.bigliettoInviatoAlle : r.quando,
    arrivata: quandoArrivata(r.creataIso, adesso),
    ...(r.bigliettoInviatoAlle === undefined ? {} : { inviatoAlle: r.bigliettoInviatoAlle }),
    creataIso: r.creataIso,
    ...(r.prNome === undefined ? {} : { prNome: r.prNome }),
    ...(r.prId === undefined ? {} : { prId: r.prId }),
    ...(r.motivoRifiuto === undefined ? {} : { motivo: etichettaMotivo(r.motivoRifiuto), motivoCodice: r.motivoRifiuto }),
  };
}

/**
 * Quello che ogni stato dice a chi guarda il dettaglio. Per Luca spiega cosa
 * succede se decide; per un PR dice solo com'è andata, perché lui non decide.
 */
export function notaStato(voce: VoceRichiesta, comeLuca: boolean): string {
  if (!comeLuca) {
    switch (voce.stato) {
      case "confermata":
        return "Luca ha confermato la richiesta.";
      case "rifiutata":
        return voce.motivo === undefined ? "Luca ha rifiutato la richiesta." : `Luca ha rifiutato la richiesta. Motivo: ${voce.motivo}.`;
      default:
        return "In attesa: Luca non ha ancora deciso.";
    }
  }

  // La navetta non ha il biglietto: la conferma è solo il messaggio WhatsApp.
  if (voce.tipoBase === "navetta") {
    switch (voce.stato) {
      case "confermata":
        return "Confermata. Puoi riaprire il messaggio WhatsApp, o cambiare decisione.";
      case "in attesa":
        return "In attesa: il cliente non riceve niente finché non decidi. Confermando si apre WhatsApp con il messaggio già scritto. Se lo chiami, la richiesta resta com'è.";
      default:
        break;
    }
  }

  switch (voce.stato) {
    case "confermata":
      return voce.inviatoAlle === undefined
        ? "Confermata. Puoi rimandare il messaggio se il cliente non trova il biglietto, o cambiare decisione."
        : `Biglietto preparato alle ${voce.inviatoAlle}. Puoi rimandare il messaggio se il cliente non lo trova, o cambiare decisione.`;
    case "in attesa":
      return "In attesa: il cliente non riceve niente finché non decidi. Confermando si prepara il biglietto e si apre WhatsApp con il messaggio già scritto. Se lo chiami, la richiesta resta com'è.";
    default:
      return voce.motivo === undefined
        ? "Richiesta rifiutata. Puoi cambiare decisione quando vuoi."
        : `Rifiutata: ${voce.motivo}. Puoi cambiare decisione quando vuoi.`;
  }
}

export function filtraVoci(voci: readonly VoceRichiesta[], filtro: Filtro): readonly VoceRichiesta[] {
  if (filtro === "attesa") {
    return voci.filter((v) => v.stato === "in attesa");
  }
  if (filtro === "confermate") {
    return voci.filter((v) => v.stato === "confermata");
  }
  return voci;
}

/** Il valore dell'indirizzo (?stato=nuova) per un filtro, e il contrario. */
export function statoDaFiltro(filtro: Filtro): string | undefined {
  return filtro === "attesa" ? "in attesa" : filtro === "confermate" ? "confermata" : undefined;
}

export function filtroDaStato(stato: string | null | undefined): Filtro {
  return stato === "in attesa" ? "attesa" : stato === "confermata" ? "confermate" : "tutte";
}

export interface GruppoVoci {
  readonly codice: CodiceGruppo;
  readonly etichetta: string;
  readonly voci: readonly VoceRichiesta[];
}

/** Le voci divise per serata, nell'ordine dell'elenco; i gruppi vuoti non ci sono. */
export function raggruppa(voci: readonly VoceRichiesta[]): readonly GruppoVoci[] {
  return GRUPPI.map((g) => ({
    codice: g.codice,
    etichetta: etichettaGruppo(g.codice),
    voci: voci.filter((v) => v.gruppo === g.codice),
  })).filter((g) => g.voci.length > 0);
}

export interface GruppoSerata {
  /** Data e notte: identifica una serata precisa. */
  readonly chiave: string;
  /** "Sabato 3 ottobre · International", o "Navetta · senza data". */
  readonly etichetta: string;
  readonly voci: readonly VoceRichiesta[];
}

/**
 * Le voci divise per serata (data e notte), nell'ordine in cui le ha date il
 * server: l'ordine non si cambia qui, perché il server pagina. Le richieste
 * senza data (la navetta, quelle di prima del calendario) formano un gruppo
 * per notte, "senza data".
 */
export function raggruppaPerSerata(voci: readonly VoceRichiesta[]): readonly GruppoSerata[] {
  const gruppi: { chiave: string; etichetta: string; voci: VoceRichiesta[] }[] = [];

  for (const v of voci) {
    const chiave = `${v.dataIso ?? ""}|${v.gruppo}`;
    const esistente = gruppi.find((g) => g.chiave === chiave);

    if (esistente !== undefined) {
      esistente.voci.push(v);
      continue;
    }

    gruppi.push({
      chiave,
      etichetta: v.dataIso === undefined ? `${v.notte} · senza data` : `${giornoLungo(v.dataIso)} · ${v.notte}`,
      voci: [v],
    });
  }

  return gruppi;
}

/* ------------------------------ riepilogo ------------------------------ */

export interface GruppoData {
  /** AAAA-MM-GG, o null per le richieste senza data. */
  readonly dataIso: string | null;
  readonly etichetta: string;
  readonly passata: boolean;
  readonly voci: readonly VoceRichiesta[];
}

/**
 * Le voci divise per data: prima oggi e le prossime (la più vicina in alto),
 * poi quelle già passate (la più recente in alto), e in fondo chi non ha una
 * data perché è arrivato prima del calendario. "Oggi" lo decide il chiamante
 * (il server), non questa funzione: così il risultato è uguale ovunque.
 */
export function perData(voci: readonly VoceRichiesta[], oggiIso: string): readonly GruppoData[] {
  const mappa = new Map<string, VoceRichiesta[]>();
  const senzaData: VoceRichiesta[] = [];

  for (const v of voci) {
    if (v.dataIso === undefined) {
      senzaData.push(v);
      continue;
    }
    mappa.set(v.dataIso, [...(mappa.get(v.dataIso) ?? []), v]);
  }

  const date = [...mappa.keys()];
  const prossime = date.filter((d) => d >= oggiIso).sort();
  const passate = date.filter((d) => d < oggiIso).sort().reverse();

  return [
    ...[...prossime, ...passate].map((d) => ({
      dataIso: d,
      etichetta: giornoLungo(d),
      passata: d < oggiIso,
      voci: mappa.get(d) ?? [],
    })),
    ...(senzaData.length === 0
      ? []
      : [{ dataIso: null, etichetta: "Senza data", passata: true, voci: senzaData }]),
  ];
}

const FISSE: readonly CodiceGruppo[] = ["milkshake", "venerdi", "sabato", "bailame"];

export interface Statistiche {
  readonly totale: number;
  readonly confermate: number;
  readonly daGestire: number;
  readonly tavoli: number;
  readonly perSerata: readonly { readonly nome: string; readonly giorno: string; readonly conteggio: number }[];
  readonly perTipo: readonly { readonly nome: string; readonly conteggio: number }[];
}

/** I numeri del riepilogo, dalle richieste vere (quelle rifiutate contano nel totale, non altrove). */
export function statistiche(voci: readonly VoceRichiesta[]): Statistiche {
  const per = (tipo: VoceRichiesta["tipoBase"]) => voci.filter((v) => v.tipoBase === tipo).length;

  return {
    totale: voci.length,
    confermate: voci.filter((v) => v.stato === "confermata").length,
    daGestire: voci.filter((v) => v.stato === "in attesa").length,
    tavoli: per("tavolo"),
    // Le quattro serate del ROOM26 ci sono sempre, anche a zero; Ninfeo e "altre" solo quando hanno richieste.
    perSerata: GRUPPI.map((g) => ({
      codice: g.codice,
      nome: g.nome,
      giorno: g.giorno,
      conteggio: voci.filter((v) => v.gruppo === g.codice).length,
    }))
      .filter((g) => g.conteggio > 0 || FISSE.includes(g.codice))
      .map(({ nome, giorno, conteggio }) => ({ nome, giorno, conteggio })),
    perTipo: [
      { nome: "Tavoli", conteggio: per("tavolo") },
      { nome: "Liste", conteggio: per("lista") },
      { nome: "Bracciali", conteggio: per("braccialetto") },
      { nome: "Navette", conteggio: per("navetta") },
    ].filter((t) => t.conteggio > 0),
  };
}

/* ------------------------------ home del PR ------------------------------ */

export interface NumeriPr {
  readonly totale: number;
  readonly inAttesa: number;
  readonly confermate: number;
  readonly rifiutate: number;
  /** Confermate sul totale, in percentuale intera. Vuoto se non c'è ancora nessuna richiesta. */
  readonly percentualeConfermate: number | null;
  /** Le confermate, per tipo: solo i tipi che ne hanno. */
  readonly confermatePerTipo: readonly { readonly nome: string; readonly conteggio: number }[];
  /** Le confermate per le prossime date (da oggi in poi), la più vicina per prima. */
  readonly prossime: readonly { readonly dataIso: string; readonly etichetta: string; readonly dettaglio: string }[];
  /** Le ultime richieste arrivate, le più recenti in alto. */
  readonly recenti: readonly VoceRichiesta[];
}

const NOMI_TIPO: Readonly<Record<VoceRichiesta["tipoBase"], readonly [string, string]>> = {
  tavolo: ["tavolo", "tavoli"],
  lista: ["lista", "liste"],
  braccialetto: ["bracciale", "bracciali"],
  navetta: ["navetta", "navette"],
};

const TIPI_BASE = Object.keys(NOMI_TIPO) as VoceRichiesta["tipoBase"][];

/** "2 tavoli · 1 lista": le confermate di una data, per tipo. */
function dettaglioTipi(voci: readonly VoceRichiesta[]): string {
  return TIPI_BASE.map((t) => ({ t, n: voci.filter((v) => v.tipoBase === t).length }))
    .filter((x) => x.n > 0)
    .map((x) => `${x.n} ${NOMI_TIPO[x.t][x.n === 1 ? 0 : 1]}`)
    .join(" · ");
}

/**
 * I numeri della home di un PR. Si calcolano SOLO dalle richieste che gli
 * arrivano già filtrate per il suo pr_id (vedi richieste() in dati.ts): questa
 * funzione non sa niente di altri PR e non inventa nulla. "Oggi" lo decide il
 * chiamante, sul server.
 */
export function numeriPr(voci: readonly VoceRichiesta[], oggiIso: string): NumeriPr {
  const conferme = voci.filter((v) => v.stato === "confermata");
  const per = (tipo: VoceRichiesta["tipoBase"]) => conferme.filter((v) => v.tipoBase === tipo).length;

  return {
    totale: voci.length,
    inAttesa: voci.filter((v) => v.stato === "in attesa").length,
    confermate: conferme.length,
    rifiutate: voci.filter((v) => v.stato === "rifiutata").length,
    percentualeConfermate: voci.length === 0 ? null : Math.round((conferme.length / voci.length) * 100),
    confermatePerTipo: TIPI_BASE.map((t) => ({
      nome: NOMI_TIPO[t][1].charAt(0).toUpperCase() + NOMI_TIPO[t][1].slice(1),
      conteggio: per(t),
    })).filter((t) => t.conteggio > 0),
    prossime: perData(conferme, oggiIso)
      .filter((g) => g.dataIso !== null && !g.passata)
      .slice(0, 5)
      .map((g) => ({ dataIso: g.dataIso as string, etichetta: g.etichetta, dettaglio: dettaglioTipi(g.voci) })),
    recenti: [...voci].sort((a, b) => b.creataIso.localeCompare(a.creataIso)).slice(0, 5),
  };
}
