/**
 * Compone il logo del biglietto: il marchio più il nome, su due righe.
 *
 *   node scripts/genera-logo.mjs
 *
 * PERCHE' il nome sta dentro l'immagine e non nel campo logoText del pass:
 * iOS scrive logoText a sinistra e il campo intestazione a destra, sulla
 * stessa riga. Con un nome lungo i due testi si toccano, e sul telefono si
 * legge "LUCA CALIFORNIA26 Sep 2026". Dentro l'immagine il nome ha il suo
 * spazio e non litiga con la data.
 *
 * Il marchio non è ridisegnato: è ritagliato dal file ufficiale in
 * materiale/, quello bianco su fondo scuro, e reso trasparente nei tagli.
 */

import path from "node:path";
import sharp from "sharp";

const CARTELLA = path.join(process.cwd(), "assets", "pass");
const MARCHIO_UFFICIALE = path.join(process.cwd(), "materiale", "luca-curella-simbolo-bianco.png");
/** Posizione del quadrato dentro il file ufficiale, misurata sui pixel. */
const RITAGLIO = { left: 190, top: 325, width: 700, height: 700 };

const NOME = ["LUCA", "CALIFORNIA"];
const FONT = "Arial Narrow";

/** Apple accetta un logo fino a 160x50 punti. Lavoriamo a 3x e rimpiccioliamo. */
const SCALA = 3;
const ALTEZZA = 50 * SCALA;
const LARGHEZZA_MAX = 160 * SCALA;
const STACCO = 10 * SCALA;

/** Il marchio: bianco dove il quadrato è pieno, trasparente nei tagli. */
async function marchio(lato) {
  const maschera = await sharp(MARCHIO_UFFICIALE)
    .extract(RITAGLIO)
    .resize(lato, lato)
    .greyscale()
    .raw()
    .toBuffer();

  return sharp({ create: { width: lato, height: lato, channels: 3, background: "#ffffff" } })
    .joinChannel(maschera, { raw: { width: lato, height: lato, channels: 1 } })
    .png()
    .toBuffer();
}

/** Una riga di testo bianco, ritagliata sull'inchiostro vero. */
async function riga(testo) {
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="600">` +
      `<text x="20" y="420" fill="#ffffff" font-family="${FONT}" font-weight="bold" ` +
      `font-size="400" letter-spacing="4">${testo}</text></svg>`,
  );
  const { data, info } = await sharp(svg).png().trim().toBuffer({ resolveWithObject: true });
  return { data, larghezza: info.width, altezza: info.height };
}

const righe = await Promise.all(NOME.map(riga));

// Tutte le righe alla stessa altezza, e il blocco largo quanto la riga più lunga.
const larghezzaTesto = LARGHEZZA_MAX - ALTEZZA - STACCO;
const piuLarga = Math.max(...righe.map((r) => r.larghezza / r.altezza));
const altezzaRiga = Math.floor(larghezzaTesto / piuLarga);
const interlinea = Math.round(altezzaRiga * 0.26);

const pezzi = [];
let y = Math.round((ALTEZZA - (altezzaRiga * righe.length + interlinea)) / 2);

for (const r of righe) {
  const larghezza = Math.round((r.larghezza / r.altezza) * altezzaRiga);
  pezzi.push({
    input: await sharp(r.data).resize(larghezza, altezzaRiga).png().toBuffer(),
    left: ALTEZZA + STACCO,
    top: y,
  });
  y += altezzaRiga + interlinea;
}

pezzi.unshift({ input: await marchio(ALTEZZA), left: 0, top: 0 });

const logo = await sharp({
  create: { width: LARGHEZZA_MAX, height: ALTEZZA, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite(pezzi)
  .png()
  .toBuffer();

for (const [nome, divisore] of [["logo.png", 3], ["logo@2x.png", 1.5], ["logo@3x.png", 1]]) {
  const larghezza = Math.round(LARGHEZZA_MAX / divisore);
  const altezza = Math.round(ALTEZZA / divisore);
  await sharp(logo).resize(larghezza, altezza).png({ compressionLevel: 9 }).toFile(path.join(CARTELLA, nome));
  console.log(`  ${nome} (${larghezza}x${altezza})`);
}
