/**
 * Biglietti di prova per guardare il Wallet vero.
 *
 * Genera alcuni .pkpass firmati con la TUA chiave Apple e li mette in una cartella, da
 * aprire su un iPhone (AirDrop, mail) o trascinare nel simulatore. Serve a vedere come
 * escono logo, colori, allineamento e testi lunghi, cose che i controlli sul file non
 * vedono.
 *
 * Non usa il database, non scrive niente su Vercel né su production, non manda nulla a
 * nessuno. Nomi e date sono inventati. La password della chiave la legge dalla variabile
 * PASS_SIGNER_KEY_PASSPHRASE e non la stampa mai.
 *
 * Si lancia dalla cartella principale del progetto (quella che ha certs/ dentro), così:
 *
 *   read -s -p "Password chiave: " PASS_SIGNER_KEY_PASSPHRASE; export PASS_SIGNER_KEY_PASSPHRASE; \
 *     npx tsx --tsconfig <cartella-di-lavoro>/tsconfig.json <cartella-di-lavoro>/scripts/biglietti-di-prova.mts
 *
 * Opzionale: come primo argomento, la cartella dove mettere i file
 * (di partenza: ~/Desktop/biglietti-di-prova).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";

// Identificativi Apple: non sono segreti. Si usano solo se non sono già nell'ambiente.
process.env["PASS_TYPE_IDENTIFIER"] ??= "pass.it.satoshiweb.lucacalifornia";
process.env["APPLE_TEAM_IDENTIFIER"] ??= "CYZ7XKRGWR";
// La chiave che cifra il token dentro il QR: per questi biglietti di prova ne basta una qualsiasi.
process.env["SEGRETO_BIGLIETTO"] ??= "biglietti-di-prova-solo-locale-0123456789";

const { creaBiglietto } = await import("../src/lib/pass/biglietto");
const { creaToken, nuovoSerialNumber } = await import("../src/lib/pass/token");
const { calendarioSerate, serataPerData } = await import("../src/lib/calendario-serate");
const { istanteSerata } = await import("../src/lib/serate");

if ((process.env["PASS_SIGNER_KEY_PASSPHRASE"] ?? "") === "" && !process.env["PASS_SIGNER_KEY_BASE64"]) {
  console.warn("Attenzione: PASS_SIGNER_KEY_PASSPHRASE è vuota. Se la chiave è cifrata la firma fallirà.\n");
}

const cartella = process.argv[2] ?? path.join(homedir(), "Desktop", "biglietti-di-prova");
// Si svuota solo una cartella che si chiama "biglietti-di-prova" (o che non esiste, o è vuota):
// una cartella con altro dentro non si tocca, nemmeno se l'indirizzo è stato scritto male.
if (existsSync(cartella) && readdirSync(cartella).length > 0 && path.basename(cartella) !== "biglietti-di-prova") {
  console.error(`Rifiuto di svuotare ${cartella}: non si chiama "biglietti-di-prova" e dentro c'è qualcosa. Scegli un'altra cartella.`);
  process.exit(2);
}
rmSync(cartella, { recursive: true, force: true });
mkdirSync(cartella, { recursive: true });

const calendario = calendarioSerate();
const dataDi = (notte: string, salta = 0): string => {
  const v = calendario.filter((x) => x.notte === notte)[salta];
  if (v === undefined) throw new Error(`nessuna data per ${notte}`);
  return v.data;
};

interface Caso {
  readonly file: string;
  readonly nome: string;
  readonly tipo: string;
  readonly data: string;
  readonly nota: string;
}

const casi: readonly Caso[] = [
  { file: "1-tavolo-misto", nome: "Giulia Rossi", tipo: "TAVOLO, MISTO", data: dataDi("sabato"), nota: "caso normale" },
  { file: "2-lista", nome: "Marco Bianchi", tipo: "LISTA", data: dataDi("venerdi"), nota: "tipo corto" },
  { file: "3-bracciale-donna", nome: "Chiara D'Àngelo", tipo: "BRACCIALE, DONNA", data: dataDi("sabato", 1), nota: "apostrofo e lettere accentate" },
  { file: "4-bracciale-uomo", nome: "Luca Verdi", tipo: "BRACCIALE, UOMO", data: dataDi("bailame"), nota: "serata con accento (BÀILAME)" },
  { file: "5-nome-lungo", nome: "Maria Francesca Antonietta Della Rovere Montefeltro di Castelbarco", tipo: "TAVOLO, SOLO RAGAZZE", data: dataDi("milkshake", 2), nota: "nome di 66 caratteri e tipo lungo: guarda se si tronca" },
  { file: "6-nome-cortissimo", nome: "Al Li", tipo: "LISTA", data: dataDi("venerdi", 1), nota: "nome cortissimo" },
];

console.log(`Cartella: ${cartella}\n`);

for (const c of casi) {
  const serata = serataPerData(c.data);
  if (serata === null) throw new Error(`data fuori calendario: ${c.data}`);

  const prenotazione = {
    serialNumber: nuovoSerialNumber(),
    nomeCliente: c.nome,
    serata: serata.nomeSerata,
    inizioSerata: istanteSerata(c.data),
    tipo: c.tipo,
    locale: "room26" as const,
  };
  const token = creaToken(prenotazione);
  const pkpass = await creaBiglietto({ ...prenotazione, token });
  const file = path.join(cartella, `${c.file}.pkpass`);
  writeFileSync(file, pkpass);

  // Controllo minimo: il file si apre e la firma corrisponde al manifest (senza verificare la catena di Apple).
  const lavoro = path.join(tmpdir(), `biglietto-prova-${c.file}`);
  rmSync(lavoro, { recursive: true, force: true });
  mkdirSync(lavoro, { recursive: true });
  execFileSync("unzip", ["-q", "-o", file, "-d", lavoro]);
  let firma = "firma integra";
  try {
    execFileSync("openssl", ["smime", "-verify", "-noverify", "-inform", "DER", "-in", path.join(lavoro, "signature"), "-content", path.join(lavoro, "manifest.json"), "-out", "/dev/null"], { stdio: "pipe" });
  } catch {
    firma = "FIRMA NON VALIDA";
  }
  const pass = JSON.parse(readFileSync(path.join(lavoro, "pass.json"), "utf8")) as { serialNumber: string };
  rmSync(lavoro, { recursive: true, force: true });

  console.log(`${c.file}.pkpass  ${(pkpass.length / 1024).toFixed(0)} KB  ${firma}  serial ${pass.serialNumber}`);
  console.log(`    ${c.nome} | ${c.tipo} | ${serata.nomeSerata} ${c.data}  (${c.nota})`);
}

console.log(`
Fatto. Ora:
  1. Apri la cartella e manda i file al tuo iPhone (AirDrop va bene), oppure trascinali nel simulatore iOS.
  2. Toccali: deve comparire "Aggiungi" in Wallet. Se compare un errore, scrivimi il testo esatto.
  3. Aggiungili e mandami gli screenshot, davanti E dietro (tocca "i" in basso a destra).

Da guardare, per ognuno:
  - logo in alto a sinistra: nitido, non tagliato, leggibile sul fondo blu
  - colori: fondo, etichette (chiare) e valori (bianchi) leggibili
  - DATA in alto a destra e SERATA in grande: nessuna sovrapposizione
  - TIPO e NOME: nel caso 5 dimmi se il nome si tronca con i puntini
  - LOCALE e DALLE: allineati
  - QR in basso: grande e senza tagli
  - retro: solo DOVE e INSTAGRAM, niente frase sull'ingresso
`);
