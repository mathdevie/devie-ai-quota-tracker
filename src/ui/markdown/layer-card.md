# <LayerCard />

The LayerCard is a custom component that provides a layered surface for grouping content. This structural element is quite versatile, and it offers a minimal abstraction: an outer shell that holds the inner card(s), with an adjusted border radius.

## Installation

### layer-card.tsx

```tsx
// https://devie-ui.com/components/layer-card

import clsx from "clsx";
import type React from "react";
import styles from "./LayerCard.module.scss";

function Root({ className, children, ...props }: LayerCard.Root.Props) {
  return (
    <div className={clsx(styles.root, className)} {...props}>
      {children}
    </div>
  );
}

function Inner({ className, children, ...props }: LayerCard.Inner.Props) {
  return (
    <div className={clsx(styles.inner, className)} {...props}>
      {children}
    </div>
  );
}

const LayerCard = {
  Root,
  Inner,
};

namespace LayerCard {
  export namespace Root {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Inner {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default LayerCard;
```

### layer-card.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        background-color: $devie__color__background-sub;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius-strong;
        padding: $devie__spacing__x05;
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x05;
        box-sizing: border-box;
    }

    .inner {
        background-color: $devie__color__background;
        border: 1px solid $devie__color__line;
        border-radius: calc($devie__radius-strong - $devie__spacing__x05);
        overflow: hidden;
        box-sizing: border-box;
    }
}
```

## Use Cases

### Single inner card

The most common pattern: one `LayerCard.Inner` floats on the shell. Use it for any standalone surface that benefits from the layered look (a tabs surface, a hero panel, a stats block).

```tsx
<LayerCard.Root>
  <LayerCard.Inner>
    {/* Your content goes here */}
  </LayerCard.Inner>
</LayerCard.Root>
```

### Multiple inner cards

Stack several `LayerCard.Inner` siblings inside one `LayerCard.Root`. The vertical gap between cards matches the outer padding, giving the recognizable floating rhythm. Useful for feature lists or grouped panels that share a surface.

```tsx
<LayerCard.Root>
  <LayerCard.Inner>
    {/* First card */}
  </LayerCard.Inner>
  <LayerCard.Inner>
    {/* Second card */}
  </LayerCard.Inner>
</LayerCard.Root>
```

### Title above the inner card

Bare children are allowed. Put a small label or title as a direct child of `LayerCard.Root` so it sits on the gray shell, then wrap the actual content in `LayerCard.Inner`. The title reads as a section label that owns the card below it.

```tsx
<LayerCard.Root>
  {/* Bare title sits directly on the shell */}
  <div>Recent activity</div>

  <LayerCard.Inner>
    {/* List of items */}
  </LayerCard.Inner>
</LayerCard.Root>
```

### Helper text below the inner card

Mirror image of the previous pattern. Put your form, list, or main content inside `LayerCard.Inner`, then add a bare paragraph below it for helper text or a secondary call to action. Classic example: a sign-in form with a "No account? Sign up" link anchored to the shell.

```tsx
<LayerCard.Root>
  <LayerCard.Inner>
    {/* Sign-in form goes here */}
  </LayerCard.Inner>

  {/* Bare helper text sits directly on the shell, below the card */}
  <div>
    No account? <a href="#">Sign up</a>
  </div>
</LayerCard.Root>
```

---

*Generated from [devie-ui.com/components/layer-card](https://devie-ui.com/components/layer-card)*