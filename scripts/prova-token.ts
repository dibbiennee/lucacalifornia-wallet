/**
 * Prova a mano del token cifrato.
 *
 *   SEGRETO_BIGLIETTO=una-frase-lunga-abbastanza node scripts/prova-token.ts
 *
 * Controlla tre cose: che un token torni uguale a com'è partito, che uno
 * manomesso venga rifiutato senza esplodere, e che stia dentro una lunghezza
 * che la fotocamera riesce a leggere.
 */

import { creaToken, leggiToken, nuovoSerialNumber } from "../src/lib/pass/token.ts";
import type { Prenotazione } from "../src/lib/pass/tipi.ts";

const partenza: Prenotazione = {
  serialNumber: nuovoSerialNumber(),
  serata: "BÁILAME",
  inizioSerata: new Date("2026-09-27T21:30:00.000Z"),
  tipo: "TAVOLO, MISTO",
  nomeCliente: "Mario Rossi",
  locale: "room26",
  sala: "Privé",
};

let errori = 0;

function controlla(descrizione: string, condizione: boolean): void {
  console.log(`${condizione ? "  ok  " : "  NO  "} ${descrizione}`);
  if (!condizione) {
    errori += 1;
  }
}

const token = creaToken(partenza);
console.log(`token (${token.length} caratteri):\n  ${token}\n`);

const ritorno = leggiToken(token);

controlla("il token si riapre", ritorno !== null);
controlla("nome uguale", ritorno?.nomeCliente === partenza.nomeCliente);
controlla("serata uguale", ritorno?.serata === partenza.serata);
controlla("tipo uguale", ritorno?.tipo === partenza.tipo);
controlla("locale uguale", ritorno?.locale === partenza.locale);
controlla("sala uguale", ritorno?.sala === partenza.sala);
controlla(
  "data e ora uguali",
  ritorno?.inizioSerata.getTime() === partenza.inizioSerata.getTime(),
);
controlla("identificativo uguale", ritorno?.serialNumber === partenza.serialNumber);

const meta = Math.floor(token.length / 2);
const carattereDiverso = token[meta] === "A" ? "B" : "A";
const manomesso = token.slice(0, meta) + carattereDiverso + token.slice(meta + 1);

controlla("un token manomesso viene rifiutato", leggiToken(manomesso) === null);
controlla("una stringa qualsiasi viene rifiutata", leggiToken("non-sono-un-token") === null);
controlla("una stringa vuota viene rifiutata", leggiToken("") === null);
controlla(
  "il nome non si legge senza la chiave",
  !Buffer.from(token, "base64url").toString("latin1").includes("Mario"),
);
controlla("il token sta sotto i 300 caratteri", token.length < 300);

console.log(errori === 0 ? "\nTutto a posto." : `\n${errori} controlli falliti.`);
process.exit(errori === 0 ? 0 : 1);
