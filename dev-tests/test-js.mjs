/* Tests jsdom — moteur de téléchargement : miroir local → GitHub direct → replis
   Lancer avec les CA système si besoin :
   NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt node test-js.mjs */
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const L = new URL("../landing/", import.meta.url).pathname;
const html = readFileSync(`${L}index.html`, "utf8");
const appJs = readFileSync(`${L}assets/app.js`, "utf8");

let echecs = 0;
const ok = (cond, message) => {
  console.log((cond ? "  ✅ " : "  ❌ ") + message);
  if (!cond) echecs++;
};

async function etat({ local, gh }) {
  const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only" });
  const { window } = dom;
  window.fetch = (url) => {
    const u = String(url);
    if (u.includes("app-release.json"))
      return local
        ? Promise.resolve({ ok: true, json: () => Promise.resolve(local) })
        : Promise.resolve({ ok: false });
    if (u.includes("version.json")) return Promise.resolve({ ok: false });
    if (u.includes("api.github.com")) {
      if (gh === 403) return Promise.resolve({ ok: false, status: 403 });
      if (gh === 404) return Promise.resolve({ ok: false, status: 404 });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(gh) });
    }
    return Promise.reject(new Error("url inconnue " + u));
  };
  window.eval(appJs);
  await new Promise((r) => setTimeout(r, 100));
  return window.document;
}

const REL = {
  tag_name: "v2.1.0",
  published_at: "2026-08-08T09:00:00.000Z",
  assets: [
    { name: "colombes-atelier-2.1.0-debug.apk", size: 551000000, download_count: 1, browser_download_url: "https://github.com/Stein500/LSC/releases/download/v2.1.0/UNIVERSEL-LOURD.apk" },
    { name: "colombes-atelier-2.1.0-arm64-v8a-debug.apk", size: 153000000, download_count: 42, browser_download_url: "https://github.com/Stein500/LSC/releases/download/v2.1.0/ARM64.apk" },
  ],
};

console.log("\n━━━ A : miroir local (priorité + nom propre imposé) ━━━");
let d = await etat({ local: { available: true, version: "9.9.9", file: "downloads/local.apk", sizeBytes: 1048576, updatedAt: "2026-08-08" }, gh: REL });
let b = d.querySelector(".app-id-card [data-download-btn]");
ok(b.href === "http://localhost/downloads/local.apk", "miroir local servi directement");
ok(b.getAttribute("download") === "Colombes-v9.9.9.apk", `nom propre imposé : « ${b.getAttribute("download")} »`);

console.log("\n━━━ B : GitHub Releases — URL JAMAIS en clair ━━━");
d = await etat({ local: null, gh: REL });
const btns = [...d.querySelectorAll("[data-download-btn]")];
ok(btns.every((x) => x.href === "http://localhost/telecharger"), "tous les boutons → /telecharger (notre domaine)");
ok(btns.every((x) => !/github/i.test(x.href)), "AUCUNE URL GitHub dans les boutons");
ok(d.querySelector(".btn-header [data-btn-sub]").textContent === "v2.1.0", "header : « v2.1.0 » — nom propre");
ok(d.querySelector(".app-id-card [data-btn-sub]").textContent === "v2.1.0 · 145,9 Mo · APK Android", "gros bouton versionné");
ok(d.querySelector("[data-version-chip]").textContent === "v2.1.0 · 145,9 Mo", "pastille citron propre");
ok(d.querySelector("[data-release-meta]").textContent.includes("42 téléchargements"), "compteur de la variante choisie");
ok(!/UNIVERSEL-LOURD|objects\.githubusercontent/.test(d.documentElement.innerHTML), "hygiène : zéro trace d'URL de téléchargement dans le DOM");

console.log("\n━━━ C : API limitée → page GitHub ━━━");
d = await etat({ local: null, gh: 403 });
ok([...d.querySelectorAll("[data-download-btn]")].every((x) => x.href.includes("releases/latest")), "repli fonctionnel");

console.log("\n━━━ D : aucune release → attente WhatsApp ━━━");
d = await etat({ local: { available: false }, gh: 404 });
ok(d.querySelector("[data-download-btn]").href.includes("wa.me/"), "WhatsApp");

console.log("\n━━━ E : release sans .apk → page GitHub ━━━");
d = await etat({ local: null, gh: { tag_name: "v9", assets: [] } });
ok([...d.querySelectorAll("[data-download-btn]")].every((x) => x.href.includes("releases/latest")), "repli");

console.log("\n━━━ F : E2E réel /api/telecharger (vraie release GitHub) ━━━");
const { default: handler } = await import(`${L}api/telecharger.js`);
const res = {
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
  redirect(code, url) { this.code = code; this.url = url; },
};
await handler({}, res);
ok(res.code === 307, "redirection 307");
ok(/releases\/download\//.test(res.url), `cible = asset réel : …${res.url.slice(-58)}`);
ok(/arm64/i.test(res.url), "variante arm64 choisie (jamais l'universel de 525 Mo)");
ok((res.headers["Cache-Control"] || "").includes("s-maxage=60"), "cache CDN 1 min max (release visible quasi aussitôt)");

console.log(echecs ? `\n🔴 ${echecs} ÉCHEC(S)` : "\n🟢 TÉLÉCHARGEMENT : TOUT VERT");
process.exit(echecs ? 1 : 0);
