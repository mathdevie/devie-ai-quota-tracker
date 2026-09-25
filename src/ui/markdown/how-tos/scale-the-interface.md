# Scale the interface

Devie UI includes built-in support for interface scaling. It is especially useful for desktop apps, but works in any app and is entirely optional.

## Apply app scaling

Set `--devie__zoom` on `:root` to choose the scale. The default value is `1`.

**layout.module.scss**

```scss
.appRoot {
  isolation: isolate;
  zoom: var(--devie__zoom);
  width: calc(100vw / var(--devie__zoom));
  height: calc(100vh / var(--devie__zoom));
}
```

> We use CSS `zoom` instead of `transform: scale()` to preserve overlay positioning.

## Manage zoom via context

Wrap your app in `ZoomProvider` and use `useZoom()` to read or change the scale.

Place the restore script in the document head to apply the saved value before the page renders.

**ZoomContext.tsx**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "devie-zoom";
const MIN = 0.5;
const MAX = 2;
const STEP = 0.1;

const ZoomContext = createContext<{
  zoom: number;
  setZoom: (zoom: number) => void;
} | null>(null);

function clamp(zoom: number) {
  return Math.min(MAX, Math.max(MIN, Math.round(zoom * 100) / 100));
}

export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoomState] = useState(() => {
    if (typeof window === "undefined") return 1;
    const saved = Number.parseFloat(localStorage.getItem(STORAGE_KEY) ?? "");
    return Number.isFinite(saved) ? clamp(saved) : 1;
  });

  const setZoom = (next: number) => {
    const value = clamp(next);
    localStorage.setItem(STORAGE_KEY, String(value));
    setZoomState(value);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--devie__zoom", String(zoom));
  }, [zoom]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      if (event.key === "=" || event.key === "+") setZoom(zoom + STEP);
      else if (event.key === "-") setZoom(zoom - STEP);
      else if (event.key === "0") setZoom(1);
      else return;
      event.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [zoom]);

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (!context) throw new Error("useZoom needs a ZoomProvider");
  return context;
}
```

**Restore zoom**

```html
<script>
  (function () {
    try {
      var saved = parseFloat(localStorage.getItem("devie-zoom"));
      if (!Number.isFinite(saved)) return;
      var zoom = Math.min(2, Math.max(0.5, Math.round(saved * 100) / 100));
      document.documentElement.style.setProperty("--devie__zoom", String(zoom));
    } catch {}
  })();
</script>
```

---

*Generated from [devie-ui.com/how-to/scale-the-interface](https://devie-ui.com/how-to/scale-the-interface)*