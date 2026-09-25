#!/usr/bin/env python3
"""
compose-og.py — la carte de visite sociale (1200×630) 🕊️
=========================================================
Compose public/images/og-share-preview.webp à partir de
tmp-gen/og-art.png (illustration wax générée) :

  « LES SERVICES COLOMBES »  + médaillon colombe
  devient…
  COUTURE COLOMBE & MERCERIES   (lettres chaudes)
  Atelier · Mercerie · Formation — Porto-Novo, depuis 1990

  + bande wax en bas (bleu roi, safran, rose, marron, or, rouge colombe).
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")

W, H = 1200, 630
SRC = "tmp-gen/og-art.png"
DST = "public/images/og-share-preview.webp"

PLAYFAIR = "/tmp/playfair.ttf"
POPPINS = "/tmp/poppins.ttf"

GOLD = (201, 168, 124)
SAFRAN = (233, 163, 25)
IVOIRE = (247, 235, 221)
BLANC_85 = (255, 255, 255, 216)
MARRON = (92, 46, 12)

# bande wax — la palette de la maison (09/2026) : orange, safran, rose,
# marron, fil d'or, rouge colombe, vert citron feuille — JAMAIS de bleu.
WAX = [
    (232, 116, 20),  # orange
    (244, 184, 96),  # safran
    (251, 231, 235), # rose poudré
    (92, 46, 12),    # marron
    (201, 168, 124), # fil d'or
    (209, 35, 42),   # rouge colombe
    (124, 186, 69),  # vert citron feuille
]


def main() -> None:
    art = ImageOps.fit(Image.open(SRC).convert("RGB"), (W, H), Image.LANCZOS)
    base = art.convert("RGBA")

    # Léger voile cacao à gauche pour poser le texte
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dv = ImageDraw.Draw(veil)
    for x in range(W):
        a = max(0, 96 - int(x * 96 / 560))
        if a:
            dv.line([(x, 0), (x, H)], fill=(21, 13, 17, a))
    base.alpha_composite(veil)

    d = ImageDraw.Draw(base)
    f_brand = ImageFont.truetype(POPPINS, 26)
    f_dev = ImageFont.truetype(POPPINS, 32)
    f_nom = ImageFont.truetype(PLAYFAIR, 86)
    f_suite = ImageFont.truetype(PLAYFAIR, 52)
    f_line = ImageFont.truetype(POPPINS, 23)

    # Médaillon colombe
    logo = Image.open("public/images/logo.webp").convert("RGB")
    logo = ImageOps.fit(logo, (92, 92), Image.LANCZOS)
    mask = Image.new("L", (92, 92), 0)
    ImageDraw.Draw(mask).ellipse((4, 4, 88, 88), fill=255)
    disc = Image.new("RGBA", (92, 92), (0, 0, 0, 0))
    disc.paste(logo, (0, 0), mask)
    ring = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, 99, 99), outline=GOLD + (255,), width=3)
    ring.alpha_composite(disc, (4, 4))
    base.alpha_composite(ring, (80, 78))

    x = 80
    d.text((x + 112, 108), "LES SERVICES COLOMBES", font=f_brand, fill=GOLD)
    d.text((x, 226), "devient…", font=f_dev, fill=BLANC_85)
    d.text((x, 278), "Couture Colombe", font=f_nom, fill=IVOIRE, stroke_width=1, stroke_fill=IVOIRE)
    d.text((x + 2, 392), "& Merceries", font=f_suite, fill=SAFRAN, stroke_width=1, stroke_fill=SAFRAN)
    d.text((x, 470), "Atelier · Mercerie · Formation — Porto-Novo, depuis 1990", font=f_line, fill=(255, 255, 255, 185))

    # Bande wax en bas
    strip_h = 12
    seg = 96
    for i, cx in enumerate(range(0, W + seg, seg)):
        d.rectangle((cx, H - strip_h, cx + seg, H), fill=WAX[i % len(WAX)])
    d.rectangle((0, H - strip_h - 2, W, H - strip_h), fill=GOLD)

    base.convert("RGB").save(DST, "WEBP", quality=88, method=6)
    print(f"og ✓ {DST} ({os.path.getsize(DST)//1024} Ko)")


if __name__ == "__main__":
    main()
