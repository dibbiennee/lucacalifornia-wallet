/**
 * Disegna l'anteprima del biglietto per la pagina Funzioni.
 *
 *   node scripts/genera-anteprima-biglietto.mjs
 *
 * PERCHE' DISEGNATA E NON UNO SCATTO. Il biglietto lo compone iOS dentro
 * l'app Wallet: sul Mac non c'è niente che lo apra, quindi uno screenshot si
 * può fare solo da un iPhone. Questa immagine usa i pezzi veri del pass, cioè
 * il logo, la fascia della serata, i colori e i campi dichiarati in
 * biglietto.ts: non è un mockup inventato, è lo stesso materiale rimontato.
 *
 * Se arriva uno scatto da un telefono vero, si sostituisce il file e basta.
 */

import { Buffer } from "node:buffer";
import path from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";

const L = 780;
const ALTEZZA = 1180;
const MARGINE = 46;
const BLU = "#2B1BB0";
const ETICHETTA = "#C9C3FF";

const PASS = path.join(process.cwd(), "assets", "pass");
const USCITA = path.join(process.cwd(), "public", "foto", "biglietto.webp");

/** I campi sono gli stessi che monta src/lib/pass/biglietto.ts. */
const DATA = "27 set 2026";
const SERATA = "BÁILAME";
const CAMPI = [
  [
    { etichetta: "TIPO", valore: "TAVOLO, MISTO" },
    { etichetta: "NOME", valore: "Mario Rossi" },
  ],
  [
    { etichetta: "LOCALE", valore: "Room 26, Roma" },
    { etichetta: "DALLE", valore: "23:30" },
  ],
];

const testo = (x, y, s, opzioni = {}) => {
  const { misura = 26, peso = 400, colore = "#fff", spaziatura = 0, ancora = "start" } = opzioni;
  return (
    `<text x="${x}" y="${y}" fill="${colore}" text-anchor="${ancora}" ` +
    `font-family="Helvetica, Arial, sans-serif" font-size="${misura}" font-weight="${peso}" ` +
    `letter-spacing="${spaziatura}">${s}</text>`
  );
};

const logo = await sharp(path.join(PASS, "logo@3x.png")).resize({ height: 58 }).toBuffer();
const { width: larghezzaLogo = 0 } = await sharp(logo).metadata();

const ALTEZZA_TESTATA = 150;
const ALTEZZA_STRIP = 256;
const strip = await sharp(path.join(PASS, "strip@3x.png"))
  .resize(L, ALTEZZA_STRIP, { fit: "cover" })
  .toBuffer();

const qr = await QRCode.toBuffer("anteprima-del-biglietto-luca-california", {
  width: 300,
  margin: 1,
  color: { dark: "#000000", light: "#FFFFFF" },
});

const yCampi = ALTEZZA_TESTATA + ALTEZZA_STRIP + 72;
const righeCampi = CAMPI.map((riga, i) =>
  riga
    .map((campo, colonna) => {
      const x = colonna === 0 ? MARGINE : L - MARGINE;
      const ancora = colonna === 0 ? "start" : "end";
      const y = yCampi + i * 104;
      return (
        testo(x, y, campo.etichetta, { misura: 20, peso: 600, colore: ETICHETTA, spaziatura: 1.6, ancora }) +
        testo(x, y + 40, campo.valore, { misura: 32, peso: 500, ancora })
      );
    })
    .join(""),
).join("");

const disegno = Buffer.from(
  // Niente rettangolo di fondo qui: lo sfondo ce l'ha già la base, e un
  // rettangolo pieno sopra coprirebbe la fascia con la foto della serata.
  `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${ALTEZZA}">
    ${testo(L - MARGINE, 62, "DATA", { misura: 20, peso: 600, colore: ETICHETTA, spaziatura: 1.6, ancora: "end" })}
    ${testo(L - MARGINE, 104, DATA, { misura: 36, peso: 500, ancora: "end" })}
    ${testo(MARGINE, ALTEZZA_TESTATA + 96, SERATA, { misura: 66, peso: 600 })}
    ${righeCampi}
  </svg>`,
);

const larghezzaQr = 300;

/* Gli angoli arrotondati: nel Wallet il pass è una tessera, non un foglio. */
const RAGGIO = 34;
const maschera = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${ALTEZZA}">` +
    `<rect width="${L}" height="${ALTEZZA}" rx="${RAGGIO}" ry="${RAGGIO}" fill="#fff"/></svg>`,
);

const tessera = await sharp({ create: { width: L, height: ALTEZZA, channels: 4, background: BLU } })
  .composite([
    { input: strip, top: ALTEZZA_TESTATA, left: 0 },
    { input: disegno, top: 0, left: 0 },
    { input: logo, top: Math.round((ALTEZZA_TESTATA - 58) / 2), left: MARGINE },
    {
      input: await sharp(qr)
        .extend({ top: 18, bottom: 18, left: 18, right: 18, background: "#ffffff" })
        .toBuffer(),
      top: ALTEZZA - larghezzaQr - 36 - 100,
      left: Math.round((L - larghezzaQr - 36) / 2),
    },
  ])
  .png()
  .toBuffer();

await sharp(tessera)
  .composite([{ input: maschera, blend: "dest-in" }])
  .webp({ quality: 86, alphaQuality: 100 })
  .toFile(USCITA);

console.log(`  ${path.relative(process.cwd(), USCITA)} ${L}x${ALTEZZA}, logo largo ${larghezzaLogo}`);
