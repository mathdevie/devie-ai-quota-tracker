# <Switch />

The Switch component extends [ Base UI's Switch ](https://base-ui.com/react/components/switch) . It provides a toggle control for binary on/off states, commonly used for settings and preferences.

Built on [Base UI](https://base-ui.com/react/components/switch).

## Installation

### switch.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        position: relative;
        box-sizing: border-box;
        display: inline-flex;
        width: 40px;
        height: 24px;
        align-items: center;
        justify-content: flex-start;
        border-radius: 999px;
        border: 1px solid $devie__color__line;
        background-color: $devie__color__background;
        padding: 2px;
        cursor: pointer;
        transition: background-color 150ms ease, border-color 150ms ease;

        &[data-checked] {
            background-color: $devie__color__primary;
            border-color: $devie__color__primary;
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 2px;
        }

        &[data-disabled] {
            cursor: not-allowed;
            border-color: #{devie-disabled-color($devie__color__line)};
            background-color: #{devie-disabled-color($devie__color__background)};

            &[data-checked] {
                background-color: #{devie-disabled-color($devie__color__primary)};
                border-color: #{devie-disabled-color($devie__color__primary)};
            }
        }
    }

    .thumb {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background-color: $devie__color__text-sub;
        box-shadow: $devie__shadow__menu;
        transition: transform 150ms ease, background-color 150ms ease;
        transform: translateX(0);

        [data-checked] & {
            transform: translateX(18px);
            background-color: $devie__color__primary-label;
        }

        [data-disabled] & {
            background-color: #{devie-disabled-color($devie__color__text)};
            box-shadow: none;
        }

        [data-disabled][data-checked] & {
            background-color: #{devie-disabled-color($devie__color__primary-label)};
        }
    }
}
```

### switch.tsx

```tsx
// https://devie-ui.com/components/switch
// https://base-ui.com/react/components/switch

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import clsx from "clsx";
import styles from "./Switch.module.scss";

function Root({ className, ...props }: BaseSwitch.Root.Props) {
  return (
    <BaseSwitch.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Thumb({ className, ...props }: BaseSwitch.Thumb.Props) {
  return (
    <BaseSwitch.Thumb className={clsx(styles.thumb, className)} {...props} />
  );
}

const Switch = {
  Root,
  Thumb,
};

namespace Switch {
  export namespace Root {
    export type Props = BaseSwitch.Root.Props;
    export type State = BaseSwitch.Root.State;
    export type ChangeEventDetails = BaseSwitch.Root.ChangeEventDetails;
  }
  export namespace Thumb {
    export type Props = BaseSwitch.Thumb.Props;
  }
}

export default Switch;
```

## Use Cases

### Simple switch

A basic switch toggle. Use the `defaultChecked` prop for uncontrolled usage, or `checked` with `onCheckedChange` for controlled state management.

```tsx
<Switch.Root defaultChecked>
  <Switch.Thumb />
</Switch.Root>
```

### Disabled switch

Switches can be disabled using the `disabled` prop. When disabled, the switch is not interactive and shows a reduced visual state.

```tsx
<div>
  <Switch.Root disabled>
    <Switch.Thumb />
  </Switch.Root>
  <Switch.Root disabled defaultChecked>
    <Switch.Thumb />
  </Switch.Root>
</div>
```

---

*Generated from [devie-ui.com/components/switch](https://devie-ui.com/components/switch)*