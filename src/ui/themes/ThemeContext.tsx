// https://devie-ui.com/theming

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
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
const STORAGE_KEY = "devie-theme";
const CHANGE_EVENT = "devie-theme-change";
const ALLOWED_THEMES = new Set(THEMES.map((theme) => theme.className));

function getStoredTheme(): string | null {
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

function getServerTheme(): null {
  return null;
}

function subscribeToStoredTheme(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function persistTheme(theme: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function applyThemeToDOM(theme: string): void {
  document.documentElement.dataset.devieTheme = theme;
}

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}: Props) {
  const storedTheme = useSyncExternalStore(
    subscribeToStoredTheme,
    getStoredTheme,
    getServerTheme,
  );
  const selectedTheme = storedTheme ?? defaultTheme;
  const [previewedTheme, setPreviewedTheme] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#7B7481");

  const currentTheme = previewedTheme ?? selectedTheme;
  const appliedRef = useRef(false);

  useEffect(() => {
    // Nothing chosen yet: keep the attribute set by the boot script.
    if (storedTheme !== null || previewedTheme !== null || appliedRef.current) {
      applyThemeToDOM(currentTheme);
      appliedRef.current = true;
    }

    const computedColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--devie__color__primary")
      .trim();

    if (computedColor) {
      setPrimaryColor(computedColor);
    }
  }, [currentTheme, storedTheme, previewedTheme]);

  const setTheme = useCallback((theme: string) => {
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
