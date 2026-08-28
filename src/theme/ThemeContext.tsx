"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isDesktop } from "@/lib/desktop";
import {
  DARK_THEME,
  LIGHT_THEME,
  SYSTEM_THEME,
  THEMES,
} from "@/theme/registry";

interface ThemeContextType {
  selectedTheme: string;
  setTheme: (theme: string) => void;
  previewTheme: (theme: string) => void;
  clearPreviewTheme: () => void;
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_THEME = SYSTEM_THEME;
const STORAGE_KEY = "devie-quota-theme:v1";
const ALLOWED_THEMES = new Set(THEMES.map((theme) => theme.className));
const LEGACY_THEMES: Record<string, string> = { "theme-default": LIGHT_THEME };
const DARK_QUERY = "(prefers-color-scheme: dark)";

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const storedTheme = raw ? (LEGACY_THEMES[raw] ?? raw) : null;
    return storedTheme && ALLOWED_THEMES.has(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

function persistTheme(theme: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable in a restricted webview.
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

function resolveTheme(theme: string, prefersDark: boolean): string {
  if (theme !== SYSTEM_THEME) return theme;
  return prefersDark ? DARK_THEME : LIGHT_THEME;
}

function applyThemeToDOM(theme: string): void {
  document.documentElement.dataset.devieTheme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [selectedTheme, setSelectedTheme] = useState(
    () => getStoredTheme() ?? DEFAULT_THEME,
  );
  const [previewedTheme, setPreviewedTheme] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#007aff");
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);

  const activeTheme = previewedTheme ?? selectedTheme;
  const resolvedTheme = resolveTheme(activeTheme, prefersDark);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const update = () => setPrefersDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    applyThemeToDOM(resolvedTheme);

    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--devie__color__primary")
      .trim();
    if (computedColor) setPrimaryColor(computedColor);
  }, [resolvedTheme]);

  useEffect(() => {
    if (!isDesktop()) return;

    const nativeTheme =
      activeTheme === SYSTEM_THEME
        ? null
        : resolvedTheme === DARK_THEME
          ? "dark"
          : "light";
    void import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => getCurrentWindow().setTheme(nativeTheme))
      .catch(() => {
        // The CSS theme still works if the native window cannot change.
      });
  }, [activeTheme, resolvedTheme]);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const nextTheme = event.newValue;
      if (nextTheme && ALLOWED_THEMES.has(nextTheme)) {
        setSelectedTheme(nextTheme);
        setPreviewedTheme(null);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setTheme = useCallback((theme: string) => {
    if (!ALLOWED_THEMES.has(theme)) return;
    setSelectedTheme(theme);
    setPreviewedTheme(null);
    persistTheme(theme);
  }, []);

  const previewTheme = useCallback((theme: string) => {
    if (ALLOWED_THEMES.has(theme)) setPreviewedTheme(theme);
  }, []);

  const clearPreviewTheme = useCallback(() => setPreviewedTheme(null), []);

  const value = useMemo(
    () => ({
      selectedTheme,
      setTheme,
      previewTheme,
      clearPreviewTheme,
      primaryColor,
    }),
    [selectedTheme, setTheme, previewTheme, clearPreviewTheme, primaryColor],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
