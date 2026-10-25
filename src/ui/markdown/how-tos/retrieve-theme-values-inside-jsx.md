# Get values in JSX

Devie UI themes are CSS variables. Use the tokens in CSS whenever possible, and read them in JavaScript only when you need the actual value.

## Simple Version

Read a CSS variable with `getComputedStyle` at the moment you need it, for example in an event handler:

**Using getComputedStyle**

```tsx
function readToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

function handleExport() {
  const primary = readToken("--devie__color__primary");
  exportChart({ color: primary });
}
```

## useThemeColor Hook

To render the values and update them when the user switches themes, use a hook that reads the tokens and subscribes to theme changes.

**hooks/useThemeColor.ts**

```ts
import { useSyncExternalStore } from "react";

export interface ThemeColors {
  text: string | null;
  textSub: string | null;
  line: string | null;
  background: string | null;
  backgroundSunken: string | null;
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
  backgroundSunken: "--devie__color__background-sunken",
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

const KEYS = Object.keys(CSS_VARIABLES) as (keyof ThemeColors)[];

const NULL_COLORS = {} as ThemeColors;
for (const key of KEYS) NULL_COLORS[key] = null;

const WATCHED_ATTRIBUTES = [
  "data-devie-theme",
  "data-desktop-preview",
  "data-desktop-appearance",
];

const COLOR_VALUE = /^(#|rgb|hsl|oklch|oklab|color\()/i;

let snapshot = NULL_COLORS;
let stopWatching: (() => void) | null = null;
const listeners = new Set<() => void>();

function readThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  const colors = { ...NULL_COLORS };
  let probe: HTMLSpanElement | null = null;

  for (const key of KEYS) {
    const value = style.getPropertyValue(CSS_VARIABLES[key]).trim();
    if (!value || COLOR_VALUE.test(value)) {
      colors[key] = value || null;
      continue;
    }
    // light-dark() and keywords such as AccentColor only resolve on an element.
    probe ??= document.body.appendChild(document.createElement("span"));
    probe.style.color = value;
    colors[key] = getComputedStyle(probe).color || value;
  }

  probe?.remove();
  return colors;
}

function refresh() {
  const next = readThemeColors();
  if (KEYS.some((key) => next[key] !== snapshot[key])) snapshot = next;
}

function notify() {
  refresh();
  for (const listener of listeners) listener();
}

function watchTheme(): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: WATCHED_ATTRIBUTES,
  });
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", notify);

  return () => {
    observer.disconnect();
    scheme.removeEventListener("change", notify);
  };
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    refresh();
    stopWatching = watchTheme();
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopWatching?.();
      stopWatching = null;
    }
  };
}

function getSnapshot(): ThemeColors {
  return snapshot;
}

function getServerSnapshot(): ThemeColors {
  return NULL_COLORS;
}

export function useThemeColor(): ThemeColors {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

---

*Generated from [devie-ui.com/how-to/retrieve-theme-values-inside-jsx](https://devie-ui.com/how-to/retrieve-theme-values-inside-jsx)*