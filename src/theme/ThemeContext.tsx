import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type ThemeMode = "auto" | "light" | "dark" | "amoled";
export type ResolvedTheme = "light" | "dark" | "amoled";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "colombes_theme_mode";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "auto") return getSystemPreference();
  return mode;
}

function getThemeColor(theme: ResolvedTheme) {
  switch (theme) {
    case "dark":
      return "#101b24";
    case "amoled":
      return "#000000";
    default:
      return "#5C2E0C";
  }
}

function applyTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", getThemeColor(theme));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "auto" || stored === "light" || stored === "dark" || stored === "amoled" ? stored : "auto";
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(mode));

  useEffect(() => {
    const nextResolved = resolveTheme(mode);
    setResolvedTheme(nextResolved);
    applyTheme(nextResolved);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    if (mode !== "auto") return;
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const onChange = () => {
      const nextResolved = resolveTheme("auto");
      setResolvedTheme(nextResolved);
      applyTheme(nextResolved);
    };
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, [mode]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode,
    }),
    [mode, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
