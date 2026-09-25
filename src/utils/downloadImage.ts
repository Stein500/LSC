import { notify } from "@/utils/notify";

/**
 * downloadAtelierImage — la photo part chez le visiteur, bien nommée 🕊️
 * ---------------------------------------------------------------------
 * Chaque image du site est signée (cachet logo + « Couture Colombe &
 * Merceries », posé par scripts/stamp-signature.py) : on la laisse
 * volontiers partir — la signature voyage avec elle.
 *
 * Nom de fichier : `couture-colombe-merceries--<image>.webp`
 */
export async function downloadAtelierImage(
  src: string,
  opts: { silent?: boolean } = {},
): Promise<boolean> {
  const base = src.split("/").pop()?.replace(/\.webp(\?.*)?$/, "") || "image";
  const filename = `couture-colombe-merceries--${base}.webp`;
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`http ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (!opts.silent) {
      notify.success("Image téléchargée — signée Couture Colombe & Merceries 🕊️");
    }
    return true;
  } catch {
    if (!opts.silent) {
      notify.error("Le téléchargement a glissé entre les mailles — réessayez.");
    }
    return false;
  }
}
