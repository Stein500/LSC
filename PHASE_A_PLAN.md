# Plan de découpe — 2 phases indépendantes

> Les briques du mailer et du PDF tournent dans deux modules serverless séparés
> (`api/lib/mailer.js` et `api/lib/pdf.js`). On peut donc améliorer l'un sans
> bloquer l'autre, et même les faire en parallèle par deux contributeurs.

---

## ✅ PHASE A — Mail client + Mail admin  (`api/lib/mailer.js`)
*Livrée dans ce zip.*

| # | Tâche | Statut |
|---|---|---|
| A1 | Bande "pagne tissé" SVG inline en tête (kente + couleurs atelier) | ✅ |
| A2 | Liseré "fil de couture" SVG inline en pied (avant footer) | ✅ |
| A3 | Pictos SVG inline sur les 4 étapes (carnet / ciseaux / bobine / aiguille) | ✅ |
| A4 | Bloc signature "Maman Colombe" en Caveat (Google Fonts) côté client | ✅ |
| A5 | Signature Caveat courte côté admin (alignée droite, italique) | ✅ |
| A6 | Import Google Fonts Caveat avec preconnect | ✅ |
| A7 | Media query responsive < 480px (padding + h1) | ✅ |
| A8 | Samples HTML + PNG pour les 3 profils × 2 destinataires | ✅ |

**Risque** : 🟢 Très faible. 100% HTML/SVG inline, pas de JSX/Tailwind.
**Réversible** : oui — il suffit de retirer les helpers ajoutés.
**Fichiers touchés** : `api/lib/mailer.js` uniquement (+ samples et script).
**Dépendances ajoutées** : aucune.

---

## 🕓 PHASE B — PDF récapitulatif  (`api/lib/pdf.js`)
*Livrée dans cette archive.*

| # | Tâche | Statut |
|---|---|---|
| B1 | Bloc "Signature atelier" en bas (ligne, espace, "Atelier Les Services Colombes", date) | ✅ |
| B2 | Date d'émission + n° de page "1/1" en footer PDF | ✅ |
| B3 | Mini-motif "fil de couture" en bas de la dernière page | ✅ |
| B4 | QR code WhatsApp SVG inline (optionnel) | ⏭️ |
| B5 | Sample PDF généré en local pour verif | ⏭️ |

**Pourquoi l'indépendance compte** :
- Phase A modifie `mailer.js` → touche tout ce qui passe par le mail (SMTP)
- Phase B modifie `pdf.js` → touche la génération PDF attachée
- Aucun import croisé entre les deux modules
- Aucune logique partagée impactée (templates HTML/JSX utilisés ? aucun — ce sont
  deux fonctions pures distinctes)

**Réversible** : oui pour chaque phase séparément.

---

## 🎯 Suite
* Phase A ✅ livrée.
* Phase B ✅ livrée dans cette archive.
* QR code WhatsApp SVG inline laissé en option non bloquante.
