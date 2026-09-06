#!/usr/bin/env python3
"""Construit lsc-colombes-leger.zip : projet COMPLET, images → placeholders
16×16 de la mosaïque atelier (rose poudré, ligne, fil d'or, blush).
Usage : python3 scripts/build-leger.py   (nécessite Pillow)"""
import subprocess, os, shutil, io
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = "/tmp/lsc-leger"
OUT = os.path.join(REPO, "lsc-colombes-leger.zip")
TONES = ["#FBE7EB", "#EFC9D1", "#C9A87C", "#FBE4E6"]
RASTER_EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".ico"}

if os.path.exists(STAGE): shutil.rmtree(STAGE)
os.makedirs(STAGE)

files = subprocess.check_output(["git", "ls-files"], cwd=REPO, text=True).splitlines()
files = [f for f in files if f not in ("lsc-colombes-complet.zip", "lsc-colombes-patch.zip", "lsc-colombes-leger.zip")]

n_ph, saved = 0, 0
placeholders = {}
def make_placeholder(ext, tone):
    key = (ext, tone)
    if key in placeholders: return placeholders[key]
    img = Image.new("RGB", (16, 16), tone)
    buf = io.BytesIO()
    fmt = {".webp":"WEBP",".png":"PNG",".jpg":"JPEG",".jpeg":"JPEG",".gif":"GIF",".ico":"ICO"}[ext]
    if fmt == "WEBP": img.save(buf, "WEBP", quality=20, method=6)
    elif fmt == "JPEG": img.save(buf, "JPEG", quality=20, optimize=True)
    elif fmt == "ICO": img.save(buf, "ICO", sizes=[(16, 16)])
    else: img.save(buf, fmt, optimize=True)
    placeholders[key] = buf.getvalue()
    return placeholders[key]

for rel in files:
    src, dst = os.path.join(REPO, rel), os.path.join(STAGE, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    ext = os.path.splitext(rel)[1].lower()
    if ext in RASTER_EXT:
        with open(dst, "wb") as f:
            f.write(make_placeholder(ext, TONES[hash(rel) % len(TONES)]))
        n_ph += 1; saved += os.path.getsize(src)
    else:
        shutil.copy2(src, dst)

with open(os.path.join(STAGE, "LISEZMOI-PLACEHOLDERS.txt"), "w", encoding="utf-8") as f:
    f.write("""LES SERVICES COLOMBES — ZIP LÉGER (placeholders)
================================================

Ce zip contient le PROJET COMPLET, mais chaque image
(public/images/**, icônes, favicon…) a été remplacée par un
placeholder ultra-léger de la palette atelier (16×16 px,
même nom, même extension).

Pour retrouver le site en fleur :
  → déposez vos vraies images aux mêmes chemins en écrasant
    les placeholders (copie simple, tout se remet en place).

Site + app partagent la même adresse : lesservicescolombes. 🧵
""")

if os.path.exists(OUT): os.remove(OUT)
subprocess.run(["zip", "-q", "-r", OUT, "."], cwd=STAGE, check=True)
print(f"placeholders: {n_ph} | images évitées: {saved/1e6:.1f} Mo | zip: {os.path.getsize(OUT)/1e3:.0f} Ko")
