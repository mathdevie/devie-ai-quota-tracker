# <Kbd />

Single keys

Combinations

Use **Kbd** to show keyboard keys and shortcuts inside your UI. A single key uses `Kbd.Root`; chord shortcuts are wrapped in `Kbd.Group` so multiple keys read as one unit (nested `<kbd>` is valid HTML for key combinations). Use `Kbd` for standalone keyboard hints in docs, toolbars, and footers. The default `badge` variant adds a subtle frame; `naked` is text-only. This component is not part of Base UI.

## Installation

### kbd.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        font-family: $devie__font-family;
        font-size: $devie__font-size__small;
        line-height: 1.2;
        color: $devie__color__text-sub;
    }

    .badge {
        min-height: 1.375rem;
        padding: 0 $devie__spacing__x1;
        font-weight: 500;
        background-color: $devie__color__background-sub;
        border: 1px solid $devie__color__line;
        border-radius: calc($devie__radius - 2px);
    }

    .naked {
        padding: 0;
        font-weight: 400;
        background: none;
        border: none;
        border-radius: 0;
    }

    .group {
        display: inline-flex;
        align-items: center;
        gap: $devie__spacing__x05;
        padding: 0;
        margin: 0;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        background: none;
        border: none;
        border-radius: 0;
        box-shadow: none;
    }
}
```

### kbd.tsx

```tsx
// https://devie-ui.com/components/kbd

import clsx from "clsx";
import type React from "react";
import styles from "./Kbd.module.scss";

function Root({ className, variant = "badge", ...props }: Kbd.Root.Props) {
  return (
    <kbd
      className={clsx(
        styles.root,
        variant === "naked" ? styles.naked : styles.badge,
        className,
      )}
      {...props}
    />
  );
}

function Group({ className, ...props }: Kbd.Group.Props) {
  return <kbd className={clsx(styles.group, className)} {...props} />;
}

const Kbd = {
  Root,
  Group,
};

namespace Kbd {
  export namespace Root {
    export type Variant = "badge" | "naked";

    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
      variant?: Variant;
    }
  }
  export namespace Group {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
}

export default Kbd;
```

## Use Cases

### Single keys

One glyph or label per `Kbd.Root`, including symbols like ⌘ and word keys such as **Shift**.

```tsx
<Kbd.Root>K</Kbd.Root>
<Kbd.Root>⌘</Kbd.Root>
<Kbd.Root>⌃</Kbd.Root>
<Kbd.Root>⇧</Kbd.Root>
```

### Variants

`variant="badge"` (default) adds a subtle frame suited to docs and toolbars. `variant="naked"` is text-only, which works better in dense lists and menus.

```tsx
<Kbd.Root>⌘K</Kbd.Root>

<Kbd.Root variant="naked">⌘K</Kbd.Root>
```

### Key combinations

Wrap several `Kbd.Root` elements in `Kbd.Group` for shortcuts that are pressed together.

```tsx
<Kbd.Group>
  <Kbd.Root>⌘</Kbd.Root>
  <Kbd.Root>K</Kbd.Root>
</Kbd.Group>

<Kbd.Group>
  <Kbd.Root>Ctrl</Kbd.Root>
  <Kbd.Root>Alt</Kbd.Root>
  <Kbd.Root>Delete</Kbd.Root>
</Kbd.Group>
```

---

*Generated from [devie-ui.com/components/kbd](https://devie-ui.com/components/kbd)*