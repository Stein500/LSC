import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Scissors, Settings2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { trackCtaClick } from "@/utils/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { ConnectionStatusIcon } from "@/components/ui/ConnectionStatusIcon";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/formation", label: "Formation" },
  { to: "/inspirations", label: "Inspirations" },
  { to: "/contact", label: "Contact" },
];

/**
 * Texte du bandeau header — demandé explicitement par le client :
 *   - Titre      : "Les Services Colombes"
 *   - Sous-titre : "atelier, mercerie, centre de formation"
 */
const BAND_TITLE = "Les Services Colombes";
const BAND_SUBTITLE = "atelier · mercerie · centre de formation";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md py-1.5"
          : "bg-gradient-to-b from-white/90 via-white/70 to-white/0 backdrop-blur-sm py-2.5",
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div
              className={cn(
                "rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 group-hover:scale-105",
                scrolled ? "w-10 h-10" : "w-11 h-11 sm:w-12 sm:h-12",
              )}
              style={{ border: "2px solid var(--color-citron)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
            >
              <SmartImage
                src="/images/logo.webp"
                alt="Les Services Colombes"
                className="w-full h-full object-contain p-1.5"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  (el.parentElement?.querySelector("[data-fallback-logo]") as HTMLElement | null)?.style.setProperty(
                    "display",
                    "flex",
                  );
                }}
              />
              <span
                data-fallback-logo
                className="absolute inset-0 items-center justify-center text-[var(--color-orange)]"
                style={{ display: "none" }}
                aria-hidden="true"
              >
                <Scissors className="w-5 h-5" />
              </span>
            </div>

            <div className="leading-tight min-w-0">
              <p
                className={cn(
                  "font-bold tracking-wide truncate transition-all duration-300",
                  scrolled ? "text-sm sm:text-base" : "text-base sm:text-lg md:text-xl",
                )}
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-ink)",
                }}
              >
                {BAND_TITLE}
              </p>
              <p
                className={cn(
                  "truncate font-medium transition-all duration-300",
                  scrolled ? "text-[10px] sm:text-[11px]" : "text-[11px] sm:text-xs md:text-sm",
                )}
                style={{
                  color: "var(--color-orange-d)",
                  letterSpacing: "0.02em",
                }}
              >
                {BAND_SUBTITLE}
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative text-sm font-medium transition-colors py-1",
                    isActive ? "text-[var(--color-ink)]" : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={cn(
                        "absolute left-0 -bottom-0.5 h-[2px] rounded-full transition-all duration-300",
                        isActive ? "w-full" : "w-0",
                      )}
                      style={{ backgroundColor: "var(--color-citron-d)" }}
                    />
                  </>
                )}
              </NavLink>
            ))}
            <Link
              to="/services"
              onClick={() => trackCtaClick("nav_commander")}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-[var(--color-ink)] bg-[var(--color-citron)] hover:bg-[var(--color-citron-d)] transition-all hover:-translate-y-0.5 shadow-sm"
            >
              Commander
            </Link>
            <ConnectionStatusIcon size="md" withLabel />
            <NotificationBell size="md" />
            <Link
              to="/parametres"
              className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-full border border-[var(--color-line)] bg-white/80 text-[var(--color-ink)] hover:border-[var(--color-citron)] transition-colors"
              aria-label="Ouvrir les paramètres"
            >
              <Settings2 className="w-4 h-4" />
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2 shrink-0">
            <ConnectionStatusIcon size="sm" withLabel={false} />
            <NotificationBell size="sm" />
            <Link
              to="/parametres"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg border border-[var(--color-line)] bg-white/85 text-[var(--color-ink)] hover:border-[var(--color-citron)]"
              aria-label="Paramètres"
            >
              <Settings2 className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 p-2.5 min-h-[44px] min-w-[44px] rounded-lg text-[var(--color-ink)] hover:bg-black/5 inline-flex items-center justify-center relative"
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden mt-3 bg-white rounded-2xl shadow-lg p-3 animate-fade-in border border-[var(--color-line)]">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-xl mb-1 font-medium transition-colors",
                    isActive
                      ? "bg-[var(--color-citron)]/30 text-[var(--color-ink)]"
                      : "text-[var(--color-ink-soft)] hover:bg-black/5",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/services"
              className="mt-2 block text-center px-5 py-3 rounded-xl font-semibold bg-[var(--color-citron)] text-[var(--color-ink)]"
            >
              Commander
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
