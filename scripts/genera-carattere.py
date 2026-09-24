#!/usr/bin/env python3
"""
Ritaglia Archivo su misura per questo sito.

    pip install fonttools brotli
    python3 scripts/genera-carattere.py

Parte da materiale/carattere/Archivo.ttf, il file variabile ufficiale preso dal
repository di Google Fonts, e scrive public/font/archivo-sito.woff2.

PERCHE' NON PRENDERLO DA GOOGLE E BASTA. Il file che serve Google pesa 88 KB,
ed e' il piu' pesante di tutto quello che scarica la prima schermata: piu' del
video, che intanto abbiamo spostato dopo. Dentro ci sono due cose che non
usiamo.

La prima sono le larghezze strette: l'asse wdth va da 62 a 125, e il sito sta
fra 100 e 125. La seconda sono i pesi sottili, da 100 a 400, che non compaiono
da nessuna parte.

Tagliate quelle due, e tenuti i caratteri che servono a scrivere in italiano
per bene, il file scende a 44 KB: la meta'.

SUI CARATTERI. L'insieme qui sotto non e' quello che il sito usa oggi (sono
82 caratteri), ma quello che gli serve per non spezzarsi domani: tutte le
accentate italiane e le piu' comuni straniere, le virgolette curve, i trattini
lunghi, l'euro, i gradi. Un carattere fuori da questo insieme non rompe
niente, viene disegnato col carattere di ripiego: si vede solo che e' diverso.

LA LICENZA. Archivo e' sotto SIL Open Font License: si puo' ospitare e
modificare, ma la licenza deve viaggiare col font. Sta in
materiale/carattere/OFL.txt e viene copiata accanto al file prodotto.
"""

import shutil
import subprocess
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
SORGENTE = RADICE / "materiale" / "carattere" / "Archivo.ttf"
LICENZA = RADICE / "materiale" / "carattere" / "OFL.txt"
CARTELLA = RADICE / "public" / "font"
USCITA = CARTELLA / "archivo-sito.woff2"

# I pesi e le larghezze che il sito usa davvero.
ASSI = ["wght=400:900", "wdth=100:125"]

CARATTERI = ",".join([
    "U+0020-007E",   # lettere, numeri, punteggiatura di base
    "U+00A0",        # lo spazio che non si spezza: lo usiamo dappertutto
    "U+00A9",        # ©
    "U+00AB,U+00BB", # « »
    "U+00B0",        # °
    "U+00B7",        # ·
    "U+00C0-00C5",   # À Á Â Ã Ä Å
    "U+00C7-00CF",   # Ç È É Ê Ë Ì Í Î Ï
    "U+00D2-00D6",   # Ò Ó Ô Õ Ö
    "U+00D9-00DC",   # Ù Ú Û Ü
    "U+00E0-00E5",   # à á â ã ä å
    "U+00E7-00EF",   # ç è é ê ë ì í î ï
    "U+00F1-00F6",   # ñ ò ó ô õ ö
    "U+00F9-00FC",   # ù ú û ü
    "U+0152-0153",   # Œ œ
    "U+2013-2014",   # – —
    "U+2018-201A",   # ' ' ‚
    "U+201C-201E",   # " " „
    "U+2026",        # …
    "U+20AC",        # €
    "U+2122",        # ™
])


def esegui(argomenti: list[str]) -> None:
    subprocess.run(argomenti, check=True, capture_output=True)


def peso(file: Path) -> str:
    return f"{round(file.stat().st_size / 1024)} KB"


def main() -> None:
    if not SORGENTE.exists():
        sys.exit(
            f"Manca {SORGENTE.relative_to(RADICE)}. Si scarica da:\n"
            "  https://github.com/google/fonts/raw/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf"
        )

    CARTELLA.mkdir(parents=True, exist_ok=True)
    tagliato = CARTELLA / "archivo-assi.ttf"

    esegui([sys.executable, "-m", "fontTools.varLib.instancer",
            str(SORGENTE), *ASSI, "-o", str(tagliato)])

    esegui([sys.executable, "-m", "fontTools.subset", str(tagliato),
            f"--unicodes={CARATTERI}", "--layout-features=*",
            "--flavor=woff2", f"--output-file={USCITA}"])

    tagliato.unlink()
    shutil.copy(LICENZA, CARTELLA / "OFL.txt")

    print(f"  {SORGENTE.name}: {peso(SORGENTE)}")
    print(f"  {USCITA.name}: {peso(USCITA)}  (quello di Google pesa 88 KB)")


if __name__ == "__main__":
    main()
