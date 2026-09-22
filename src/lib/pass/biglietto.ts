import { Buffer } from "node:buffer";
import { PKPass, PassType } from "passkit-generator";

import { certificati } from "./certificati";
import { INSTAGRAM, NOME_ORGANIZZAZIONE, leggiConfigurazionePass } from "./configurazione";
import { immagini } from "./immagini";
import type { DatiBiglietto } from "./tipi";

/** Colori del biglietto. Apple li vuole in questa forma, non esadecimali. */
const SFONDO = "rgb(43,27,176)";
const TESTO = "rgb(255,255,255)";
const ETICHETTE = "rgb(201,195,255)";

/**
 * Costruisce il .pkpass firmato di un biglietto.
 *
 * Unico punto in cui si decide che aspetto ha il biglietto: la fase 2
 * cambierà solo da dove arrivano i dati, non questa funzione.
 */
export async function creaBiglietto(dati: DatiBiglietto): Promise<Buffer> {
  const { passTypeIdentifier, teamIdentifier } = leggiConfigurazionePass();
  const [file, certs] = await Promise.all([immagini(), certificati()]);

  const pass = new PKPass({ ...file }, certs, {
    formatVersion: 1,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber: dati.serialNumber,
    organizationName: NOME_ORGANIZZAZIONE,
    description: `Biglietto ${dati.serata}`,
    // Niente logoText: il nome sta dentro l'immagine del logo. iOS scrive
    // logoText e il campo intestazione sulla stessa riga, e con un nome lungo
    // si toccano: sul telefono si leggeva "LUCA CALIFORNIA26 Sep 2026".
    backgroundColor: SFONDO,
    foregroundColor: TESTO,
    labelColor: ETICHETTE,
    // La strip resta piatta: il riflesso lucido di serie è un tocco datato.
    suppressStripShine: true,
  });

  const biglietto = new PassType("eventTicket");
  pass.types.push(biglietto);

  biglietto.headerFields.push({
    key: "data",
    label: "DATA",
    value: dati.inizioSerata,
    dateStyle: "PKDateStyleMedium",
    timeStyle: "PKDateStyleNone",
  });

  biglietto.primaryFields.push({
    key: "serata",
    label: "SERATA",
    value: dati.serata,
  });

  biglietto.secondaryFields.push(
    { key: "tipo", label: "TIPO", value: dati.tipo },
    { key: "nome", label: "NOME", value: dati.nomeCliente },
  );

  biglietto.auxiliaryFields.push({ key: "locale", label: "LOCALE", value: dati.locale });

  if (dati.sala !== undefined && dati.sala !== "") {
    biglietto.auxiliaryFields.push({ key: "sala", label: "SALA", value: dati.sala });
  }

  // L'ora sta qui e non nell'intestazione: riempie la riga che resterebbe
  // mezza vuota, e a chi legge serve più del giorno, che è già in alto.
  biglietto.auxiliaryFields.push({
    key: "ora",
    label: "DALLE",
    value: dati.inizioSerata,
    dateStyle: "PKDateStyleNone",
    timeStyle: "PKDateStyleShort",
  });

  biglietto.backFields.push(
    {
      key: "indirizzo",
      label: "DOVE",
      value: dati.indirizzo,
      dataDetectorTypes: ["PKDataDetectorTypeAddress"],
    },
    { key: "instagram", label: "INSTAGRAM", value: INSTAGRAM },
    { key: "ingresso", label: "ALL'INGRESSO", value: "Mostra questo QR all'ingresso" },
  );

  pass.setBarcodes({
    format: "PKBarcodeFormatQR",
    message: dati.token,
    messageEncoding: "iso-8859-1",
  });

  // Fa comparire il biglietto in blocco schermo attorno all'inizio della serata.
  // relevantDate è deprecato da iOS 18 ma serve ai telefoni più vecchi:
  // impostiamo tutte e due le forme.
  pass.setRelevantDate(dati.inizioSerata);
  pass.setRelevantDates([{ date: dati.inizioSerata, relevantDate: dati.inizioSerata }]);

  return pass.getAsBuffer();
}
