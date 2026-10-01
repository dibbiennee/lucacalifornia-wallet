import { cookies } from "next/headers";

import { BISCOTTO_PROVENIENZA, nomeProvenienza } from "@/contenuti/canali";
import { creaRichiesta, type NuovaRichiesta } from "@/lib/pannello/dati";
import { avvisaTutti } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Riceve una richiesta di lista, tavolo o navetta.
 *
 * La scrive su Postgres e avvisa chi ha acceso le notifiche nel pannello:
 * da qui in poi una richiesta vera arriva davvero a Luca.
 *
 * Qui non parte nessun messaggio al cliente: ogni messaggio a chi prenota lo
 * manda Luca a mano, ed è una regola del brief. L'avviso push va solo a lui.
 */

interface Richiesta {
  readonly tipo: string;
  readonly nome: string;
  readonly cognome: string;
  readonly telefono: string;
  readonly serata: string;
  readonly gruppo?: string;
  readonly budget?: string;
  readonly occasione?: string;
  readonly note?: string;
  readonly zona?: string;
}

const TIPI = ["lista", "tavolo", "navetta"] as const;

/** Le stesse quattro scelte del modulo (vedi Modulo.tsx), verso i dati del pannello. */
const SERATE: Readonly<
  Record<string, { readonly serata: string; readonly nomeSerata: string; readonly codiceSerata: string; readonly sala?: string }>
> = {
  "Gio Milkshake": { serata: "Giovedì", nomeSerata: "MILKSHAKE", codiceSerata: "milkshake" },
  "Ven Drip": { serata: "Venerdì", nomeSerata: "DRIP", codiceSerata: "venerdi" },
  "Sab International": { serata: "Sabato", nomeSerata: "INTERNATIONAL", codiceSerata: "sabato" },
  "Dom Bàilame": { serata: "Domenica Bàilame", nomeSerata: "BÀILAME", codiceSerata: "bailame" },
};

function testo(valore: unknown, massimo: number): string | null {
  if (typeof valore !== "string") {
    return null;
  }
  const pulito = valore.trim();
  return pulito.length > 0 && pulito.length <= massimo ? pulito : null;
}

export async function POST(richiesta: Request): Promise<Response> {
  let corpo: unknown;

  try {
    corpo = await richiesta.json();
  } catch {
    return Response.json({ errore: "Richiesta illeggibile" }, { status: 400 });
  }

  const c = corpo as Partial<Richiesta>;
  const nome = testo(c.nome, 60);
  const cognome = testo(c.cognome, 60);
  const telefono = testo(c.telefono, 30);
  const serataScelta = testo(c.serata, 60);
  const tipo = testo(c.tipo, 20);

  if (tipo === null || !TIPI.includes(tipo as (typeof TIPI)[number])) {
    return Response.json({ errore: "Tipo di richiesta sconosciuto" }, { status: 400 });
  }

  // La navetta si chiede con nome, telefono, serata e zona: il cognome no,
  // perché è un modulo corto che si compila mentre si sta già uscendo.
  const navetta = tipo === "navetta";
  const zona = testo(c.zona, 80);

  if (nome === null || telefono === null || serataScelta === null) {
    return Response.json({ errore: "Servono nome, telefono e la serata" }, { status: 400 });
  }

  if (!navetta && cognome === null) {
    return Response.json({ errore: "Serve anche il cognome" }, { status: 400 });
  }

  if (navetta && zona === null) {
    return Response.json({ errore: "Serve la zona da cui parti" }, { status: 400 });
  }

  if (telefono.replace(/\D/g, "").length < 9) {
    return Response.json({ errore: "Il numero di telefono non sembra giusto" }, { status: 400 });
  }

  const tavolo = tipo === "tavolo";

  /*
   * Da dove arriva chi prenota. Non lo chiede il modulo: lo sa il sito,
   * perché chi è entrato da /ig o da /marco si porta dietro un biscotto.
   * Chi arriva digitando l'indirizzo risulta "Diretto", che è la verità.
   */
  const provenienza = nomeProvenienza((await cookies()).get(BISCOTTO_PROVENIENZA)?.value);

  const mappata = SERATE[serataScelta];
  const nomeCompleto = cognome === null ? nome : `${nome} ${cognome}`;
  const gruppo = tavolo ? testo(c.gruppo, 40) : null;
  const budget = tavolo ? testo(c.budget, 40) : null;
  const occasione = tavolo ? testo(c.occasione, 60) : null;
  const note = tavolo ? testo(c.note, 300) : null;

  const daSalvare: NuovaRichiesta = {
    nome: nomeCompleto,
    telefono,
    serata: mappata?.serata ?? serataScelta,
    nomeSerata: mappata?.nomeSerata ?? serataScelta.toUpperCase(),
    codiceSerata: mappata?.codiceSerata ?? "altro",
    tipo: tipo as NuovaRichiesta["tipo"],
    provenienza,
    ...(mappata?.sala === undefined ? {} : { sala: mappata.sala }),
    ...(gruppo === null ? {} : { gruppo }),
    ...(budget === null ? {} : { budget }),
    ...(occasione === null ? {} : { occasione }),
    ...(note === null ? {} : { messaggio: note }),
    ...(navetta && zona !== null ? { zona } : {}),
  };

  const salvata = await creaRichiesta(daSalvare);

  const corpoAvviso =
    tipo === "tavolo"
      ? `Tavolo, ${salvata.serata}${salvata.sala === undefined ? "" : `, ${salvata.sala}`}`
      : tipo === "navetta"
        ? `Navetta da ${zona}, ${salvata.serata}`
        : `Lista, ${salvata.serata}`;

  // Se il push fallisce (nessuno iscritto, un endpoint scaduto...) la
  // richiesta è comunque salvata: Luca la vede aprendo il pannello.
  await avvisaTutti(nomeCompleto, corpoAvviso, `/pannello/richieste/${salvata.id}`).catch(() => undefined);

  return Response.json(
    { salvata: true, id: salvata.id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
