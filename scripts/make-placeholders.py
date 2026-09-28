#!/usr/bin/env python3
# 🪶 Marqueurs de pose — Couture Colombe et Merceries
#
# Génère des images « marqueur de pose » (placeholder) allégées aux
# couleurs de l'atelier, à la place des grandes photos, pour fabriquer
# le zip COMPLET ALLÉGÉ (téléchargement plume pour Maman Colombe).
#
# ⚠️ À utiliser sur une COPIE du projet (staging), JAMAIS dans le dépôt :
#      git archive HEAD | tar -x -C /tmp/staging
#      python3 scripts/make-placeholders.py /tmp/staging/public/images
#
# Le logo sacré (logo.webp) n'est jamais touché.

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# --- Palette maison (zéro bleu, aucun violet) -------------------------
ROSE_POUDRE = (251, 231, 235)   # fond
FIL_OR = (201, 168, 124)        # cadre pointillé
MARRON = (92, 46, 12)           # titres
MARRON_AIGUILLE = (139, 69, 19)  # aiguille / sous-titre
ROUGE_COLOMBE = (209, 35, 42)   # fil de l'aiguille
FRAMBOISE = (108, 41, 64)       # note bas

SERIF_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

TITRE = "Couture Colombe et Merceries"
NOTE = "Marqueur de pose — la vraie photo sera reposée"


def _fit(draw, text, font_path, start_size, max_width):
    """Renvoie une police qui tient dans max_width (réduit si besoin)."""
    size = max(10, int(start_size))
    while size > 10:
        font = ImageFont.truetype(font_path, size)
        if draw.textlength(text, font=font) <= max_width:
            return font, size
        size -= 2
    return ImageFont.truetype(font_path, 10), 10


def _dashed_rect(draw, box, color, width, dash=18, gap=12):
    """Cadre en pointillés — le point de bâti de la maison."""
    x0, y0, x1, y1 = box
    # haut + bas
    x = x0
    while x < x1:
        x2 = min(x + dash, x1)
        draw.line([(x, y0), (x2, y0)], fill=color, width=width)
        draw.line([(x, y1), (x2, y1)], fill=color, width=width)
        x += dash + gap
    # gauche + droite
    y = y0
    while y < y1:
        y2 = min(y + dash, y1)
        draw.line([(x0, y), (x0, y2)], fill=color, width=width)
        draw.line([(x1, y), (x1, y2)], fill=color, width=width)
        y += dash + gap


def make_placeholder(size, rel_name):
    w, h = size
    w = max(w, 320)
    h = max(h, 240)
    if w > 1100:  # toile plafonnée : le marqueur reste léger à télécharger
        h = int(h * 1100 / w)
        w = 1100
    im = Image.new("RGB", (w, h), ROSE_POUDRE)
    d = ImageDraw.Draw(im)
    s = min(w, h) / 900.0  # échelle

    # Double cadre pointillé or
    m = int(16 * s) + 8
    _dashed_rect(d, (m, m, w - m - 1, h - m - 1), FIL_OR, max(2, int(3 * s)), int(18 * s) + 8, int(12 * s) + 6)
    m2 = m + int(10 * s) + 6

    # Aiguille + fil rouge (motif maison)
    cx, cy = w / 2, h / 2 - int(90 * s)
    d.line([(cx - 90 * s, cy - 60 * s), (cx + 70 * s, cy + 30 * s)], fill=MARRON_AIGUILLE, width=max(3, int(6 * s)))
    eye = (cx - 102 * s, cy - 76 * s, cx - 76 * s, cy - 50 * s)
    d.ellipse(eye, outline=MARRON_AIGUILLE, width=max(2, int(5 * s)))
    d.arc((cx - 130 * s, cy - 110 * s, cx + 10 * s, cy + 6 * s), start=200, end=345, fill=ROUGE_COLOMBE, width=max(2, int(4 * s)))

    # Titre, nom de fichier, note — centrés
    maxw = w - 2 * m2 - 24
    f_titre, pt = _fit(d, TITRE, SERIF_BOLD, 52 * s, maxw)
    f_nom, _ = _fit(d, rel_name, SANS, 30 * s, maxw)
    f_note, _ = _fit(d, NOTE, SANS, 26 * s, maxw)
    y = cy + int(60 * s)
    for font, text, col, dy in ((f_titre, TITRE, MARRON, 0), (f_nom, rel_name, MARRON_AIGUILLE, int(pt * 1.35)), (f_note, NOTE, FRAMBOISE, int(pt * 2.5))):
        y += dy
        tw = d.textlength(text, font=font)
        d.text((cx - tw / 2, y), text, font=font, fill=col)
    return im


def main(root):
    root = Path(root)
    assert root.is_dir(), f"dossier introuvable : {root}"
    done, skipped = 0, 0
    for p in sorted(root.rglob("*.webp")):
        if p.name == "logo.webp":
            skipped += 1
            continue  # 🕊️ le logo est sacré
        try:
            with Image.open(p) as orig:
                size = orig.size
        except Exception:
            size = (1600, 1200)
        rel = p.relative_to(root)
        ph = make_placeholder(size, str(rel))
        ph.save(p, "WEBP", quality=38, method=6)
        done += 1
        print(f"  🪶 {rel}  ({size[0]}×{size[1]} -> {p.stat().st_size//1024} Ko)")
    print(f"✅ {done} marqueurs de pose cousus · {skipped} logo préservé")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "public/images")
