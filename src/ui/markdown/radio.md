# <Radio />

The Radio component extends [ Base UI's Radio ](https://base-ui.com/react/components/radio) . Radio buttons allow users to select a single option from a set of mutually exclusive choices. The `RadioGroup` component provides shared state management for a series of radio buttons.

Built on [Base UI](https://base-ui.com/react/components/radio).

## Installation

### radio-group.tsx

```tsx
// https://devie-ui.com/components/radio-group
// https://base-ui.com/react/components/radio-group

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import clsx from "clsx";
import styles from "./RadioGroup.module.scss";

function RadioGroup({ className, ...props }: BaseRadioGroup.Props) {
  return <BaseRadioGroup className={clsx(styles.root, className)} {...props} />;
}

namespace RadioGroup {
  export type Props = BaseRadioGroup.Props;
  export type State = BaseRadioGroup.State;
  export type ChangeEventDetails = BaseRadioGroup.ChangeEventDetails;
}

export default RadioGroup;
```

### radio.module.scss

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
        border-radius: 50%;
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

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 2px;
        }

        &:hover:not([data-disabled]) {
            &[data-unchecked] {
                border-color: $devie__color__primary;
            }

            &[data-checked] {
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
                border-color: #{devie-disabled-color($devie__color__primary)};
            }
        }
    }

    .indicator {
        display: flex;
        align-items: center;
        justify-content: center;

        &[data-unchecked] {
            display: none;
        }
    }

    .dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: $devie__color__primary-label;
        flex-shrink: 0;

        [data-disabled] & {
            background-color: #{devie-disabled-color($devie__color__primary-label)};
        }
    }
}
```

### radio-group.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
    }
}
```

### radio.tsx

```tsx
// https://devie-ui.com/components/radio
// https://base-ui.com/react/components/radio

import { Radio as BaseRadio } from "@base-ui/react/radio";
import clsx from "clsx";
import styles from "./Radio.module.scss";

function Root({ className, ...props }: BaseRadio.Root.Props) {
  return <BaseRadio.Root className={clsx(styles.root, className)} {...props} />;
}

function Indicator({
  className,
  children,
  ...props
}: BaseRadio.Indicator.Props) {
  return (
    <BaseRadio.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    >
      {children || <DefaultIndicatorDot />}
    </BaseRadio.Indicator>
  );
}

function DefaultIndicatorDot() {
  return <div className={styles.dot} />;
}

const Radio = {
  Root,
  Indicator,
};

namespace Radio {
  export namespace Root {
    export type Props = BaseRadio.Root.Props;
    export type State = BaseRadio.Root.State;
  }
  export namespace Indicator {
    export type Props = BaseRadio.Indicator.Props;
  }
}

export default Radio;
```

## Use Cases

### Simple radio group

A basic radio group with labeled options. Each radio button is wrapped in a `label` element for accessibility, allowing users to click the label text to select the option.

```tsx
<RadioGroup defaultValue="apple" aria-label="Favorite fruit">
  <label>
    <Radio.Root value="apple">
      <Radio.Indicator />
    </Radio.Root>
    Apple
  </label>
  <label>
    <Radio.Root value="banana">
      <Radio.Indicator />
    </Radio.Root>
    Banana
  </label>
  <label>
    <Radio.Root value="orange">
      <Radio.Indicator />
    </Radio.Root>
    Orange
  </label>
</RadioGroup>
```

### Disabled state

Radio buttons can be disabled individually or as an entire group. When disabled, radios show reduced opacity and are not interactive.

```tsx
<RadioGroup defaultValue="enabled-1" aria-label="Example">
  <label>
    <Radio.Root value="enabled-1">
      <Radio.Indicator />
    </Radio.Root>
    Enabled
  </label>
  <label>
    <Radio.Root value="disabled-1" disabled>
      <Radio.Indicator />
    </Radio.Root>
    Disabled
  </label>
</RadioGroup>

<RadioGroup defaultValue="option-b" aria-label="Example" disabled>
  <label>
    <Radio.Root value="option-a">
      <Radio.Indicator />
    </Radio.Root>
    Option A
  </label>
  <label>
    <Radio.Root value="option-b">
      <Radio.Indicator />
    </Radio.Root>
    Option B
  </label>
</RadioGroup>
```

---

*Generated from [devie-ui.com/components/radio](https://devie-ui.com/components/radio)*