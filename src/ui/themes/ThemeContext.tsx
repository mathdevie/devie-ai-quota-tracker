// https://devie-ui.com/theming

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DARK_THEME,
  LIGHT_THEME,
  SYSTEM_THEME,
  THEMES,
} from "@/ui/themes/registry";

interface ThemeContextType {
  selectedTheme: string;
  setTheme: (theme: string) => void;
  previewTheme: (theme: string) => void;
  clearPreviewTheme: () => void;
  primaryColor: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

interface Props {
  children: React.ReactNode;
  defaultTheme?: string;
}

const DEFAULT_THEME = SYSTEM_THEME;
const STORAGE_KEY = "devie-quota-theme:v1";
const ALLOWED_THEMES = new Set(THEMES.map((theme) => theme.className));
// Versions before the macOS themes stored the old Devie light theme.
const LEGACY_THEMES: Record<string, string> = { "theme-default": LIGHT_THEME };
const DARK_QUERY = "(prefers-color-scheme: dark)";

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const storedTheme = raw ? (LEGACY_THEMES[raw] ?? raw) : null;
    if (storedTheme && ALLOWED_THEMES.has(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Storage unavailable
  }

  return null;
}

function persistTheme(theme: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

/** The `system` option maps to the light or dark theme of the OS. */
function resolveTheme(theme: string, prefersDark: boolean): string {
  if (theme !== SYSTEM_THEME) return theme;
  return prefersDark ? DARK_THEME : LIGHT_THEME;
}

function applyThemeToDOM(theme: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.devieTheme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: Props) {
  const [selectedTheme, setSelectedTheme] = useState(
    () => getStoredTheme() ?? defaultTheme,
  );
  const [previewedTheme, setPreviewedTheme] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#7B7481");
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);

  const currentTheme = resolveTheme(
    previewedTheme ?? selectedTheme,
    prefersDark,
  );

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const update = () => setPrefersDark(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    applyThemeToDOM(currentTheme);

    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--devie__color__primary")
      .trim();

    if (computedColor) {
      setPrimaryColor(computedColor);
    }
  }, [currentTheme]);

  useEffect(() => {
    function handleStorageChange(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const newTheme = event.newValue;
      if (newTheme && ALLOWED_THEMES.has(newTheme)) {
        setSelectedTheme(newTheme);
        setPreviewedTheme(null);
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setTheme = useCallback((theme: string) => {
    setSelectedTheme(theme);
    setPreviewedTheme(null);
    persistTheme(theme);
  }, []);

  const previewTheme = useCallback((theme: string) => {
    setPreviewedTheme(theme);
  }, []);

  const clearPreviewTheme = useCallback(() => {
    setPreviewedTheme(null);
  }, []);

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
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
