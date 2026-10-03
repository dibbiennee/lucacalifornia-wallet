/**
 * Prepara il video dell'apertura dal filmato del Room 26.
 *
 *   node scripts/genera-apertura.mjs <master> [inizio] [durata]
 *   node scripts/genera-apertura.mjs sorgenti-video/IMG_5910.mp4 11.20 6.34
 *
 * Produce in public/video/, con il nome legato al contenuto (hero-<impronta>.ext):
 *   hero-*.webm   VP9, per i browser che lo leggono (la gran parte)
 *   hero-*.mp4    H.264, per gli altri (iPhone più vecchi, Safari)
 *   hero-*.webp   il primo fotogramma, che è anche il poster
 * e riscrive src/contenuti/hero-video.ts, da cui la Hero legge i nomi.
 *
 * IL MASTER NON SI TOCCA. È il filmato intero (1080x1920, 50 fps, 142 MB) e sta
 * in sorgenti-video/, che non va né nel repository né in deploy. Questo script
 * lo legge soltanto.
 *
 * UN SOLO VIDEO, VERTICALE. La Hero lo mostra a schermo pieno sul telefono e
 * in un riquadro 9:16 accanto al testo sul computer (vedi Apertura.module.css):
 * lo stesso filmato va bene in tutti e due i casi, quindi non c'è più nessun
 * taglio da computer e nessuna scelta da fare in JavaScript su quale scaricare.
 *
 * CON AUDIO, ma muto di partenza. I browser non fanno partire un video col suono
 * da solo: il video parte muto, e un tasto (TastoAudio.tsx) lo attiva. La traccia
 * ha una dissolvenza di 40 ms in entrata e in uscita, perché nel loop il salto
 * fra fine e inizio non faccia "clic". Costa poche decine di KB per file.
 *
 * IL SEGMENTO. Comincia sul primo fotogramma stabile di un'inquadratura e
 * finisce sull'ultimo prima di un taglio: 11,20 s è la DJ con le mani ai piatti,
 * dopo due inquadrature lampo di un fotogramma; 17,52 s è l'ultimo fotogramma del
 * braccio alzato davanti al pubblico, prima di una inquadratura lampo con
 * l'insegna al neon di un'altra artista. In un montaggio serrato il salto fra
 * ultimo e primo fotogramma è un taglio come gli altri, e il loop non si nota.
 * Dentro non ci sono testi, né il primo piano dei fianchi che stava a 10,00 s: è
 * la DJ ai piatti, con le braccia alzate e di profilo, in poche inquadrature.
 * Scelto guardando i fotogrammi del master (a 25 fotogrammi veri, raddoppiati a 50),
 * non contando i secondi. Per un altro segmento: node scripts/genera-apertura.mjs <master> <inizio> <durata>.
 *
 * LA COMPRESSIONE. Misurata confrontando ogni versione con una copia quasi
 * senza perdita (SSIM): VP9 crf 44 dà 0,970 e H.264 crf 31 dà 0,967, oltre non
 * si vede. 25 fotogrammi al secondo bastano per uno sfondo (il master ne ha 50).
 *
 * IL POSTER è il primo fotogramma del video già compresso, non quello del
 * master: così quello che si vede prima che il video parta è esattamente
 * quello da cui parte, senza nemmeno uno scarto di colore.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const [master, inizio = "11.20", durata = "6.34"] = process.argv.slice(2);

if (master === undefined) {
  console.error("Uso: node scripts/genera-apertura.mjs <master> [inizio] [durata]");
  process.exit(1);
}

const LARGHEZZA = 720;
const ALTEZZA = 1280;
const FOTOGRAMMI = 25;
const CRF_VP9 = "44";
const CRF_H264 = "31";

const radice = process.cwd();
const uscita = path.join(radice, "public", "video");
const lavoro = path.join(uscita, ".lavoro");

function ffmpeg(argomenti) {
  execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", "-y", ...argomenti]);
}

const impronta = (file) => createHash("sha1").update(readFileSync(file)).digest("hex").slice(0, 10);
const kb = (file) => `${Math.round(statSync(file).size / 1024)} KB`;

mkdirSync(lavoro, { recursive: true });

const filtro = `scale=${LARGHEZZA}:${ALTEZZA}:flags=lanczos,fps=${FOTOGRAMMI},format=yuv420p`;
const fine = (Number(durata) - 0.04).toFixed(2);
const audio = ["-af", `afade=t=in:d=0.04,afade=t=out:st=${fine}:d=0.04`, "-ac", "2", "-ar", "48000"];
const comuni = ["-ss", inizio, "-t", durata, "-i", master, "-vf", filtro, ...audio];

const webm = path.join(lavoro, "hero.webm");
const mp4 = path.join(lavoro, "hero.mp4");
const poster = path.join(lavoro, "hero.png");
const posterWebp = path.join(lavoro, "hero.webp");

// webm: più leggero, dove viene accettato.
ffmpeg([...comuni, "-c:v", "libvpx-vp9", "-crf", CRF_VP9, "-b:v", "0", "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-c:a", "libopus", "-b:a", "64k", webm]);

// mp4: lo leggono tutti. Il primo fotogramma è sempre un fotogramma chiave, e +faststart mette l'indice in testa:
// il video può partire senza aver scaricato tutto.
ffmpeg([...comuni, "-c:v", "libx264", "-profile:v", "high", "-crf", CRF_H264, "-preset", "slow", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", mp4]);

// il poster: il primo fotogramma dell'mp4 già compresso
ffmpeg(["-i", mp4, "-frames:v", "1", poster]);
const sharp = createRequire(import.meta.url)("sharp");
await sharp(poster).webp({ quality: 78 }).toFile(posterWebp);

// nomi legati al contenuto: cambia il file, cambia il nome, e si può mettere in cache per un anno
const nomi = {
  webm: `hero-${impronta(webm)}.webm`,
  mp4: `hero-${impronta(mp4)}.mp4`,
  poster: `hero-${impronta(posterWebp)}.webp`,
};

// via gli hero-* di prima e i vecchi apertura-*, che nessuno referenzia più
const nuovi = new Set(Object.values(nomi));
for (const f of readdirSync(uscita)) {
  if ((f.startsWith("hero-") && !nuovi.has(f)) || f.startsWith("apertura-")) {
    rmSync(path.join(uscita, f));
    console.log(`  tolto ${f}`);
  }
}

renameSync(webm, path.join(uscita, nomi.webm));
renameSync(mp4, path.join(uscita, nomi.mp4));
renameSync(posterWebp, path.join(uscita, nomi.poster));
rmSync(lavoro, { recursive: true, force: true });

writeFileSync(
  path.join(radice, "src", "contenuti", "hero-video.ts"),
  `/**
 * I file del video dell'apertura. GENERATO da scripts/genera-apertura.mjs:
 * non si modifica a mano. I nomi cambiano insieme al contenuto, e per questo
 * i file si servono con la cache lunga (vedi next.config.ts).
 */
export const HERO_VIDEO = {
  webm: "/video/${nomi.webm}",
  mp4: "/video/${nomi.mp4}",
  poster: "/video/${nomi.poster}",
  larghezza: ${LARGHEZZA},
  altezza: ${ALTEZZA},
} as const;
`,
);

console.log(`  ${nomi.webm}   ${kb(path.join(uscita, nomi.webm))}`);
console.log(`  ${nomi.mp4}    ${kb(path.join(uscita, nomi.mp4))}`);
console.log(`  ${nomi.poster}   ${kb(path.join(uscita, nomi.poster))}`);
