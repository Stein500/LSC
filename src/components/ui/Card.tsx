import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  bordered?: boolean;
};

export function Card({ children, hover = true, bordered = true, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6",
        bordered && "border border-[var(--color-line)]",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}