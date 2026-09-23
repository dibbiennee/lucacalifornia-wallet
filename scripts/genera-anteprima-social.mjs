/**
 * L'immagine che compare quando si condivide il link.
 *
 *   node scripts/genera-anteprima-social.mjs
 *
 * Serve a WhatsApp, Instagram e ai messaggi: senza, il link arriva nudo e
 * sembra sospetto. Luca manderà quel link centinaia di volte, quindi è la
 * prima cosa che vede la gente, prima ancora del sito.
 *
 * 1200x630 è la misura che usano tutti: più piccola viene sgranata, più
 * grande viene tagliata.
 */

import { Buffer } from "node:buffer";
import path from "node:path";
import sharp from "sharp";

const L = 1200;
const A = 630;
const USCITA = path.join(process.cwd(), "public", "anteprima.jpg");

const sfondo = await sharp(path.join(process.cwd(), "public", "video", "apertura-computer.jpg"))
  .resize(L, A, { fit: "cover", position: "top" })
  .toBuffer();

const velo = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}">
    <defs><linearGradient id="v" x1="0" y1="1" x2="0.4" y2="0">
      <stop offset="0" stop-color="#140C5C" stop-opacity="0.95"/>
      <stop offset="0.7" stop-color="#140C5C" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#140C5C" stop-opacity="0.3"/>
    </linearGradient></defs>
    <rect width="${L}" height="${A}" fill="url(#v)"/>
  </svg>`,
);

/*
 * Le scritte nei riquadri, come sul sito: è il marchio, non un titolo.
 * La larghezza del riquadro si misura sull'inchiostro vero, non si stima sul
 * numero di lettere: stimandola restava mezzo dito di bianco a destra.
 */
async function larghezzaTesto(testo, misura) {
  const prova = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="${misura * 2}">` +
      `<text x="0" y="${misura}" fill="#fff" font-family="Anton, Impact, Helvetica, sans-serif" ` +
      `font-size="${misura}" letter-spacing="1">${testo}</text></svg>`,
  );
  const { info } = await sharp(prova).png().trim().toBuffer({ resolveWithObject: true });
  return info.width;
}

const riquadro = (testo, x, y, misura, largo) => {
  return (
    `<rect x="${x}" y="${y}" width="${largo + 36}" height="${Math.round(misura * 1.34)}" fill="#ffffff"/>` +
    `<text x="${x + 18}" y="${y + Math.round(misura * 1.02)}" fill="#140C5C" ` +
    `font-family="Anton, Impact, Helvetica, sans-serif" font-size="${misura}" letter-spacing="1">${testo}</text>`
  );
};

const largoUno = await larghezzaTesto("LA NOTTE", 64);
const largoDue = await larghezzaTesto("TI DÀ LIBERTÀ", 64);

const scritte = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${A}">
    <text x="72" y="405" fill="#C9C3FF" font-family="Helvetica, Arial, sans-serif" font-size="22"
      font-weight="700" letter-spacing="4">GIOVEDÌ, VENERDÌ, SABATO, DOMENICA</text>
    ${riquadro("LA NOTTE", 72, 425, 64, largoUno)}
    ${riquadro("TI DÀ LIBERTÀ", 72, 512, 64, largoDue)}
    <text x="${L - 72}" y="${A - 48}" fill="#ffffff" text-anchor="end"
      font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="600">
      Liste e tavoli al Room 26 di Roma</text>
  </svg>`,
);

const logo = await sharp(path.join(process.cwd(), "assets", "pass", "logo@3x.png"))
  .resize({ height: 64 })
  .toBuffer();

await sharp(sfondo)
  .composite([
    { input: velo, top: 0, left: 0 },
    { input: scritte, top: 0, left: 0 },
    { input: logo, top: 64, left: 72 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(USCITA);

console.log(`  public/anteprima.jpg ${L}x${A}`);
