"use client";

import { useCallback, useEffect, useState } from "react";
import { getAppSettings, setTranslucency as saveTranslucency } from "./desktop";

export const TRANSLUCENCY_KEY = "devie-qt-translucent:v1";
const DEFAULT_TRANSLUCENT = true;

function readCached(): boolean {
  if (typeof window === "undefined") return DEFAULT_TRANSLUCENT;
  try {
    const value = localStorage.getItem(TRANSLUCENCY_KEY);
    return value === null ? DEFAULT_TRANSLUCENT : value === "1";
  } catch {
    return DEFAULT_TRANSLUCENT;
  }
}

function applyToDocument(translucent: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.translucent = translucent ? "true" : "false";
  try {
    // The boot script reads this cache to avoid a flash before hydration.
    localStorage.setItem(TRANSLUCENCY_KEY, translucent ? "1" : "0");
  } catch {
    // Storage unavailable
  }
}

/**
 * Controls the macOS vibrancy behind the sidebar.
 * The desktop core owns the setting; the browser preview keeps a local copy.
 */
export function useTranslucency(): [boolean, (value: boolean) => void] {
  const [translucent, setState] = useState(DEFAULT_TRANSLUCENT);

  useEffect(() => {
    setState(readCached());
    void getAppSettings().then((settings) => {
      if (!settings) return;
      setState(settings.translucent);
      applyToDocument(settings.translucent);
    });
  }, []);

  const setTranslucent = useCallback((value: boolean) => {
    setState(value);
    applyToDocument(value);
    void saveTranslucency(value);
  }, []);

  return [translucent, setTranslucent];
}
