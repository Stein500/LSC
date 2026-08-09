/* Tests jsdom — mise à jour silencieuse (30 s, cache-bust, replis) */
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

async function boot(stamps) {
  const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only" });
  const { window } = dom;
  let i = 0;
  window.fetch = (url, opts) => {
    const u = String(url);
    if (u.includes("version.json")) {
      const v = stamps[Math.min(i++, stamps.length - 1)];
      return v === null
        ? Promise.resolve({ ok: false, status: 404 })
        : Promise.resolve({ ok: true, json: () => Promise.resolve({ stamp: v }) });
    }
    if (u.includes("app-release.json")) return Promise.resolve({ ok: false });
    if (u.includes("api.github.com")) return Promise.resolve({ ok: false, status: 403 });
    if (u === "http://localhost/" && opts && opts.method === "HEAD")
      return Promise.resolve({ headers: { get: (k) => (k === "etag" ? '"ETAG-1"' : null) } });
    return Promise.reject(new Error("url inconnue " + u));
  };
  window.eval(appJs);
  await new Promise((r) => setTimeout(r, 80));
  return window;
}

console.log("\n━━━ G : pas de changement → silence ━━━");
let w = await boot(["AAA", "AAA", "AAA"]);
await w.__lscVerifier();
await w.__lscVerifier();
ok(w.__lscMajPrete === false, "même empreinte → aucune mise à jour");

console.log("\n━━━ H : changement détecté, écran visible et ACTIF → on attend ━━━");
w = await boot(["AAA", "BBB"]);
await w.__lscVerifier();
await new Promise((r) => setTimeout(r, 20));
ok(w.__lscMajPrete === true, "nouveau déploiement vu");
ok((w.__lscReloadEssais || 0) === 0, "zéro rechargement en pleine lecture");

console.log("\n━━━ I : pas de version.json → repli ETag ━━━");
w = await boot([null, null]);
await w.__lscVerifier();
ok(true, "aucun crash");

console.log("\n━━━ J : offline → silence total ━━━");
{
  const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only" });
  dom.window.fetch = () => Promise.reject(new Error("offline"));
  dom.window.eval(appJs);
  await new Promise((r) => setTimeout(r, 80));
  ok(dom.window.__lscMajPrete === false, "aucun plantage offline");
}

console.log("\n━━━ K : arrière-plan → rechargement silencieux + scroll gardé ━━━");
w = await boot(["AAA", "BBB"]);
await w.__lscVerifier();
await new Promise((r) => setTimeout(r, 30)); /* laisser le fetch interne aboutir */
Object.defineProperty(w.document, "visibilityState", { value: "hidden", configurable: true });
w.document.dispatchEvent(new w.Event("visibilitychange"));
ok((w.__lscReloadEssais || 0) === 1, "reload dès que l'onglet est caché");
ok(w.sessionStorage.getItem("lsc_scroll") !== null, "position de lecture sauvegardée");

console.log("\n━━━ L : visible mais INACTIF > 20 s → rechargement silencieux aussi ━━━");
w = await boot(["AAA", "BBB"]);
Object.defineProperty(w.document, "visibilityState", { value: "visible", configurable: true });
w.__lscForcerInactivite();
await w.__lscVerifier();
await new Promise((r) => setTimeout(r, 30));
ok((w.__lscReloadEssais || 0) === 1, "reload après inactivité");

console.log(echecs ? `\n🔴 ${echecs} ÉCHEC(S)` : "\n🟢 MISES À JOUR AUTO : TOUT VERT");
process.exit(echecs ? 1 : 0);
