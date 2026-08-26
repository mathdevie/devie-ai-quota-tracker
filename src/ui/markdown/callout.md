# <Callout />

The Callout component is ideal for providing contextual messages within sections of your interface. It supports different variants to convey different types of information: **success**, **danger**, **warning**, **primary**, and **sub**.

The component uses a compound pattern with `Callout.Icon` and `Callout.Content` subcomponents, allowing you to customize the icon or omit it entirely.

## Installation

### callout.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: $devie__spacing__x1;
        padding: $devie__spacing__x2;
        border-radius: $devie__radius;
        border-width: 1px;
        border-style: solid;
    }

    .icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: $devie__spacing__x05;

        svg {
            width: 16px;
            height: 16px;
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
        flex: 1;
        min-width: 0;
    }

    .title {
        font-size: $devie__font-size__normal;
        font-weight: 600;
        line-height: $devie__spacing__x3;
    }

    .text {
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x3;
    }

    .variantSuccess {
        background-color: color-mix(in srgb, $devie__color__success 5%, $devie__color__background 95%);
        border-color: $devie__color__success;

        .icon {
            color: $devie__color__success;
        }

        .title,
        .text {
            color: color-mix(in srgb, $devie__color__success 20%, $devie__color__text 80%);
        }
    }

    .variantDanger {
        background-color: color-mix(in srgb, $devie__color__danger 5%, $devie__color__background 95%);
        border-color: $devie__color__danger;

        .icon {
            color: $devie__color__danger;
        }

        .title,
        .text {
            color: color-mix(in srgb, $devie__color__danger 20%, $devie__color__text 80%);
        }
    }

    .variantWarning {
        background-color: color-mix(in srgb, $devie__color__warning 5%, $devie__color__background 95%);
        border-color: $devie__color__warning;

        .icon {
            color: $devie__color__warning;
        }

        .title,
        .text {
            color: color-mix(in srgb, $devie__color__warning 20%, $devie__color__text 80%);
        }
    }

    .variantPrimary {
        background-color: color-mix(in srgb, $devie__color__primary 5%, $devie__color__background 95%);
        border-color: $devie__color__primary;

        .icon {
            color: $devie__color__primary;
        }

        .title,
        .text {
            color: color-mix(in srgb, $devie__color__primary 20%, $devie__color__text 80%);
        }
    }

    .variantSub {
        background-color: $devie__color__background-sub;
        border-color: $devie__color__line;

        .icon {
            color: $devie__color__text-sub;
        }

        .title,
        .text {
            color: $devie__color__text-sub;
        }
    }
}
```

### callout.tsx

```tsx
// https://devie-ui.com/components/callout

"use client";

import clsx from "clsx";
import type React from "react";
import styles from "./Callout.module.scss";

type Variant = "success" | "danger" | "warning" | "primary" | "sub";

function Root({
  variant = "success",
  children,
  className,
  ...props
}: Callout.Root.Props) {
  return (
    <div
      className={clsx(
        styles.container,
        variant === "success" && styles.variantSuccess,
        variant === "danger" && styles.variantDanger,
        variant === "warning" && styles.variantWarning,
        variant === "primary" && styles.variantPrimary,
        variant === "sub" && styles.variantSub,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Icon({ children }: Callout.Icon.Props) {
  return <div className={styles.icon}>{children}</div>;
}

function Content({ title, children }: Callout.Content.Props) {
  return (
    <div className={styles.content}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.text}>{children}</div>
    </div>
  );
}

const Callout = {
  Root,
  Icon,
  Content,
};

namespace Callout {
  export namespace Root {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      variant?: Variant;
      children: React.ReactNode;
    }
  }
  export namespace Icon {
    export interface Props {
      children: React.ReactElement;
    }
  }
  export namespace Content {
    export interface Props {
      title?: string;
      children: React.ReactNode;
    }
  }
}

export default Callout;
```

## Use Cases

### Callout Variants

Callouts come in five variants: success, danger, warning, primary, and sub. Each variant has distinct colors suitable for different types of messaging.

```tsx
<div>
  <Callout.Root variant="success">
    <Callout.Icon>
      <CheckCircle />
    </Callout.Icon>
    <Callout.Content title="Success">
      This is a success message with important information.
    </Callout.Content>
  </Callout.Root>

  <Callout.Root variant="danger">
    <Callout.Icon>
      <AlertCircle />
    </Callout.Icon>
    <Callout.Content title="Danger">
      This is a danger message with important information.
    </Callout.Content>
  </Callout.Root>

  <Callout.Root variant="warning">
    <Callout.Icon>
      <AlertTriangle />
    </Callout.Icon>
    <Callout.Content title="Warning">
      This is a warning message with important information.
    </Callout.Content>
  </Callout.Root>

  <Callout.Root variant="primary">
    <Callout.Icon>
      <Info />
    </Callout.Icon>
    <Callout.Content title="Primary">
      This is a primary message with important information.
    </Callout.Content>
  </Callout.Root>

  <Callout.Root variant="sub">
    <Callout.Icon>
      <MessageCircle />
    </Callout.Icon>
    <Callout.Content title="Sub">
      This is a sub message with less emphasis.
    </Callout.Content>
  </Callout.Root>
</div>
```

---

*Generated from [devie-ui.com/components/callout](https://devie-ui.com/components/callout)*