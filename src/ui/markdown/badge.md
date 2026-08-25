# <Badge />

The Badge component is a custom implementation designed to display labels, tags, or status indicators with various visual styles and variants.

## Installation

### badge.tsx

```tsx
// https://devie-ui.com/components/badge

import clsx from "clsx";
import React from "react";
import styles from "./Badge.module.scss";

type BadgeVariant =
  | "primary"
  | "outline"
  | "danger"
  | "success"
  | "warning"
  | "literalGray"
  | "literalBrown"
  | "literalOrange"
  | "literalYellow"
  | "literalGreen"
  | "literalBlue"
  | "literalPurple"
  | "literalPink"
  | "literalRed";

function Badge({
  variant = "outline",
  children,
  className,
  as: Component = "div",
  ...props
}: Badge.Props) {
  const badgeClassName = clsx(
    styles.badge,
    {
      [styles.primary]: variant === "primary",
      [styles.outline]: variant === "outline",
      [styles.danger]: variant === "danger",
      [styles.success]: variant === "success",
      [styles.warning]: variant === "warning",
      [styles.literalGray]: variant === "literalGray",
      [styles.literalBrown]: variant === "literalBrown",
      [styles.literalOrange]: variant === "literalOrange",
      [styles.literalYellow]: variant === "literalYellow",
      [styles.literalGreen]: variant === "literalGreen",
      [styles.literalBlue]: variant === "literalBlue",
      [styles.literalPurple]: variant === "literalPurple",
      [styles.literalPink]: variant === "literalPink",
      [styles.literalRed]: variant === "literalRed",
    },

    className,
  );

  return React.createElement(
    Component,
    {
      className: badgeClassName,
      ...props,
    },
    children,
  );
}

namespace Badge {
  export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
    as?: React.ElementType;
  }
}

export default Badge;
```

### badge.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .badge {
        border-radius: 999px;
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
        width: fit-content;
        font-size: $devie__font-size__normal;
        line-height: 1.5;
        cursor: default;
        font-family: $devie__font-family;
        transition: none;
    }

    .primary {
        background: $devie__color__primary;
        color: $devie__color__primary-label;
        border: 1px solid $devie__color__primary;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__primary)};
                cursor: pointer;
            }
        }
    }

    .outline {
        background: $devie__color__background;
        border: 1px solid $devie__color__line;
        color: $devie__color__text;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__background)};
                cursor: pointer;
            }
        }
    }

    .danger {
        background: $devie__color__danger;
        color: $devie__color__danger-label;
        border: 1px solid $devie__color__danger;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__danger)};
                cursor: pointer;
            }
        }
    }

    .success {
        background: $devie__color__success;
        color: $devie__color__success-label;
        border: 1px solid $devie__color__success;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__success)};
                cursor: pointer;
            }
        }
    }

    .warning {
        background: $devie__color__warning;
        color: $devie__color__warning-label;
        border: 1px solid $devie__color__warning;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__warning)};
                cursor: pointer;
            }
        }
    }

    .literalGray {
        background: $devie__color__literal-gray;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-gray;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-gray)};
                cursor: pointer;
            }
        }
    }

    .literalBrown {
        background: $devie__color__literal-brown;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-brown;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-brown)};
                cursor: pointer;
            }
        }
    }

    .literalOrange {
        background: $devie__color__literal-orange;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-orange;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-orange)};
                cursor: pointer;
            }
        }
    }

    .literalYellow {
        background: $devie__color__literal-yellow;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-yellow;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-yellow)};
                cursor: pointer;
            }
        }
    }

    .literalGreen {
        background: $devie__color__literal-green;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-green;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-green)};
                cursor: pointer;
            }
        }
    }

    .literalBlue {
        background: $devie__color__literal-blue;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-blue;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-blue)};
                cursor: pointer;
            }
        }
    }

    .literalPurple {
        background: $devie__color__literal-purple;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-purple;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-purple)};
                cursor: pointer;
            }
        }
    }

    .literalPink {
        background: $devie__color__literal-pink;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-pink;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-pink)};
                cursor: pointer;
            }
        }
    }

    .literalRed {
        background: $devie__color__literal-red;
        color: #FFFFFF;
        border: 1px solid $devie__color__literal-red;

        a &,
        &[type="button"] {
            &:hover {
                background: #{devie-hover-color($devie__color__literal-red)};
                cursor: pointer;
            }
        }
    }
}
```

## Use Cases

### Badge Variants

Badges come in different variants to convey different meanings: **primary**, **outline**, **danger**, **success**, and **warning**.

```tsx
<div>
  <Badge variant="primary">Primary</Badge>
  <Badge variant="outline">Outline</Badge>
  <Badge variant="danger">Danger</Badge>
  <Badge variant="success">Success</Badge>
  <Badge variant="warning">Warning</Badge>
</div>
```

### Badge with Icons

It's possible to add icons from Lucide or any other icon library to enhance the badge's visual meaning.

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

### Clickable Badges

Badges can be made interactive by wrapping them in an anchor tag or using them as buttons. Hover effects applies automatically when the badge is inside an anchor (<a>) or rendered as a button element.s

```tsx
<a href="/">
  <Badge variant="primary">Clickable Badge (hover me)</Badge>
</a>
```

### Additional Examples

#### Simple

```tsx
<Badge variant="outline">Badge</Badge>
```

---

*Generated from [devie-ui.com/components/badge](https://devie-ui.com/components/badge)*