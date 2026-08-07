=============================================================
 DOWNLOADS — DÉPÔT DE L'APK « COLOMBES »
=============================================================

👉 DÉPOSE ICI ton APK — n'importe quel nom convient :

       colombes-1.0.0.apk    → la page affichera « v1.0.0 · 23 Mo »
       colombes.apk          → la page affichera « 23 Mo · APK Android »
       app-release-final.apk → idem, ça marche aussi.

👉 ENSUITE (une seule commande, jamais de code) :

       node scripts/update-app-release.mjs

   (ou laisse Vercel le faire tout seul : il tourne au build,
    voir vercel.json → buildCommand)

⚠️  RÈGLES :
   - UN SEUL APK à la fois dans ce dossier (retire l'ancien),
   - extension .apk uniquement,
   - ce dossier est public : n'y mets rien d'autre.

Tant que ce dossier est VIDE, la page bascule toute seule en
mode « Être informé·e du lancement » (bouton → WhatsApp).
=============================================================
