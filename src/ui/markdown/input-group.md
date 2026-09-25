# <InputGroup />

A component that joins an input with buttons and addons into one control. This is a custom component with no Base UI primitive. It joins an [Input](/components/input) with [Button](/components/button) elements and `InputGroup.Addon` labels into one control.

## Installation

### input-group.tsx

```tsx
// https://devie-ui.com/components/input-group

import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./InputGroup.module.scss";

function Root({ className, ...props }: InputGroup.Root.Props) {
  return <div className={clsx(styles.root, className)} {...props} />;
}

function Addon({ className, ...props }: InputGroup.Addon.Props) {
  return <span className={clsx(styles.addon, className)} {...props} />;
}

const InputGroup = {
  Root,
  Addon,
};

namespace InputGroup {
  export namespace Root {
    export interface Props extends ComponentProps<"div"> {
      className?: string;
    }
  }
  export namespace Addon {
    export interface Props extends ComponentProps<"span"> {
      className?: string;
    }
  }
}

export default InputGroup;
```

### input-group.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        align-items: stretch;
        width: 100%;
        isolation: isolate;

        // :nth-child(n) outranks the child's own radius and height rules
        > :nth-child(n) {
            position: relative;
            height: auto;
            border-radius: 0;

            &:not(:focus-visible) {
                outline-offset: -1px;
            }

            &:focus-visible {
                z-index: 1;
            }
        }

        > input {
            flex: 1 1 auto;
            min-width: 0;
            width: auto;
        }

        > :first-child {
            border-top-left-radius: $devie__radius;
            border-bottom-left-radius: $devie__radius;
        }

        > :last-child {
            border-top-right-radius: $devie__radius;
            border-bottom-right-radius: $devie__radius;
        }

        > :not(:last-child) {
            border-right-width: 0;
        }

        > button + * {
            border-left-width: 0;
        }

        > button + button {
            margin-inline-start: -1px;
        }
    }

    .addon {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 0 $devie__spacing__x1;
        border: 1px solid $devie__color__line;
        background-color: $devie__color__background-sunken;
        color: $devie__color__text-sub;
        font-size: $devie__font-size__small;
        white-space: nowrap;
    }
}
```

## Use Cases

### Simple input group

Place an `Input` and a `Button` inside `InputGroup.Root`. The input fills the remaining width.

Use the `secondary` or `icon-secondary` button variant. The `primary` ring does not align with the input border.

```tsx
<InputGroup.Root>
  <Input type="email" placeholder="you@example.com" />
  <Button variant="secondary">Subscribe</Button>
</InputGroup.Root>

<InputGroup.Root>
  <Input placeholder="Search issues" />
  <Button variant="secondary">Search</Button>
</InputGroup.Root>
```

### With addons

Use `InputGroup.Addon` for a static prefix or suffix such as a protocol or a unit.

```tsx
<InputGroup.Root>
  <InputGroup.Addon>https://</InputGroup.Addon>
  <Input placeholder="devie-ui.com" />
</InputGroup.Root>

<InputGroup.Root>
  <Input type="number" placeholder="0.00" />
  <InputGroup.Addon>USD</InputGroup.Addon>
</InputGroup.Root>
```

### With Field

Put `InputGroup.Root` inside `Field.Root`. The label and the validation attach to the `Input` as usual.

```tsx
<Field.Root>
  <Field.Label>API key</Field.Label>
  <InputGroup.Root>
    <Input readOnly defaultValue="example-api-key" />
    <Button variant="icon-secondary" aria-label="Copy API key">
      <Copy size={16} />
    </Button>
  </InputGroup.Root>
  <Field.Description>Keep this key secret.</Field.Description>
</Field.Root>
```

---

*Generated from [devie-ui.com/components/input-group](https://devie-ui.com/components/input-group)*