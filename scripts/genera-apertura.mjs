/**
 * Ricava la clip di apertura dal video del Room 26.
 *
 *   node scripts/genera-apertura.mjs <video> <secondo-di-partenza>
 *
 * PERCHE' ESISTE. Il webp che c'era nei materiali partiva da un primo piano
 * di un corpo: il primo fotogramma è la prima cosa che uno vede aprendo il
 * sito, e quello non diceva "discoteca", diceva altro. Qui si sceglie il
 * secondo esatto da cui partire e si ricostruisce la clip.
 *
 * Il montaggio del video è serrato, gli stacchi durano meno di un secondo:
 * conta scegliere bene il PRIMO fotogramma, il resto scorre comunque.
 *
 * Serve img2webp (brew install webp): ffmpeg su questo Mac non ha il
 * codificatore webp, e senza l'opzione -lossy img2webp comprime senza
 * perdita e tira fuori tredici megabyte invece di ottocento kilobyte.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const [video, partenza = "7"] = process.argv.slice(2);

if (video === undefined) {
  console.error("Uso: node scripts/genera-apertura.mjs <video> [secondo-di-partenza]");
  process.exit(1);
}

const DURATA = 8;
const FOTOGRAMMI_AL_SECONDO = 12;
const RITAGLI = [
  { nome: "hero-desktop.webp", filtro: "crop=720:620:0:0" },
  { nome: "hero-mobile.webp", filtro: "crop=420:560:150:0" },
];

const lavoro = mkdtempSync(path.join(tmpdir(), "apertura-"));

try {
  for (const ritaglio of RITAGLI) {
    const cartella = path.join(lavoro, ritaglio.nome);
    execFileSync("mkdir", ["-p", cartella]);
    execFileSync("ffmpeg", [
      "-nostdin", "-loglevel", "error",
      "-ss", partenza, "-t", String(DURATA), "-i", video,
      "-vf", `${ritaglio.filtro},fps=${FOTOGRAMMI_AL_SECONDO}`,
      path.join(cartella, "f-%03d.png"), "-y",
    ]);

    const fotogrammi = readdirSync(cartella).sort().map((f) => path.join(cartella, f));
    const uscita = path.join(process.cwd(), "public", "video", ritaglio.nome);

    execFileSync("img2webp", [
      "-loop", "0",
      "-d", String(Math.round(1000 / FOTOGRAMMI_AL_SECONDO)),
      "-lossy", "-q", "55", "-m", "6",
      ...fotogrammi,
      "-o", uscita,
    ]);

    console.log(`  ${ritaglio.nome} ${Math.round(statSync(uscita).size / 1024)} KB`);
  }
} finally {
  rmSync(lavoro, { recursive: true, force: true });
}
