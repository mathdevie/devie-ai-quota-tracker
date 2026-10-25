# <Callout />

A contextual message block for a section of the interface. This is a custom component with no Base UI primitive. Devie adds the `Callout.Icon` and `Callout.Content` subcomponents, a [variant](#variants) prop on `Callout.Root`, and a [title](#simple) prop on `Callout.Content`.

## Installation

### Callout.tsx

```tsx
// https://devie-ui.com/components/callout

import clsx from "clsx";
import type React from "react";
import styles from "./Callout.module.scss";

type CalloutVariant = "success" | "danger" | "warning" | "primary" | "sub";

function Root({
  variant = "sub",
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

function Icon({ className, ...props }: Callout.Icon.Props) {
  return <div className={clsx(styles.icon, className)} {...props} />;
}

function Content({
  title,
  children,
  className,
  ...props
}: Callout.Content.Props) {
  return (
    <div className={clsx(styles.content, className)} {...props}>
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
  export type Variant = CalloutVariant;
  export namespace Root {
    export interface Props extends React.ComponentProps<"div"> {
      variant?: Variant;
      children: React.ReactNode;
    }
  }
  export namespace Icon {
    export interface Props extends React.ComponentProps<"div"> {
      children: React.ReactElement;
    }
  }
  export namespace Content {
    export interface Props extends Omit<React.ComponentProps<"div">, "title"> {
      title?: React.ReactNode;
      children: React.ReactNode;
    }
  }
}

export default Callout;
```

### Callout.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .container {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: $devie__spacing__x1;
        padding: calc($devie__spacing__x2 - 1px);
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
        background-color: $devie__color__background-sunken;
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

## Use Cases

### Simple callout

Pass `title` to `Callout.Content` to show a heading above the text. `Callout.Icon` is optional.

```tsx
<Callout.Root>
  <Callout.Icon>
    <Info />
  </Callout.Icon>
  <Callout.Content title="Scheduled maintenance">
    The workspace is read-only on Sunday from 02:00 to 03:00 UTC.
  </Callout.Content>
</Callout.Root>

<Callout.Root>
  <Callout.Content>
    Invited members join with the Viewer role.
  </Callout.Content>
</Callout.Root>
```

### Variants

Set `variant` on `Callout.Root` to `success`, `danger`, `warning`, `primary`, or `sub`. The default is `sub`.

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