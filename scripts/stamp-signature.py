#!/usr/bin/env python3
"""
stamp-signature.py — le cachet de la maison 🕊️
==============================================
Appose le filigrane SIGNATURE sur les photos de l'atelier :
médaillon colombe + « Couture Colombe & Merceries », dans une
pastille crème en bas à droite — anti-fausse-utilisation.

Modes :
  python3 scripts/stamp-signature.py fresh  entree.png|jpg sortie.webp
      → cadre au gabarit 1600×1200 (cover centre), convertit WebP q78,
        puis appose le cachet (image neuve, pas de flou).
  python3 scripts/stamp-signature.py restamp  fichier.webp [fichier2.webp …]
      → ré-appose le cachet en place (adoucit d'abord la zone de
        l'ANCIEN cachet pour qu'il s'efface sous la pastille).

Fonts : Playfair / Poppins lues depuis /tmp (rapatriées du projet Android)
avec repli sur DejaVu si présentes.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

os.chdir(os.path.dirname(os.path.abspath(__file__)) + "/..")

GABARIT = (1600, 1200)
TXT = "Couture Colombe & Merceries"
MARRON = (92, 46, 12)
GOLD = (201, 168, 124)

FONT_POPPINS_CANDIDATES = [
    "/tmp/poppins.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/dejavu/DejaVuSans.ttf",
]


def _font(size: int) -> ImageFont.FreeTypeFont:
    for p in FONT_POPPINS_CANDIDATES:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def _circular_logo(size: int) -> Image.Image:
    """Le logo (disque blanc sur fond carré sombre) ramené à un cercle net."""
    logo = Image.open("public/images/logo.webp").convert("RGB")
    logo = ImageOps.fit(logo, (size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    # le disque blanc occupe ~93 % du carré : on rogne les coins noirs
    m = round(size * 0.035)
    d.ellipse((m, m, size - m, size - m), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(logo, (0, 0), mask)
    return out


def stamp(img: Image.Image, *, soft_blur: bool) -> Image.Image:
    """Appose la pastille signature en bas à droite d'une image RGB."""
    img = img.convert("RGB")
    W, H = img.size
    s = W / 1600.0  # échelle relative au gabarit maison
    margin = round(28 * s)
    logo_sz = round(72 * s)
    pad_x = round(26 * s)
    pad_y = round(17 * s)
    gap = round(16 * s)
    font = _font(round(29 * s))

    tb = font.getbbox(TXT)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    pill_w = pad_x + logo_sz + gap + tw + pad_x
    pill_h = max(logo_sz, th) + pad_y * 2

    x1, y1 = W - margin - pill_w, H - margin - pill_h
    x2, y2 = W - margin, H - margin

    if soft_blur:
        # l'ancien cachet s'efface en douceur sous la pastille
        z = round(24 * s)
        zone = img.crop((max(0, x1 - z), max(0, y1 - z), min(W, x2 + z), min(H, y2 + z)))
        zone = zone.filter(ImageFilter.GaussianBlur(radius=round(14 * s)))
        img.paste(zone, (max(0, x1 - z), max(0, y1 - z)))

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # ombre douce puis pastille crème ourlée d'or
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        (x1, y1 + round(3 * s), x2, y2 + round(5 * s)), radius=pill_h // 2, fill=(40, 20, 8, 90)
    )
    layer.alpha_composite(sh.filter(ImageFilter.GaussianBlur(radius=round(7 * s))))
    d.rounded_rectangle((x1, y1, x2, y2), radius=pill_h // 2, fill=(255, 253, 250, 232))
    d.rounded_rectangle((x1, y1, x2, y2), radius=pill_h // 2, outline=GOLD + (200,), width=max(1, round(2 * s)))
    # médaillon colombe
    layer.alpha_composite(_circular_logo(logo_sz), (x1 + pad_x, y1 + pad_y))
    # nom de l'atelier
    ty = y1 + pad_y + (logo_sz - th) / 2 - tb[1]
    d.text((x1 + pad_x + logo_sz + gap, ty), TXT, font=font, fill=MARRON + (235,))

    out = img.convert("RGBA")
    out.alpha_composite(layer)
    return out.convert("RGB")


def cover_to_gabarit(img: Image.Image) -> Image.Image:
    return ImageOps.fit(img.convert("RGB"), GABARIT, Image.LANCZOS)


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    mode = sys.argv[1]

    if mode == "fresh":
        src, dst = sys.argv[2], sys.argv[3]
        im = cover_to_gabarit(Image.open(src))
        im = stamp(im, soft_blur=False)
        im.save(dst, "WEBP", quality=78, method=6)
        print(f"fresh ✓ {dst} ({os.path.getsize(dst)//1024} Ko)")
    elif mode == "restamp":
        for path in sys.argv[2:]:
            im = Image.open(path)
            im = stamp(im, soft_blur=True)
            im.save(path, "WEBP", quality=80, method=6)
            print(f"restamp ✓ {path} ({os.path.getsize(path)//1024} Ko)")
    else:
        print(f"mode inconnu : {mode}")
        sys.exit(1)


if __name__ == "__main__":
    main()
