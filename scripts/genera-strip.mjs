/**
 * Prepara la fascia del biglietto (la "strip") partendo da un'immagine.
 *
 *   node scripts/genera-strip.mjs materiale/foto-sala.png
 *
 * Ritaglia al formato giusto nelle tre densità che vuole Apple e stende una
 * sfumatura scura sulla sinistra.
 *
 * Quella sfumatura non è un vezzo: iOS scrive il nome della serata in bianco
 * sopra questa fascia, e il nome è grande: su un telefono arriva a coprire
 * quattro quinti della larghezza. Per questo resta scura fin quasi a destra. Senza, su una foto chiara il
 * nome sparisce. Così qualunque immagine arrivi da Luca è utilizzabile senza
 * che lui debba ritoccare niente.
 */

import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const MISURE = [
  ["strip.png", 375, 123],
  ["strip@2x.png", 750, 246],
  ["strip@3x.png", 1125, 369],
];

const sorgente = process.argv[2];

if (!sorgente) {
  console.error("Uso: node scripts/genera-strip.mjs <immagine>");
  process.exit(1);
}

const cartella = path.join(process.cwd(), "assets", "pass");
const { width = 0, height = 0 } = await sharp(sorgente).metadata();

console.log(`sorgente: ${sorgente} (${width}x${height})`);

if (width < 1125 || height < 369) {
  console.warn(
    `  attenzione: per la densità @3x servirebbero almeno 1125x369.\n` +
      `  Con questa immagine la fascia grande viene ingrandita, e sul telefono si vede.`,
  );
}

function velo(larghezza, altezza) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${larghezza}" height="${altezza}">` +
      `<defs><linearGradient id="v" x1="0" y1="0" x2="1" y2="0">` +
      `<stop offset="0" stop-color="#05021F" stop-opacity="0.88"/>` +
      `<stop offset="0.5" stop-color="#05021F" stop-opacity="0.66"/>` +
      `<stop offset="0.82" stop-color="#05021F" stop-opacity="0.3"/>` +
      `<stop offset="1" stop-color="#05021F" stop-opacity="0.12"/>` +
      `</linearGradient></defs>` +
      `<rect width="${larghezza}" height="${altezza}" fill="url(#v)"/></svg>`,
  );
}

for (const [nome, larghezza, altezza] of MISURE) {
  const ritagliata = await sharp(sorgente)
    .resize(larghezza, altezza, { fit: "cover", position: "centre" })
    .toBuffer();

  await sharp(ritagliata)
    .composite([{ input: velo(larghezza, altezza) }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(cartella, nome));

  console.log(`  ${nome} (${larghezza}x${altezza})`);
}
