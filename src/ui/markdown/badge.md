# <Badge />

A tinted chip for a label, a tag, or a status. This is a custom component with no Base UI primitive. The `variant` prop sets the tone, and `render` replaces the rendered element.

## Installation

### Badge.tsx

```tsx
// https://devie-ui.com/components/badge

import { useRender } from "@base-ui/react/use-render";
import clsx from "clsx";
import styles from "./Badge.module.scss";

type BadgeVariant =
  | "primary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "literal-gray"
  | "literal-brown"
  | "literal-orange"
  | "literal-yellow"
  | "literal-green"
  | "literal-blue"
  | "literal-purple"
  | "literal-pink"
  | "literal-red";

const variantClassNames: Record<BadgeVariant, string> = {
  primary: styles.primary,
  outline: styles.outline,
  danger: styles.danger,
  success: styles.success,
  warning: styles.warning,
  "literal-gray": styles.literalGray,
  "literal-brown": styles.literalBrown,
  "literal-orange": styles.literalOrange,
  "literal-yellow": styles.literalYellow,
  "literal-green": styles.literalGreen,
  "literal-blue": styles.literalBlue,
  "literal-purple": styles.literalPurple,
  "literal-pink": styles.literalPink,
  "literal-red": styles.literalRed,
};

function Badge({
  variant = "outline",
  className,
  render,
  ...props
}: Badge.Props) {
  return useRender({
    defaultTagName: "div",
    render,
    props: {
      ...props,
      className: clsx(styles.badge, variantClassNames[variant], className),
    },
  });
}

namespace Badge {
  export type Variant = BadgeVariant;
  export interface Props extends useRender.ComponentProps<"div"> {
    variant?: Variant;
  }
}

export default Badge;
```

### Badge.module.scss

```scss
@use './_devie.scss' as *;

$badge-literal-colors: (
    literalGray: $devie__color__literal-gray,
    literalBrown: $devie__color__literal-brown,
    literalOrange: $devie__color__literal-orange,
    literalYellow: $devie__color__literal-yellow,
    literalGreen: $devie__color__literal-green,
    literalBlue: $devie__color__literal-blue,
    literalPurple: $devie__color__literal-purple,
    literalPink: $devie__color__literal-pink,
    literalRed: $devie__color__literal-red,
);

@layer devie {
    .badge {
        border-radius: calc($devie__radius / 2);
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        width: fit-content;
        font-size: $devie__font-size__small;
        font-weight: 500;
        line-height: $devie__spacing__x2;
        font-family: $devie__font-family;
        transition: none;
        background: color-mix(in srgb, var(--badge-tone) 13%, $devie__color__background);
        color: var(--badge-color, var(--badge-tone));
        border: 1px solid color-mix(in srgb, var(--badge-tone) 22%, $devie__color__background);

        a &,
        &[type="button"] {
            &:hover {
                background: color-mix(in srgb, var(--badge-tone) 18%, $devie__color__background);
            }
        }
    }

    .primary {
        --badge-tone: #{$devie__color__primary};
    }

    .outline {
        --badge-tone: #{$devie__color__text-sub};
        --badge-color: #{$devie__color__text};
    }

    .danger {
        --badge-tone: #{$devie__color__danger};
    }

    .success {
        --badge-tone: #{$devie__color__success};
    }

    .warning {
        --badge-tone: #{$devie__color__warning};
    }

    @each $name, $color in $badge-literal-colors {
        .#{$name} {
            --badge-tone: #{$color};
        }
    }
}
```

## Use Cases

### Variants

Set `variant` to `primary`, `outline`, `danger`, `success`, `warning`, or one of the literal colors such as `literal-blue`.

```tsx
<div>
  <Badge variant="primary">Primary</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="danger">Danger</Badge>
  <Badge variant="success">Success</Badge>
  <Badge variant="warning">Warning</Badge>
</div>
```

### With icons

Place an icon before the label.

```tsx
<div>
  <Badge variant="primary">
    <Check size={16} strokeWidth={2} />
    Completed
  </Badge>
  <Badge variant="success">
    <Star size={16} strokeWidth={2} />
    Featured
  </Badge>
</div>
```

### Clickable badges

Wrap the badge in an anchor, or pass a `<button type="button" />` element to `render`. The hover style applies in both cases.

```tsx
<a href="/">
  <Badge variant="primary">Clickable Badge (hover me)</Badge>
</a>
```

---

*Generated from [devie-ui.com/components/badge](https://devie-ui.com/components/badge)*