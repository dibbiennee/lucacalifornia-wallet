/**
 * Prepara i video di apertura dal filmato del Room 26.
 *
 *   node scripts/genera-apertura.mjs <video> [secondo-di-partenza]
 *
 * Produce, in public/video/:
 *   apertura-telefono.mp4 / .webm   taglio verticale
 *   apertura-computer.mp4 / .webm   taglio orizzontale
 *   apertura-telefono.jpg / apertura-computer.jpg   il fotogramma fermo
 *
 * PERCHE' DUE TAGLI. Il filmato è verticale. Allargato su un computer si
 * ingrandisce fino a sgranare, e stretto su un telefono taglia via metà
 * scena: il ritaglio giusto cambia con lo schermo.
 *
 * PERCHE' IL FOTOGRAMMA FERMO. Serve come poster mentre il video arriva, e
 * serve da solo a chi ha chiesto meno movimento nelle impostazioni del
 * telefono: in quel caso il video non viene proprio mostrato.
 *
 * SULLA COMPRESSIONE. La scena è scura e ci sta sopra una sfumatura: a
 * occhio, crf 36 per l'mp4 e 55 per il webm sono indistinguibili da valori
 * molto più generosi, e pesano quasi la metà. Il webm di suo, con i valori
 * di partenza, usciva più pesante dell'mp4: spinto fin qui pesa un quarto
 * di meno, e solo allora vale la pena servirlo.
 *
 * SUL SECONDO DI PARTENZA. Il montaggio è serrato, gli stacchi durano meno
 * di un secondo: conta scegliere bene il primo fotogramma, perché è la prima
 * cosa che si vede aprendo il sito. Il 7 è le strutture del soffitto coi
 * fasci blu, senza nessuno in campo.
 */

import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const [sorgente, partenza = "7"] = process.argv.slice(2);

if (sorgente === undefined) {
  console.error("Uso: node scripts/genera-apertura.mjs <video> [secondo-di-partenza]");
  process.exit(1);
}

const DURATA = 8;
const USCITA = path.join(process.cwd(), "public", "video");

const TAGLI = [
  { nome: "apertura-telefono", filtro: "crop=720:1100:0:90,scale=540:-2" },
  { nome: "apertura-computer", filtro: "crop=720:620:0:0,scale=960:-2" },
];

function ffmpeg(argomenti) {
  execFileSync("ffmpeg", ["-nostdin", "-loglevel", "error", ...argomenti]);
}

function peso(file) {
  return `${Math.round(statSync(file).size / 1024)} KB`;
}

for (const taglio of TAGLI) {
  const base = path.join(USCITA, taglio.nome);
  const comuni = ["-ss", partenza, "-t", String(DURATA), "-i", sorgente, "-vf", taglio.filtro, "-an"];

  // h.264: lo leggono tutti, iPhone compresi.
  ffmpeg([...comuni, "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
    "-crf", "36", "-preset", "slow", "-movflags", "+faststart", `${base}.mp4`, "-y"]);

  // webm: più leggero dove viene accettato.
  ffmpeg([...comuni, "-c:v", "libvpx-vp9", "-crf", "55", "-b:v", "0",
    "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", `${base}.webm`, "-y"]);

  // il fotogramma fermo, che è anche il poster
  ffmpeg(["-ss", partenza, "-i", sorgente, "-frames:v", "1", "-vf", taglio.filtro,
    "-q:v", "4", `${base}.jpg`, "-y"]);

  console.log(`  ${taglio.nome}: mp4 ${peso(`${base}.mp4`)}, webm ${peso(`${base}.webm`)}, fermo ${peso(`${base}.jpg`)}`);
}
