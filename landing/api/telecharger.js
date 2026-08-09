/* ============================================================
   /telecharger — Les Services Colombes
   ------------------------------------------------------------
   Redirige vers le dernier APK publié sur GitHub Releases,
   SANS JAMAIS exposer l'URL GitHub dans la page publique.
   - Résolution côté serveur (la page ne voit que "/telecharger")
   - Choix arm64-v8a en priorité (build léger, 95 % des téléphones)
   - Cache CDN 5 min → quasi aucun appel à l'API GitHub
   - GH_TOKEN (optionnel, Variables d'environnement Vercel) :
     passe de 60 à 5 000 requêtes/h si un jour le trafic monte
   ============================================================ */
const REPO = process.env.LSC_REPO || "Stein500/LSC";

export default async function handler(req, res) {
  const pageRelease = `https://github.com/${REPO}/releases/latest`;
  try {
    const headers = {
      "User-Agent": "lsc-landing-telecharger",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GH_TOKEN) headers.Authorization = "Bearer " + process.env.GH_TOKEN;

    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers,
      cache: "no-store",
    });
    if (!r.ok) throw new Error("api github " + r.status);

    const rel = await r.json();
    const apks = (rel.assets || []).filter((a) => /\.apk$/i.test(a.name || ""));
    const apk = apks.find((a) => /arm64/i.test(a.name || "")) || apks[0];
    if (!apk || !apk.browser_download_url) throw new Error("aucun apk joint");

    // 1 min de cache CDN au plus — une nouvelle release devient visible quasi aussitôt
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    res.setHeader("X-Robots-Tag", "noindex");
    return res.redirect(307, apk.browser_download_url);
  } catch (e) {
    // Repli propre : la page de la dernière release
    return res.redirect(307, pageRelease);
  }
}
