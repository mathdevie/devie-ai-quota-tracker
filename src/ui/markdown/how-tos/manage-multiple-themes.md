# Manage More Themes

Devie UI supports several themes in one application with several sets of CSS variables. The active set is selected by the `data-devie-theme` attribute on the `<html>` element.

## Define themes

Scope each set of variables to a `data-devie-theme` value instead of `:root`. Then set the attribute on the `<html>` element:

**globals.scss**

```scss
@import "./themes/default";
@import "./themes/dark";
```

**themes/default.scss**

```scss
[data-devie-theme="theme-default"] {
  color-scheme: light;
  --devie__color__text: #111111;
  --devie__color__text-sub: #848385;
  --devie__color__background: #ffffff;
  --devie__color__background-sunken: #f5f5f5;
  --devie__color__primary: #5739da;
  /* ... other tokens */
}
```

**themes/dark.scss**

```scss
[data-devie-theme="theme-dark"] {
  color-scheme: dark;
  --devie__color__text: #f3faff;
  --devie__color__text-sub: #8fa3b0;
  --devie__color__background: #0b1118;
  --devie__color__background-sunken: #151c26;
  --devie__color__primary: #4a90e2;
  /* ... other tokens */
}
```

**index.html**

```html
<html data-devie-theme="theme-default">
  <!-- Your app will use the theme-default variables -->
</html>
```

## Set the active theme

Change the attribute to change the theme, for example with `document.documentElement.dataset.devieTheme`. Wire it to any trigger in your app.

## Persist the theme on refresh

To keep the choice after a refresh, store it and restore it before the first paint. A prebuilt site cannot personalize the HTML per request. Store the theme in Local Storage and run a small inline script in `layout.tsx` before hydration.

The options and their trade-offs:

| Approach | Trade-offs |
|---|---|
| **No persistence** | The attribute is hardcoded on `<html>` and resets on refresh. No flash. |
| **Local Storage after hydration** | Simple, but the theme is restored after React runs. The default theme can flash first. |
| **Local Storage + early boot script** | Recommended for static exports. Pages stay prebuilt, and the attribute is restored before hydration. |
| **Cookies + SSR** | Use it when the server must know the theme before it sends HTML. It prevents a static export. |
| **DB + SSR** | Same as cookies, with the preference read from your backend. Fits authenticated apps that already render on the server. |

## Example: a ThemeContext

### Static export with a boot script

The layout injects a boot script. The ThemeContext keeps the attribute and Local Storage in sync after mount.

**layout.tsx**

```tsx
import { ThemeProvider } from "@/ui/themes/ThemeContext";

const THEME_STORAGE_KEY = "devie-theme";
const DEFAULT_THEME = "theme-default";
const ALLOWED_THEMES = ["theme-default", "theme-dark"];
const themeBootScript = `(function () {
  try {
    var allowedThemes = new Set(${JSON.stringify(ALLOWED_THEMES)});
    var storedTheme = localStorage.getItem("devie-theme");
    document.documentElement.dataset.devieTheme =
      allowedThemes.has(storedTheme) ? storedTheme : "theme-default";
  } catch {
    document.documentElement.dataset.devieTheme = "theme-default";
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-devie-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script id="theme-boot">{themeBootScript}</script>
      </head>
      <body>
        <ThemeProvider defaultTheme={DEFAULT_THEME}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**App.tsx**

```tsx
import { ThemeProvider } from "@/ui/themes/ThemeContext";

function App() {
  return (
    <ThemeProvider defaultTheme="theme-default">
      {/* Your app */}
    </ThemeProvider>
  );
}
```

**ThemeContext.tsx**

```tsx
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
const ALLOWED_THEMES = new Set(["theme-default", "theme-dark"]);

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
```

### When to choose SSR

Use SSR when the server must know the theme before it renders. For a data attribute on `<html>` alone, it is overkill.

### Reference

#### ThemeContext props

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultTheme` | `string` | `"theme-default"` | The initial theme class name |

#### useTheme() returns

| Property | Type | Description |
|---|---|---|
| `selectedTheme` | `string` | The currently active theme |
| `setTheme(theme)` | `(string) => void` | Set and persist a new theme |
| `previewTheme(theme)` | `(string) => void` | Preview a theme without persisting |
| `clearPreviewTheme()` | `() => void` | Clear the preview, revert to selected |
| `primaryColor` | `string` | Computed primary color from current theme |

---

*Generated from [devie-ui.com/how-to/manage-multiple-themes](https://devie-ui.com/how-to/manage-multiple-themes)*