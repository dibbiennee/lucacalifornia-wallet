"""
L'anteprima di WhatsApp per i link dei PR: il marchio in negativo, due tagli
neri su fondo bianco, quadrata.

Le coordinate sono quelle dei "tagli" di src/componenti/sito/Marchio.tsx
(viewBox 700x700): lo spazio fra il primo e il secondo poligono, e quello fra
il secondo e gli ultimi due. Disegnata a grandezza quadrupla e rimpicciolita
per avere i bordi lisci, senza dipendere da un file immagine esterno.

Uso: python3 scripts/genera-anteprima-pr.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

LATO = 1200
SS = 4  # supercampionamento, per i bordi
NERO = (20, 20, 20)
BIANCO = (255, 255, 255)

# Coordinate del marchio, su 700x700.
TAGLI = [
    [(0, 0), (700, 173), (700, 325)],
    [(0, 0), (700, 525), (351, 700)],
]

scala = LATO * SS / 700
grande = Image.new("RGB", (LATO * SS, LATO * SS), BIANCO)
disegno = ImageDraw.Draw(grande)

for taglio in TAGLI:
    disegno.polygon([(x * scala, y * scala) for x, y in taglio], fill=NERO)

finale = grande.resize((LATO, LATO), Image.LANCZOS)

uscita = Path(__file__).resolve().parent.parent / "public" / "anteprima-pr.png"
finale.save(uscita, optimize=True)
print(f"{uscita} ({uscita.stat().st_size // 1024} KB)")
