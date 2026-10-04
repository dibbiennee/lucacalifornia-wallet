/**
 * Il loghetto che compare nell'anteprima del link del biglietto Wallet
 * (quello che Luca manda su WhatsApp insieme al messaggio di conferma).
 *
 *   node scripts/genera-logo-anteprima-biglietto.mjs
 *
 * Parte da design/logo-biglietto-sorgente.jpg (il marchio nero su bianco) e lo
 * mette al centro di un quadrato bianco da 256x256 con un margine intorno.
 * SOTTO I 300 PX di larghezza WhatsApp lo mostra come miniatura piccola accanto al
 * titolo (il "loghetto"); sopra, come un'immagine enorme in cima al messaggio. Senza
 * margine il marchio toccherebbe i bordi. Esce in public/anteprima-biglietto-2.png.
 */

import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const LATO = 256;
const MARCHIO = 170;
const SORGENTE = path.join(process.cwd(), "design", "logo-biglietto-sorgente.jpg");
const USCITA = path.join(process.cwd(), "public", "anteprima-biglietto-2.png");

const marchio = await sharp(SORGENTE)
  .resize(MARCHIO, MARCHIO, { fit: "contain", background: "#ffffff" })
  .toBuffer();

await sharp({ create: { width: LATO, height: LATO, channels: 3, background: "#ffffff" } })
  .composite([{ input: marchio, left: (LATO - MARCHIO) / 2, top: (LATO - MARCHIO) / 2 }])
  .png({ compressionLevel: 9 })
  .toFile(USCITA);

console.log(`  public/anteprima-biglietto-2.png ${LATO}x${LATO}`);
