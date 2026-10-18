# <LayerCard />

A card that floats on a shell with a matching corner radius. This is a custom component with no Base UI primitive. `LayerCard.Root` is a shell, and `LayerCard.Inner` is a card that floats on it with a matching corner radius.

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
        background-color: $devie__color__background-sunken;
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

Put one `LayerCard.Inner` inside `LayerCard.Root`.

```tsx
<LayerCard.Root>
  <LayerCard.Inner>
    {/* Your content goes here */}
  </LayerCard.Inner>
</LayerCard.Root>
```

### Multiple inner cards

Stack several `LayerCard.Inner` inside one `LayerCard.Root`. The gap between cards equals the shell padding.

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

Bare children are allowed. Put a title as a direct child of `LayerCard.Root`, then wrap the content in `LayerCard.Inner`.

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

Put the content in `LayerCard.Inner`, then add a bare paragraph below it for helper text or a secondary link.

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