# Manage More Themes

In Devie UI, supporting multiple themes in one application can be achieved relatively simply by having multiple available sets of CSS Variables to swap between.

Our proposed solution relies on a data attribute to scope the CSS variables: the app knows what set of variables is effective based on the `data-devie-theme` attribute on the root `<html>` element.

## Define Themes

The main idea here is to scope the definition of variables to a data attribute value instead of applying them to the root.

Then, set the `data-devie-theme` attribute on the html element to your active theme:

**globals.scss**

```scss
@import "./themes/default";
@import "./themes/dark";
```

**themes/default.scss**

```scss
[data-devie-theme="theme-default"] {
  --devie__color__text: #111111;
  --devie__color__text-sub: #848385;
  --devie__color__background: #ffffff;
  --devie__color__background-sub: #f5f5f5;
  --devie__color__primary: #5739da;
  /* ... other tokens */
}
```

**themes/dark.scss**

```scss
[data-devie-theme="theme-dark"] {
  --devie__color__text: #f3faff;
  --devie__color__text-sub: #8fa3b0;
  --devie__color__background: #0b1118;
  --devie__color__background-sub: #151c26;
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

## Set the Active Theme

You can now simply change the data attribute to change theme. This can be done using `document.documentElement.dataset.devieTheme` for example, and can be linked to the business logic of your choice as to what action triggers the theme change.

## Persist Theme on Refresh

If you want a user's theme choice to survive a page refresh, you will need to store it somewhere and restore it early enough to avoid a flash of the default theme.

The tricky part is timing. If your app is fully prebuilt, the server cannot personalize the initial HTML per request. The best static-friendly solution is to store the theme in Local Storage and run a tiny inline script in `layout.tsx` before hydration so the correct attribute is applied as early as possible.

Here are the main options and their trade-offs:

| Approach | Trade-offs |
|---|---|
| **No persistence** | If you don't need to store the theme, the default attribute can be hardcoded on the `<html>` and resets on refresh. You won't have any flash. |
| **Local Storage after hydration** | Simple to set up, but the saved theme is only restored after React runs. This can briefly show the default theme first. |
| **Local Storage + early boot script** | This is what we recommend for static exports. Pages stay prebuilt, the browser restores the attribute before hydration, and theme changes remain fully client-side. |
| **Cookies + SSR** | Useful when the server truly needs to know the theme before sending HTML, but it turns the page into request-time rendering and prevents a pure static export. |
| **DB + SSR** | Similar to cookie-based SSR, except the preference is read from your backend. Useful for authenticated apps that already render dynamically on the server. |

## Example: Implementing a ThemeContext

### Recommended: Static Export + Boot Script

This approach keeps the website fully static while still restoring the user's last selected theme before hydration. The layout injects a tiny boot script, and the ThemeContext keeps the data attribute and Local Storage in sync after the app mounts.

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
  useState,
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

const STORAGE_KEY = "devie-theme";
const DEFAULT_THEME = "theme-default";
const ALLOWED_THEMES = new Set(["theme-default", "theme-dark"]);

function getStoredTheme(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    return storedTheme && ALLOWED_THEMES.has(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
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
```

### When To Choose SSR Instead

If the server needs to know the theme before it renders the page, you will need SSR. That usually makes sense for authenticated apps or other dynamic pages, but it is overkill when the only personalized change is a data attribute on `<html>`.

### Reference

#### ThemeContext Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `defaultTheme` | `string` | `"theme-default"` | The initial theme class name |

#### useTheme() Returns

| Property | Type | Description |
|---|---|---|
| `selectedTheme` | `string` | The currently active theme |
| `setTheme(theme)` | `(string) => void` | Set and persist a new theme |
| `previewTheme(theme)` | `(string) => void` | Preview a theme without persisting |
| `clearPreviewTheme()` | `() => void` | Clear the preview, revert to selected |
| `primaryColor` | `string` | Computed primary color from current theme |

---

*Generated from [devie-ui.com/how-to/manage-multiple-themes](https://devie-ui.com/how-to/manage-multiple-themes)*