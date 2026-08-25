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
import { THEMES } from "@/ui/themes/registry";

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

const DEFAULT_THEME = "theme-default";
const STORAGE_KEY = "devie-quota-theme:v1";
const ALLOWED_THEMES = new Set(THEMES.map((theme) => theme.className));

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
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

  const currentTheme = previewedTheme ?? selectedTheme;

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
