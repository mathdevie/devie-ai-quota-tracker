# <Kbd />

A component that shows keyboard keys and shortcuts. This is a custom component with no Base UI primitive. Devie adds the `Kbd.Root` and [Kbd.Group](#combinations) subcomponents and a [variant](#variants) prop on `Kbd.Root`.

## Installation

### Kbd.tsx

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

    export interface Props extends React.ComponentProps<"kbd"> {
      variant?: Variant;
    }
  }
  export namespace Group {
    export type Props = React.ComponentProps<"kbd">;
  }
}

export default Kbd;
```

### Kbd.module.scss

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
        font-weight: 500;
        line-height: $devie__spacing__x2;
        height: $devie__spacing__x2;
        color: $devie__color__text-sub;
    }

    .badge {
        padding: 0 $devie__spacing__x1;
        background-color: $devie__color__background-sunken;
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

Set `variant` on `Kbd.Root` to `badge` or `naked`. The default is `badge`; use `naked` for text-only keys in dense lists and menus.

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