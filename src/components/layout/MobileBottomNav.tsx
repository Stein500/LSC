import { NavLink } from "react-router-dom";
import { Home, Scissors, GraduationCap, Phone, Sparkles, EllipsisVertical } from "lucide-react";
import { cn } from "@/utils/cn";
import { QuickMenu } from "./QuickMenu";

const items = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/services", label: "Services", Icon: Scissors },
  { to: "/formation", label: "Formation", Icon: GraduationCap },
  { to: "/inspirations", label: "Inspirations", Icon: Sparkles },
  { to: "/contact", label: "Contact", Icon: Phone },
];

export function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[var(--color-line)] safe-bottom">
      <div className="grid grid-cols-6">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-[var(--color-ink)]" : "text-[var(--color-muted)]",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                    isActive ? "bg-[var(--color-citron)] scale-110" : "bg-transparent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        <div className="flex items-center justify-center py-2">
          <QuickMenu
            triggerLabel="Menu"
            triggerIcon={EllipsisVertical}
            className="relative w-full h-full flex items-center justify-center"
            buttonClassName="w-full h-[56px] flex-col gap-1 rounded-none border-0 bg-transparent px-0 py-0 shadow-none hover:bg-transparent"
          />
        </div>
      </div>
    </nav>
  );
}
