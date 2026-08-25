# Retrieve Theme Values Inside JSX

Devie UI themes are powered by CSS variables. Most of the time you should use those tokens directly in CSS. But sometimes you need the actual value in JavaScript. Here's how you can do it.

## Simple Version

You can read a CSS variable within React with `getComputedStyle` inside an effect:

**Using getComputedStyle**

```tsx
useEffect(() => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--devie__color__primary")
    .trim();

  setPrimary(value || null);
}, []);
}
```

## useThemeColor Hook

If you need these values in multiple places (or you need them to update when the user switches themes), it's worth extracting a hook that reads the tokens and subscribes to theme changes.

**hooks/useThemeColor.ts**

```ts
import { useSyncExternalStore } from "react";

export interface ThemeColors {
  text: string | null;
  textSub: string | null;
  line: string | null;
  background: string | null;
  backgroundSub: string | null;
  primary: string | null;
  primaryLabel: string | null;
  danger: string | null;
  dangerLabel: string | null;
  success: string | null;
  successLabel: string | null;
  warning: string | null;
  warningLabel: string | null;
  literalGray: string | null;
  literalBrown: string | null;
  literalOrange: string | null;
  literalYellow: string | null;
  literalGreen: string | null;
  literalBlue: string | null;
  literalPurple: string | null;
  literalPink: string | null;
  literalRed: string | null;
}

const CSS_VARIABLES: Record<keyof ThemeColors, string> = {
  text: "--devie__color__text",
  textSub: "--devie__color__text-sub",
  line: "--devie__color__line",
  background: "--devie__color__background",
  backgroundSub: "--devie__color__background-sub",
  primary: "--devie__color__primary",
  primaryLabel: "--devie__color__primary-label",
  danger: "--devie__color__danger",
  dangerLabel: "--devie__color__danger-label",
  success: "--devie__color__success",
  successLabel: "--devie__color__success-label",
  warning: "--devie__color__warning",
  warningLabel: "--devie__color__warning-label",
  literalGray: "--devie__color__literal-gray",
  literalBrown: "--devie__color__literal-brown",
  literalOrange: "--devie__color__literal-orange",
  literalYellow: "--devie__color__literal-yellow",
  literalGreen: "--devie__color__literal-green",
  literalBlue: "--devie__color__literal-blue",
  literalPurple: "--devie__color__literal-purple",
  literalPink: "--devie__color__literal-pink",
  literalRed: "--devie__color__literal-red",
};

const NULL_COLORS: ThemeColors = {
  text: null,
  textSub: null,
  line: null,
  background: null,
  backgroundSub: null,
  primary: null,
  primaryLabel: null,
  danger: null,
  dangerLabel: null,
  success: null,
  successLabel: null,
  warning: null,
  warningLabel: null,
  literalGray: null,
  literalBrown: null,
  literalOrange: null,
  literalYellow: null,
  literalGreen: null,
  literalBlue: null,
  literalPurple: null,
  literalPink: null,
  literalRed: null,
};

// Cache the snapshot so we don't allocate a new object if nothing changed
let cachedSnapshot: ThemeColors = NULL_COLORS;
let cachedSnapshotHash = "";

function computeThemeColors(): ThemeColors {
  if (typeof document === "undefined") return NULL_COLORS;

  const computedStyle = getComputedStyle(document.documentElement);
  const colors: Partial<ThemeColors> = {};

  for (const [key, cssVar] of Object.entries(CSS_VARIABLES)) {
    const value = computedStyle.getPropertyValue(cssVar).trim();
    colors[key as keyof ThemeColors] = value || null;
  }

  return colors as ThemeColors;
}

function getThemeColorsSnapshot(): ThemeColors {
  if (typeof document === "undefined") return NULL_COLORS;

  const newColors = computeThemeColors();
  const hash = JSON.stringify(newColors);

  if (cachedSnapshotHash === hash) {
    return cachedSnapshot;
  }

  cachedSnapshot = newColors;
  cachedSnapshotHash = hash;
  return newColors;
}

function subscribeToThemeChanges(callback: () => void): () => void {
  if (typeof document === "undefined") return () => {};

  // Devie UI switches themes by swapping a CSS class on <html>.
  // If your app uses a different mechanism (e.g. data-theme attribute),
  // update this observer accordingly.
  const observer = new MutationObserver(() => {
    cachedSnapshot = NULL_COLORS;
    cachedSnapshotHash = "";
    callback();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

export function useThemeColor(): ThemeColors {
  return useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeColorsSnapshot,
    () => NULL_COLORS,
  );
}
```

---

*Generated from [devie-ui.com/how-to/retrieve-theme-values-inside-jsx](https://devie-ui.com/how-to/retrieve-theme-values-inside-jsx)*