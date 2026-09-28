#!/usr/bin/env python3
# 🗺️ make-sitemaps — Couture Colombe et Merceries
#
# Régénère public/sitemap.xml et public/image-sitemap.xml en scannant
# les vraies images du dossier public/images/. Toutes les photos du
# site sont référencées auprès de Google, chacune rangée sur la page
# qui la porte (accueil, inspirations, services, formation, contact).
#
# Usage :  python3 scripts/make-sitemaps.py
# (à relancer quand des images sont ajoutées/retirées)

import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "public" / "images"
SITE = "https://lesservicescolombes.vercel.app"
TODAY = date.today().isoformat()

# Rangement des photos par page, dans l'ordre d'évaluation des préfixes
PAGE_RULES = [
    ("/formation", ["hero-formation", "formation-"]),
    ("/contact", ["hero-contact", "contact-"]),
    ("/services", ["hero-services"]),
    (
        "/inspirations",
        [
            "mariage-", "creation-", "inspirations", "monde-",
            "tenue-", "jeune-fille-", "famille-", "splash-", "layette-",
        ],
    ),
    ("/", ["header-", "logo", "og-", "atelier-"]),
]

# Pages publiques (les privées — tickets, paramètres, notifications,
# merci, 404 — restent volontairement dehors, cf. robots.txt)
PAGES_META = {
    "/": ("1.0", "weekly"),
    "/services": ("0.9", "weekly"),
    "/inspirations": ("0.9", "weekly"),
    "/formation": ("0.8", "monthly"),
    "/contact": ("0.8", "monthly"),
    "/mentions-legales": ("0.3", "yearly"),
}
ORDRE = ["/", "/services", "/inspirations", "/formation", "/contact", "/mentions-legales"]


def page_pour(nom: str) -> str:
    for page, prefixes in PAGE_RULES:
        if any(nom.startswith(p) for p in prefixes):
            return page
    return "/inspirations"  # par défaut : la galerie des modèles


def joli_titre(nom: str) -> str:
    """mariage-robe-07.webp -> « Mariage robe 07 »"""
    base = re.sub(r"\.[a-z0-9]+$", "", nom).replace("-", " ").replace("_", " ")
    return base.strip().capitalize()


def main() -> None:
    fichiers = sorted(
        p for p in IMAGES.rglob("*.webp") if p.is_file()
    )
    par_page: dict[str, list[str]] = {}
    for f in fichiers:
        rel = f.relative_to(ROOT / "public").as_posix()  # images/gallery/xxx.webp
        page = page_pour(f.name)
        par_page.setdefault(page, []).append(rel)

    entetes = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    )

    # ── sitemap.xml : les pages + leurs images (avec méta de page) ──
    lignes = [entetes]
    total_images = 0
    for page in ORDRE:
        prio, freq = PAGES_META[page]
        lignes.append("  <url>")
        lignes.append(f"    <loc>{SITE}{'' if page == '/' else page}</loc>")
        lignes.append(f"    <lastmod>{TODAY}</lastmod>")
        lignes.append(f"    <changefreq>{freq}</changefreq>")
        lignes.append(f"    <priority>{prio}</priority>")
        for rel in par_page.get(page, []):
            total_images += 1
            lignes.append("    <image:image>")
            lignes.append(f"      <image:loc>{SITE}/{rel}</image:loc>")
            lignes.append(f"      <image:title>{joli_titre(Path(rel).name)} — Couture Colombe et Merceries</image:title>")
            lignes.append("    </image:image>")
        lignes.append("  </url>")
    lignes.append("</urlset>")
    (ROOT / "public" / "sitemap.xml").write_text("\n".join(lignes) + "\n", encoding="utf-8")

    # ── image-sitemap.xml : le cheptel image complet, sans méta de page ──
    lignes2 = [entetes]
    for page in ORDRE:
        if page not in par_page:
            continue
        lignes2.append("  <url>")
        lignes2.append(f"    <loc>{SITE}{'' if page == '/' else page}</loc>")
        for rel in par_page[page]:
            lignes2.append("    <image:image>")
            lignes2.append(f"      <image:loc>{SITE}/{rel}</image:loc>")
            lignes2.append(f"      <image:title>{joli_titre(Path(rel).name)} — Couture Colombe et Merceries</image:title>")
            lignes2.append("    </image:image>")
        lignes2.append("  </url>")
    lignes2.append("</urlset>")
    (ROOT / "public" / "image-sitemap.xml").write_text("\n".join(lignes2) + "\n", encoding="utf-8")

    print(f"✔ sitemap.xml & image-sitemap.xml régénérés — {total_images} images référencées sur {len(par_page)} pages")
    for page in ORDRE:
        if page in par_page:
            print(f"   {page or '/':<16} {len(par_page[page]):>2} images")


if __name__ == "__main__":
    main()
