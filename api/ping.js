// /api/ping — endpoint ultra-léger pour vérifier la connectivité
// depuis le navigateur (utilisé par useOnlineStatus).
//
// Réponse : 204 No Content (ou 200 JSON si ?info=1).
// Pas de DB, pas de dépendance externe, pas d'auth.

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method === "HEAD") {
    res.status(200).end();
    return;
  }

  if (req.query && req.query.info === "1") {
    res.status(200).json({
      ok: true,
      ts: Date.now(),
      region: process.env.VERCEL_REGION || "unknown",
    });
    return;
  }

  // 204 = "No Content", idéal pour un ping
  res.status(204).end();
}
