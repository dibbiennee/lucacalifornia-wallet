/**
 * Genera le immagini del pass dal marchio Luca California.
 *
 * Il marchio è un quadrato pieno con due tagli triangolari trasparenti,
 * descritto una volta sola qui sotto come path SVG in viewBox 0 0 100 100.
 *
 *   npm run immagini
 *
 * La strip (l'immagine larga dietro i campi) NON viene sovrascritta se esiste
 * già: lì Luca ci mette la grafica della serata, e il build non deve mangiarla.
 */

import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const CARTELLA = path.join(process.cwd(), "assets", "pass");

/** rgb(43,27,176): lo stesso backgroundColor del pass. */
const BLU = { r: 43, g: 27, b: 176, alpha: 1 };

function marchioSvg(colore) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="600" height="600">` +
      `<path fill="${colore}" fill-rule="evenodd" ` +
      `d="M0 0 H100 V100 H0 Z M0 0 L100 24.7 L100 46.4 Z M0 0 L100 75 L50 100 Z"/>` +
      `</svg>`,
  );
}

async function esiste(percorso) {
  try {
    await access(percorso);
    return true;
  } catch {
    return false;
  }
}

/** Icona: marchio bianco centrato su una piastrella blu (l'icona non deve essere trasparente). */
async function iconaSuBlu(nomeFile, lato) {
  const latoMarchio = Math.round(lato * 0.68);
  const marchio = await sharp(marchioSvg("#FFFFFF"))
    .resize(latoMarchio, latoMarchio)
    .png()
    .toBuffer();

  await sharp({ create: { width: lato, height: lato, channels: 4, background: BLU } })
    .composite([{ input: marchio, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(CARTELLA, nomeFile));

  console.log(`  ${nomeFile} (${lato}x${lato})`);
}

/** Logo: marchio bianco su fondo trasparente, sta sopra il backgroundColor del pass. */
async function logoTrasparente(nomeFile, lato) {
  await sharp(marchioSvg("#FFFFFF"))
    .resize(lato, lato)
    .png({ compressionLevel: 9 })
    .toFile(path.join(CARTELLA, nomeFile));

  console.log(`  ${nomeFile} (${lato}x${lato})`);
}

/** Strip: per ora un segnaposto blu pieno, da sostituire con la grafica della serata. */
async function stripSegnaposto(nomeFile, larghezza, altezza) {
  const percorso = path.join(CARTELLA, nomeFile);
  if (await esiste(percorso)) {
    console.log(`  ${nomeFile} già presente, lasciata com'è`);
    return;
  }

  await sharp({ create: { width: larghezza, height: altezza, channels: 4, background: BLU } })
    .png({ compressionLevel: 9 })
    .toFile(percorso);

  console.log(`  ${nomeFile} (${larghezza}x${altezza}) segnaposto`);
}

await mkdir(CARTELLA, { recursive: true });

console.log("Icone:");
await iconaSuBlu("icon.png", 29);
await iconaSuBlu("icon@2x.png", 58);
await iconaSuBlu("icon@3x.png", 87);

console.log("Logo:");
await logoTrasparente("logo.png", 50);
await logoTrasparente("logo@2x.png", 100);
await logoTrasparente("logo@3x.png", 150);

console.log("Strip:");
await stripSegnaposto("strip.png", 375, 123);
await stripSegnaposto("strip@2x.png", 750, 246);
await stripSegnaposto("strip@3x.png", 1125, 369);

console.log(`\nFatto: ${CARTELLA}`);
