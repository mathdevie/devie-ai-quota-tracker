# <NumberField />

The NumberField component extends [ Base UI's NumberField ](https://base-ui.com/react/components/number-field) . It provides a numeric input with increment and decrement buttons, supporting min/max constraints, step values, and a scrub area for mouse drag interactions.

Built on [Base UI](https://base-ui.com/react/components/number-field).

## Installation

### number-field.tsx

```tsx
// https://devie-ui.com/components/number-field
// https://base-ui.com/react/components/number-field

import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import styles from "./NumberField.module.scss";

function Root({ className, ...props }: BaseNumberField.Root.Props) {
  return (
    <BaseNumberField.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Group({ className, ...props }: BaseNumberField.Group.Props) {
  return (
    <BaseNumberField.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function Input({ className, ...props }: BaseNumberField.Input.Props) {
  return (
    <BaseNumberField.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function Increment({
  className,
  children,
  ...props
}: BaseNumberField.Increment.Props) {
  return (
    <BaseNumberField.Increment
      className={clsx(styles.increment, className)}
      {...props}
    >
      {children ?? <Plus size={16} />}
    </BaseNumberField.Increment>
  );
}

function Decrement({
  className,
  children,
  ...props
}: BaseNumberField.Decrement.Props) {
  return (
    <BaseNumberField.Decrement
      className={clsx(styles.decrement, className)}
      {...props}
    >
      {children ?? <Minus size={16} />}
    </BaseNumberField.Decrement>
  );
}

function ScrubArea({ className, ...props }: BaseNumberField.ScrubArea.Props) {
  return (
    <BaseNumberField.ScrubArea
      className={clsx(styles.scrubArea, className)}
      {...props}
    />
  );
}

function ScrubCursorIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 24 14"
      fill="currentColor"
      stroke="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M19.5 5.5L6.49737 5.51844V2L1 6.9999L6.5 12L6.49737 8.5L19.5 8.5V12L25 6.9999L19.5 2V5.5Z" />
    </svg>
  );
}

function ScrubAreaCursor({
  className,
  children,
  ...props
}: BaseNumberField.ScrubAreaCursor.Props) {
  return (
    <BaseNumberField.ScrubAreaCursor
      className={clsx(styles.scrubAreaCursor, className)}
      {...props}
    >
      {children ?? <ScrubCursorIcon />}
    </BaseNumberField.ScrubAreaCursor>
  );
}

const NumberField = {
  Root,
  Group,
  Input,
  Increment,
  Decrement,
  ScrubArea,
  ScrubAreaCursor,
};

namespace NumberField {
  export namespace Root {
    export type Props = BaseNumberField.Root.Props;
    export type State = BaseNumberField.Root.State;
    export type ChangeEventDetails = BaseNumberField.Root.ChangeEventDetails;
  }
  export namespace Group {
    export type Props = BaseNumberField.Group.Props;
  }
  export namespace Input {
    export type Props = BaseNumberField.Input.Props;
  }
  export namespace Increment {
    export type Props = BaseNumberField.Increment.Props;
  }
  export namespace Decrement {
    export type Props = BaseNumberField.Decrement.Props;
  }
  export namespace ScrubArea {
    export type Props = BaseNumberField.ScrubArea.Props;
  }
  export namespace ScrubAreaCursor {
    export type Props = BaseNumberField.ScrubAreaCursor.Props;
  }
}

export default NumberField;
```

### number-field.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x05;
    }

    .group {
        display: flex;
    }

    .input {
        box-sizing: border-box;
        margin: 0;
        padding: $devie__spacing__x1;
        border-radius: 0;
        border: 1px solid $devie__color__line;
        background-color: $devie__color__background;
        color: $devie__color__text;
        text-align: center;
        font-variant-numeric: tabular-nums;
        width: 6rem;


        &:focus-visible {
            z-index: 1;
            border-color: $devie__color__primary;
            outline: 0;
        }

        &::placeholder {
            color: $devie__color__text-sub;
        }

        &[data-invalid] {
            border-color: $devie__color__danger;
        }

        &[data-disabled] {
            cursor: not-allowed;
            background: #{devie-disabled-color($devie__color__background)};
            border-color: #{devie-disabled-color($devie__color__line)};
            color: #{devie-disabled-color($devie__color__text)};
        }
    }

    .increment,
    .decrement {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0;
        outline: 0;
        padding: $devie__spacing__x1;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        background-color: $devie__color__background-sub;
        background-clip: padding-box;
        color: $devie__color__text;
        user-select: none;
        cursor: pointer;

        @media (hover: hover) {
            &:hover:not([data-disabled]) {
                background-color: #{devie-hover-color($devie__color__background-sub)};
            }
        }

        &:active:not([data-disabled]) {
            background-color: #{devie-hover-color($devie__color__background-sub)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            background: #{devie-disabled-color($devie__color__background-sub)};
            border-color: #{devie-disabled-color($devie__color__line)};
            color: #{devie-disabled-color($devie__color__text)};
        }
    }

    .decrement {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right-width: 0;

    }

    .increment {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left-width: 0;
    }

    .scrubArea {
        cursor: ew-resize;
        user-select: none;
    }

    .scrubAreaCursor {
        filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
    }
}
```

## Use Cases

### Simple number field

The basic number field includes a text input with increment and decrement buttons. Users can type directly, use the buttons, or use arrow keys to change the value.

```tsx
<NumberField.Root defaultValue={50}>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>
```

### With scrub area

The scrub area allows users to click and drag on a label to change the value, similar to how design tools like Figma work. Hold `Shift` for larger steps or `Alt/Option` for smaller steps. The `ScrubAreaCursor` displays a custom cursor icon while dragging.

```tsx
<NumberField.Root defaultValue={100}>
  <NumberField.ScrubArea>
    <label>Amount</label>
    <NumberField.ScrubAreaCursor />
  </NumberField.ScrubArea>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>
```

### With min, max, and step

Use `min`, `max`, and `step` props to constrain the input values. The buttons will be disabled when reaching the limits, and the input will clamp values on blur.

```tsx
<NumberField.Root defaultValue={50} step={10}>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>

<NumberField.Root defaultValue={0} min={0} max={100}>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>

<NumberField.Root defaultValue={0} min={0} max={100} step={25}>
  <NumberField.Group>
    <NumberField.Decrement />
    <NumberField.Input />
    <NumberField.Increment />
  </NumberField.Group>
</NumberField.Root>
```

### With Field for labels and validation

Combine NumberField with the [Field](/components/field) component for labels, descriptions, and validation. The NumberField automatically integrates with Field's validation state.

```tsx
<Field.Root>
  <Field.Label>Quantity</Field.Label>
  <NumberField.Root defaultValue={1} min={1} max={99}>
    <NumberField.Group>
      <NumberField.Decrement />
      <NumberField.Input />
      <NumberField.Increment />
    </NumberField.Group>
  </NumberField.Root>
</Field.Root>

<Field.Root>
  <Field.Label>Age</Field.Label>
  <NumberField.Root defaultValue={25} min={0} max={120}>
    <NumberField.Group>
      <NumberField.Decrement />
      <NumberField.Input />
      <NumberField.Increment />
    </NumberField.Group>
  </NumberField.Root>
  <Field.Description>Enter your age in years</Field.Description>
</Field.Root>
```

---

*Generated from [devie-ui.com/components/number-field](https://devie-ui.com/components/number-field)*