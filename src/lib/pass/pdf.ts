import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { LOCALI, type DatiBiglietto } from "./tipi";

/**
 * Il biglietto in PDF, per chi non può usare Apple Wallet (Android, computer) o lo preferisce.
 *
 * Una pagina sola, in verticale, pensata per essere guardata sul telefono: il marchio in alto, quello
 * che serve a chi legge (serata, giorno, dove, nome) e un QR grande su fondo bianco. Il QR è lo STESSO del
 * biglietto Apple (stesso token, stessa lettura): lo scanner all'ingresso non cambia.
 *
 * Il QR è disegnato come tanti quadratini veri (vettoriali), non come immagine: resta nitido a qualunque
 * ingrandimento. I caratteri sono quelli standard del PDF (Helvetica): non dipendono dal server né da file di
 * font, e il PDF viene uguale ovunque. Niente orari: l'inizio della serata non è confermato.
 */

const LARGHEZZA = 420;
const ALTEZZA = 770;
const NERO = rgb(0.02, 0.016, 0.03);
const BIANCO = rgb(1, 1, 1);
const GRIGIO = rgb(0.38, 0.37, 0.42);
const MAGENTA = rgb(1, 0.243, 0.647);

/** Il marchio: gli stessi quattro poligoni del sito (src/componenti/sito/Marchio.tsx), in coordinate 700 x 700. */
const MARCHIO = [
  "M0 0 L700 0 L700 173 Z",
  "M0 0 L700 325 L700 525 Z",
  "M0 0 L351 700 L0 700 Z",
  "M351 700 L700 525 L700 700 Z",
] as const;

/**
 * Helvetica standard sa scrivere solo l'alfabeto latino di base: il nome di un cliente con un carattere che non
 * c'è (un'emoji, una lettera non latina) farebbe fallire tutto il PDF. Le lettere accentate italiane restano,
 * il resto diventa "?": meglio un nome con un punto interrogativo che nessun biglietto.
 */
function sicuro(testo: string, font: PDFFont): string {
  let fuori = "";

  for (const carattere of testo.normalize("NFC")) {
    try {
      font.encodeText(carattere);
      fuori += carattere;
    } catch {
      fuori += "?";
    }
  }

  return fuori;
}

/** Il testo si accorcia con "..." se non entra nella larghezza data. */
function adatta(testo: string, font: PDFFont, misura: number, massimo: number): string {
  const t = sicuro(testo, font);

  if (font.widthOfTextAtSize(t, misura) <= massimo) {
    return t;
  }

  let corto = t;

  while (corto.length > 1 && font.widthOfTextAtSize(`${corto}...`, misura) > massimo) {
    corto = corto.slice(0, -1);
  }

  return `${corto.trimEnd()}...`;
}

function centrato(pagina: PDFPage, testo: string, font: PDFFont, misura: number, y: number, colore = NERO): void {
  const larghezza = font.widthOfTextAtSize(testo, misura);
  pagina.drawText(testo, { x: (LARGHEZZA - larghezza) / 2, y, size: misura, font, color: colore });
}

/** Una misura di carattere che fa stare il testo nella larghezza data, senza scendere sotto il minimo. */
function misuraPerEntrare(testo: string, font: PDFFont, massima: number, minima: number, larghezza: number): number {
  let m = massima;

  while (m > minima && font.widthOfTextAtSize(testo, m) > larghezza) {
    m -= 1;
  }

  return m;
}

function maiuscola(testo: string): string {
  return testo.charAt(0).toUpperCase() + testo.slice(1);
}

export async function creaPdfBiglietto(dati: DatiBiglietto): Promise<Uint8Array> {
  const documento = await PDFDocument.create();
  documento.setTitle(`Biglietto ${dati.serata}`);
  documento.setAuthor("Luca California");
  documento.setCreator("Luca California");

  const pagina = documento.addPage([LARGHEZZA, ALTEZZA]);
  const normale = await documento.embedFont(StandardFonts.Helvetica);
  const grassetto = await documento.embedFont(StandardFonts.HelveticaBold);
  const locale = LOCALI[dati.locale];

  // Fondo scuro in alto, con il marchio e il nome.
  const ALTEZZA_TESTATA = 150;
  pagina.drawRectangle({ x: 0, y: ALTEZZA - ALTEZZA_TESTATA, width: LARGHEZZA, height: ALTEZZA_TESTATA, color: NERO });

  const LATO_MARCHIO = 52;
  const xMarchio = 32;
  const yMarchio = ALTEZZA - 40; // l'origine del tracciato SVG è in alto a sinistra
  for (const d of MARCHIO) {
    pagina.drawSvgPath(d, { x: xMarchio, y: yMarchio, scale: LATO_MARCHIO / 700, color: BIANCO, borderWidth: 0 });
  }
  pagina.drawText("LUCA", { x: xMarchio + LATO_MARCHIO + 14, y: ALTEZZA - 62, size: 16, font: grassetto, color: BIANCO });
  pagina.drawText("CALIFORNIA", { x: xMarchio + LATO_MARCHIO + 14, y: ALTEZZA - 80, size: 16, font: grassetto, color: BIANCO });

  // Il tipo, come etichetta magenta, in basso nella testata.
  const tipo = sicuro(dati.tipo.toUpperCase(), grassetto);
  const larghezzaTipo = grassetto.widthOfTextAtSize(tipo, 13) + 28;
  pagina.drawRectangle({ x: 32, y: ALTEZZA - ALTEZZA_TESTATA + 22, width: larghezzaTipo, height: 28, color: MAGENTA });
  pagina.drawText(tipo, { x: 46, y: ALTEZZA - ALTEZZA_TESTATA + 31, size: 13, font: grassetto, color: NERO });

  // La serata, grande.
  const serata = sicuro(dati.serata.toUpperCase(), grassetto);
  const misuraSerata = misuraPerEntrare(serata, grassetto, 38, 20, LARGHEZZA - 64);
  pagina.drawText(serata, { x: 32, y: ALTEZZA - ALTEZZA_TESTATA - 52, size: misuraSerata, font: grassetto, color: NERO });

  // Giorno, luogo, nome.
  const giorno = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Rome" }).format(dati.inizioSerata);
  let y = ALTEZZA - ALTEZZA_TESTATA - 92;
  const riga = (etichetta: string, valore: string, sotto?: string) => {
    pagina.drawText(etichetta.toUpperCase(), { x: 32, y, size: 9, font: grassetto, color: GRIGIO });
    pagina.drawText(adatta(valore, grassetto, 15, LARGHEZZA - 64), { x: 32, y: y - 17, size: 15, font: grassetto, color: NERO });

    if (sotto !== undefined) {
      pagina.drawText(adatta(sotto, normale, 11.5, LARGHEZZA - 64), { x: 32, y: y - 33, size: 11.5, font: normale, color: GRIGIO });
      y -= 16;
    }

    y -= 46;
  };
  riga("Giorno", maiuscola(giorno));
  riga("Dove", locale.nome.replace(/, Roma$/, ""), locale.indirizzo === "" ? undefined : locale.indirizzo);
  riga("Nome", dati.nomeCliente);

  // Il QR: quadratini veri su fondo bianco, con il margine che lo scanner vuole.
  const qr = QRCode.create(dati.token, { errorCorrectionLevel: "M" });
  const moduli = qr.modules.size;
  const MARGINE = 4;
  const LATO_QR = 272;
  const passo = LATO_QR / (moduli + MARGINE * 2);
  const xQr = (LARGHEZZA - LATO_QR) / 2;
  const yQr = 74;

  pagina.drawRectangle({ x: xQr, y: yQr, width: LATO_QR, height: LATO_QR, color: BIANCO, borderColor: rgb(0.85, 0.84, 0.88), borderWidth: 1 });
  for (let r = 0; r < moduli; r += 1) {
    for (let c = 0; c < moduli; c += 1) {
      if (qr.modules.get(r, c) === 1) {
        // Un filo in più per lato: due quadratini vicini non lasciano righe bianche di arrotondamento.
        pagina.drawRectangle({
          x: xQr + (c + MARGINE) * passo - 0.15,
          y: yQr + LATO_QR - (r + MARGINE + 1) * passo - 0.15,
          width: passo + 0.3,
          height: passo + 0.3,
          color: rgb(0, 0, 0),
        });
      }
    }
  }

  centrato(pagina, "Mostra questo biglietto all'ingresso se ti viene richiesto.", normale, 11, 46, GRIGIO);
  centrato(pagina, `lucacalifornia.it  -  codice ${dati.serialNumber}`, normale, 9, 26, GRIGIO);

  return documento.save();
}
