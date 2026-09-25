import webpush from "web-push";

import { db } from "./db";

/**
 * La chiave pubblica: non è un segreto, la manda il browser di Luca insieme
 * alla sua per iscriversi. Sta qui e non in una variabile d'ambiente perché
 * deve arrivare anche al codice che gira nel browser (vedi AttivaNotifiche).
 */
export const VAPID_PUBLIC_KEY =
  "BHmNceJ6546XttdQ5jmikCt8esWukbohk5CVq_c9VI4kSBIZJO1_KIFeM9GuGdZymbBX7ZxHko6aZK1-1nEw9d8";

function configura(): void {
  const privata = process.env["VAPID_PRIVATE_KEY"];

  if (privata === undefined || privata === "") {
    throw new Error("Manca VAPID_PRIVATE_KEY");
  }

  webpush.setVapidDetails("https://lucacalifornia.satoshiweb.it", VAPID_PUBLIC_KEY, privata);
}

export interface Iscrizione {
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
}

export async function salvaIscrizione(iscrizione: Iscrizione): Promise<void> {
  const sql = await db();
  await sql`
    INSERT INTO iscrizioni_push (endpoint, p256dh, auth)
    VALUES (${iscrizione.endpoint}, ${iscrizione.keys.p256dh}, ${iscrizione.keys.auth})
    ON CONFLICT (endpoint) DO NOTHING
  `;
}

export async function togliIscrizione(endpoint: string): Promise<void> {
  const sql = await db();
  await sql`DELETE FROM iscrizioni_push WHERE endpoint = ${endpoint}`;
}

/**
 * Avvisa tutti i telefoni iscritti. Chi ha disinstallato o revocato il
 * permesso risponde 404 o 410: quell'iscrizione si toglie qui, invece di
 * riprovare per sempre a un indirizzo morto.
 */
export async function avvisaTutti(titolo: string, corpo: string, url: string): Promise<void> {
  const sql = await db();
  const iscrizioni = (await sql`
    SELECT endpoint, p256dh, auth FROM iscrizioni_push
  `) as unknown as { endpoint: string; p256dh: string; auth: string }[];

  if (iscrizioni.length === 0) {
    return;
  }

  configura();

  const payload = JSON.stringify({ titolo, corpo, url });

  await Promise.all(
    iscrizioni.map(async (i) => {
      try {
        await webpush.sendNotification(
          { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
          payload,
        );
      } catch (errore) {
        const stato = (errore as { statusCode?: number }).statusCode;
        if (stato === 404 || stato === 410) {
          await togliIscrizione(i.endpoint);
        }
      }
    }),
  );
}
