=============================================================
 DOWNLOADS — DÉPÔT DE L'APK « COLOMBES »
=============================================================

👉 DÉPOSE ICI le fichier APK de l'application, en le nommant
   avec sa version, par exemple :

       colombes-1.0.0.apk
       colombes-1.2.3.apk       (quand tu publies la 1.2.3)

👉 ENSUITE, régénère le manifeste de version :

       node scripts/update-app-release.mjs

   (ou laisse Vercel le faire tout seul : il tourne au build,
    voir vercel.json → buildCommand)

👉 La page affiche alors automatiquement, sans toucher au code :

       « Télécharger l'app Colombes — v1.0.0 · 24,3 Mo »
       avec le bon lien de téléchargement.

⚠️  RÈGLES :
   - UN SEUL APK à la fois dans ce dossier (retire l'ancien),
   - ne JAMAIS mettre de lien vers un dépôt GitHub privé ici,
   - ce dossier est public : n'y mets rien d'autre que l'APK.

Tant que ce dossier est VIDE, la page bascule toute seule en
mode « Être informé(e) du lancement » (bouton → WhatsApp).
=============================================================
