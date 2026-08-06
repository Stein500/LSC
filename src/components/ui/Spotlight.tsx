import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Spotlight — halo lumineux qui suit le curseur à l'intérieur d'une
 * carte (classe .lsc-spotlight). Met à jour des variables CSS, donc
 * zéro re-render React.
 */
export function Spotlight({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn("lsc-spotlight", className)} {...rest}>
      {children}
    </div>
  );
}
