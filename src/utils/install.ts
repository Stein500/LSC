import { notify } from "@/utils/notify";
import { trackCtaClick } from "@/utils/api";
import { promptInstallPwa, isAppleTouch } from "@/hooks/useInstallPrompt";

/**
 * installAtelier — le geste unique du bouton « Installer ».
 *
 * Même fil partout (footer, messager, Paramètres) :
 *  1. la pose est tracée (analytics couture, sans URL) ;
 *  2. l'invite native s'ouvre si le navigateur l'a préparée ;
 *  3. sinon, le mode d'emploi — iOS : Partager → écran d'accueil ;
 *     Android/desktop : menu ⋮ → « Installer l'application ».
 *
 * L'ancienne voie (APK des releases) n'est plus proposée aux visiteurs
 * web : l'installation passe désormais par la PWA, tout simplement. 🕊️
 */
export async function installAtelier(origin: string): Promise<void> {
  trackCtaClick(origin);
  const outcome = await promptInstallPwa();
  if (outcome === "installed") {
    notify.success("Colombes est installée 🕊️", {
      description: "L'atelier vit désormais sur ton écran d'accueil.",
    });
  } else if (outcome === "instructions") {
    notify.info("Deux gestes suffisent", {
      duration: 9000,
      description: isAppleTouch()
        ? "Bouton Partager ↑ → « Sur l'écran d'accueil » → Ajouter."
        : "Menu ⋮ du navigateur → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).",
    });
  }
  // "dismissed" → la personne a refermé l'invite native : silence poli.
}
