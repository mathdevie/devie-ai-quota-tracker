# <Checkbox />

The Checkbox component extends [ Base UI's Checkbox ](https://base-ui.com/react/components/checkbox) . It's a simple component for binary or tri-state selection, supporting checked, unchecked, and indeterminate states.

Built on [Base UI](https://base-ui.com/react/components/checkbox).

## Installation

### checkbox.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        box-sizing: border-box;
        display: flex;
        width: 1.25rem;
        height: 1.25rem;
        align-items: center;
        justify-content: center;
        border-radius: $devie__radius;
        outline: 0;
        padding: 0;
        margin: 0;
        border: none;
        cursor: pointer;
        transition: none;

        &[data-unchecked] {
            border: 1px solid $devie__color__line;
            background-color: $devie__color__background;
        }

        &[data-checked] {
            background-color: $devie__color__primary;
            border: 1px solid $devie__color__primary;
        }

        &[data-indeterminate] {
            background-color: $devie__color__primary;
            border: 1px solid $devie__color__primary;
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 1px;
        }

        &:hover:not([data-disabled]) {
            &[data-unchecked] {
                border-color: $devie__color__primary
            }

            &[data-checked] {
                background-color: #{devie-hover-color($devie__color__primary)};
            }

            &[data-indeterminate] {
                background-color: #{devie-hover-color($devie__color__primary)};
            }
        }

        &[data-disabled] {
            cursor: not-allowed;

            &[data-unchecked] {
                border-color: #{devie-disabled-color($devie__color__line)};
                background-color: #{devie-disabled-color($devie__color__background)};
            }

            &[data-checked] {
                background-color: #{devie-disabled-color($devie__color__primary)};
                border-color: #{devie-disabled-color($devie__color__line)};
            }

            &[data-indeterminate] {
                background-color: #{devie-disabled-color($devie__color__primary)};
                border-color: #{devie-disabled-color($devie__color__line)};
            }
        }
    }

    .indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        color: $devie__color__primary-label;

        &[data-unchecked] {
            display: none;
        }

        &[data-disabled] {
            color: #{devie-disabled-color($devie__color__primary-label)};
        }
    }

    .icon {
        width: 0.75rem;
        height: 0.75rem;
        flex-shrink: 0;
    }

    .checkIcon {
        [data-indeterminate] & {
            display: none;
        }
    }

    .indeterminateIcon {
        [data-checked] & {
            display: none;
        }

        [data-unchecked] & {
            display: none;
        }
    }
}
```

### checkbox.tsx

```tsx
// https://devie-ui.com/components/checkbox
// https://base-ui.com/react/components/checkbox

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import styles from "./Checkbox.module.scss";

function Root({ className, ...props }: BaseCheckbox.Root.Props) {
  return (
    <BaseCheckbox.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Indicator({
  className,
  children,
  ...props
}: BaseCheckbox.Indicator.Props) {
  return (
    <BaseCheckbox.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    >
      {children || (
        <>
          <Check
            className={clsx(styles.icon, styles.checkIcon)}
            strokeWidth={2.5}
          />
          <Minus
            className={clsx(styles.icon, styles.indeterminateIcon)}
            strokeWidth={2.5}
          />
        </>
      )}
    </BaseCheckbox.Indicator>
  );
}

const Checkbox = {
  Root,
  Indicator,
};

namespace Checkbox {
  export namespace Root {
    export type Props = BaseCheckbox.Root.Props;
    export type State = BaseCheckbox.Root.State;
    export type ChangeEventDetails = BaseCheckbox.Root.ChangeEventDetails;
  }
  export namespace Indicator {
    export type Props = BaseCheckbox.Indicator.Props;
  }
}

export default Checkbox;
```

## Use Cases

### Simple Label

Wrap the checkbox in a `label` element to make the entire area clickable and improve accessibility.

```tsx
<label>
  <Checkbox.Root defaultChecked>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Accept terms and conditions
</label>
```

### Checkbox in a Form

Combine with `Field` to create accessible form checkboxes with labels, descriptions, and validation support.

```tsx
<Form>
  <Field.Root name="stayLoggedIn">
    <Field.Label>
      <Checkbox.Root>
        <Checkbox.Indicator />
      </Checkbox.Root>
      Stay logged in for 7 days
    </Field.Label>
  </Field.Root>
</Form>
```

### Checkbox States

The checkbox supports unchecked, checked, indeterminate, and disabled states. The indeterminate state is useful for "select all" scenarios.

```tsx
<label>
  <Checkbox.Root>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Unchecked
</label>

<label>
  <Checkbox.Root defaultChecked>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Checked
</label>

<label>
  <Checkbox.Root indeterminate>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Indeterminate
</label>

<label>
  <Checkbox.Root disabled>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Disabled
</label>

<label>
  <Checkbox.Root disabled defaultChecked>
    <Checkbox.Indicator />
  </Checkbox.Root>
  Disabled checked
</label>
```

---

*Generated from [devie-ui.com/components/checkbox](https://devie-ui.com/components/checkbox)*