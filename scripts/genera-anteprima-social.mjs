/**
 * L'immagine che compare quando si condivide il link (WhatsApp, Instagram, messaggi).
 *
 *   node scripts/genera-anteprima-social.mjs
 *
 * Parte dalla grafica "Tu scegli la serata. Io ti faccio entrare" (design/anteprima-sorgente.webp,
 * 1536x1024, 3:2) e la porta a 1200x630, la misura che usano tutti.
 *
 * NIENTE TAGLIO. La grafica ha il logo in alto e "ROOM26 • ROMA" in basso: un
 * taglio al centro (da 3:2 a 1,91:1) li mangerebbe. Così la grafica intera sta
 * a sinistra, a tutta altezza, e a destra il suo stesso bordo continua sfocato
 * e scurito, con una dissolvenza al posto di uno stacco netto.
 *
 * Il file di uscita ha il nome nuovo: WhatsApp e gli altri tengono in memoria
 * l'immagine per indirizzo, e con lo stesso nome continuerebbero a mostrare la vecchia.
 * Se cambi la grafica, cambia anche il nome (e src/lib/seo.ts, src/app/layout.tsx).
 */

import { Buffer } from "node:buffer";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const L = 1200;
const A = 630;
const SORGENTE = path.join(process.cwd(), "design", "anteprima-sorgente.webp");
const USCITA = path.join(process.cwd(), "public", "anteprima-sito-2.jpg");

// la grafica intera, alta quanto l'anteprima
const intera = await sharp(SORGENTE).resize({ height: A }).toBuffer({ resolveWithObject: true });
const larghezzaIntera = intera.info.width;

// sotto, la stessa grafica allargata e sfocata, un po' più scura
const sfondo = await sharp(SORGENTE)
  .resize(L, A, { fit: "cover" })
  .blur(28)
  .modulate({ brightness: 0.55 })
  .toBuffer();

// Si mescolano i pixel a mano: la grafica intera resta piena e negli ultimi FASCIA pixel
// sfuma nello sfondo, da 1 a 0, con una curva dolce (niente stacco netto)
const FASCIA = 140;
const sopra = await sharp(intera.data).removeAlpha().raw().toBuffer();
const sotto = await sharp(sfondo).removeAlpha().raw().toBuffer();
const uscita = Buffer.from(sotto);
for (let y = 0; y < A; y += 1) {
  for (let x = 0; x < larghezzaIntera; x += 1) {
    const t = Math.min(1, (larghezzaIntera - 1 - x) / FASCIA);
    const peso = t * t * (3 - 2 * t);
    for (let c = 0; c < 3; c += 1) {
      const dove = (y * L + x) * 3 + c;
      uscita[dove] = Math.round((sopra[(y * larghezzaIntera + x) * 3 + c] ?? 0) * peso + (sotto[dove] ?? 0) * (1 - peso));
    }
  }
}

await sharp(uscita, { raw: { width: L, height: A, channels: 3 } })
  .jpeg({ quality: 84, progressive: true, mozjpeg: true })
  .toFile(USCITA);

console.log(`  public/anteprima-sito-2.jpg ${L}x${A}`);
