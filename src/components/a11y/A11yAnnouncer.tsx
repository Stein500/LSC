import { useEffect, useRef, useState } from "react";
import { toast, useSonner, type ToastT } from "sonner";

/**
 * Zone ARIA live globale (polite + assertive) qui relaie les messages
 * destinés aux screen readers.
 *
 * Pourquoi : les toasts Sonner ont un `role="status"` mais leur
 * comportement d'annonce peut varier selon les lecteurs d'écran. Avoir
 * une zone live dédiée garantit que le contenu du toast est annoncé
 * quoi qu'il arrive, même si l'utilisateur a déjà bougé son focus.
 *
 * - `error` → assertive (interrompt le lecteur)
 * - autres → polite (attend la fin de l'annonce en cours)
 */
export function A11yAnnouncer() {
  const { toasts } = useSonner();
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");
  const lastSeenIds = useRef<Set<number | string>>(new Set());

  useEffect(() => {
    // On identifie les nouveaux toasts (id non encore vus)
    for (const t of toasts) {
      if (lastSeenIds.current.has(t.id)) continue;
      lastSeenIds.current.add(t.id);

      const title = extractText(t.title);
      const description = extractText(t.description);
      const message = [title, description].filter(Boolean).join(" — ");
      if (!message) continue;

      if (t.type === "error") {
        setAssertiveMsg("");
        requestAnimationFrame(() => setAssertiveMsg(message));
      } else if (
        t.type === "success" ||
        t.type === "info" ||
        t.type === "warning" ||
        t.type === "loading"
      ) {
        setPoliteMsg("");
        requestAnimationFrame(() => setPoliteMsg(message));
      }
    }

    // Nettoyage des ids qui ne sont plus dans la liste (toast dismissed)
    const currentIds = new Set(toasts.map((t) => t.id));
    for (const id of lastSeenIds.current) {
      if (!currentIds.has(id)) lastSeenIds.current.delete(id);
    }
  }, [toasts]);

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMsg}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMsg}
      </div>
    </>
  );
}

/**
 * Extrait le texte d'un title/description qui peut être string,
 * ReactNode ou une fonction. On récupère juste ce qu'on peut.
 */
function extractText(node: ToastT["title"] | ToastT["description"]): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "function") {
    try {
      const out = (node as () => unknown)();
      if (typeof out === "string") return out;
    } catch {
      /* ignore */
    }
    return "";
  }
  // ReactNode → on tente d'extraire les children string
  if (typeof node === "object" && "props" in (node as any)) {
    const props = (node as any).props;
    if (typeof props?.children === "string") return props.children;
  }
  return "";
}
