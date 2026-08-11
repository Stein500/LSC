import { cn } from "@/utils/cn";
import { isColombesApp } from "@/utils/appBridge";

/**
 * Aurora — fond animé de halos de couleur (toujours la palette de
 * l'atelier : rose poudré, rouge colombe, marron doré) qui dérivent lentement.
 * 100% CSS (blur + keyframes), zéro JS par frame → aucun coût CPU navigateur.
 *
 * 📱 Dans l'app Colombes (WebView) : les gros blurs animés coûtent cher au
 * GPU du téléphone → l'Aurora se retire, le fond rose poudré reste souverain.
 *
 * Usage : <Aurora className="absolute inset-0 -z-10" intensity="soft" />
 */
export function Aurora({
  className,
  intensity = "normal",
  variant = "sky",
}: {
  className?: string;
  intensity?: "soft" | "normal" | "vivid";
  variant?: "sky" | "warm" | "night";
}) {
  // 📱 Relais natif : pas de halos animés dans la WebView (GPU épargné)
  if (isColombesApp()) return null;

  const opacity =
    intensity === "soft" ? "opacity-50" : intensity === "vivid" ? "opacity-90" : "opacity-70";

  const palettes: Record<string, [string, string, string]> = {
    // Rosée : rose poudré + blanc + rouge colombe léger
    sky: ["rgba(249,205,215,0.60)", "rgba(255,255,255,0.55)", "rgba(209,35,42,0.12)"],
    // Chaud : marron + safran + rose léger
    warm: ["rgba(139,69,19,0.28)", "rgba(244,184,96,0.25)", "rgba(249,205,215,0.35)"],
    // Nuit : profondeurs marron + rouge colombe discret
    night: ["rgba(209,35,42,0.14)", "rgba(92,46,12,0.32)", "rgba(139,69,19,0.22)"],
  };
  const [c1, c2, c3] = palettes[variant];

  return (
    <div className={cn("pointer-events-none overflow-hidden", className)} aria-hidden="true">
      <div
        className={cn("absolute rounded-full blur-[90px] lsc-drift", opacity)}
        style={{
          width: "46%",
          height: "52%",
          top: "-12%",
          left: "-8%",
          background: c1,
          animationDuration: "16s",
        }}
      />
      <div
        className={cn("absolute rounded-full blur-[110px] lsc-drift", opacity)}
        style={{
          width: "42%",
          height: "56%",
          top: "18%",
          right: "-10%",
          background: c2,
          animationDuration: "20s",
          animationDelay: "-6s",
        }}
      />
      <div
        className={cn("absolute rounded-full blur-[100px] lsc-drift", opacity)}
        style={{
          width: "38%",
          height: "46%",
          bottom: "-14%",
          left: "22%",
          background: c3,
          animationDuration: "23s",
          animationDelay: "-11s",
        }}
      />
    </div>
  );
}
