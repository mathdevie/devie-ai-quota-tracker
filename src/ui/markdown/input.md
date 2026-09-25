# <Input />

A native text input that works inside a Field. The Input component extends [ Base UI's Input ](https://base-ui.com/react/components/input) . It styles the native text control, and [Field.Control](/components/field) renders it, so both share one look.

Built on [Base UI](https://base-ui.com/react/components/input).

## Installation

### input.tsx

```tsx
// https://devie-ui.com/components/input
// https://base-ui.com/react/components/input

import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./Input.module.scss";

function Input({ className, ...props }: Input.Props) {
  return <BaseInput className={clsx(styles.input, className)} {...props} />;
}

namespace Input {
  export type Props = BaseInput.Props;
  export type State = BaseInput.State;
  export type ChangeEventDetails = BaseInput.ChangeEventDetails;
}

export default Input;
```

### input.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .input {
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        padding: $devie__spacing__x1;
        border: 1px solid $devie__color__line;
        box-sizing: border-box;
        min-width: 200px;
        width: 100%;
        color: $devie__color__text;
        font-family: inherit;
        font-size: inherit;

        &:focus-visible {
            border-color: $devie__color__primary;
            outline: 0;
        }

        &::placeholder {
            color: $devie__color__text-sub;
        }

        &[data-invalid] {
            border-color: $devie__color__danger;
            color: $devie__color__danger;

            &::placeholder {
                color: $devie__color__danger;
            }
        }

        &:disabled {
            cursor: not-allowed;
            background: #{devie-disabled-color($devie__color__background)};
            border-color: #{devie-disabled-color($devie__color__line)};
            color: #{devie-disabled-color($devie__color__text)};

            &::placeholder {
                color: #{devie-disabled-color($devie__color__text-sub)};
            }
        }
    }
}
```

## Use Cases

### Simple input

Render `Input` with any native attribute such as `placeholder` or `type`.

```tsx
<Input placeholder="Search the docs" />
<Input type="email" placeholder="you@example.com" />
```

### Controlled value

Pass `value` and `onValueChange` to control the input. Use `defaultValue` for an uncontrolled input.

```tsx
const [name, setName] = useState("Ada");

<Input value={name} onValueChange={setName} />
<p>Hello, {name || "stranger"}.</p>
```

### Disabled state

Set `disabled` to prevent editing.

```tsx
<Input disabled defaultValue="Read only for now" />
```

### With Field

Place `Input` inside `Field.Root` to add a label, a description, and validation. See [Field](/components/field) for the validation modes.

```tsx
<Field.Root>
  <Field.Label>Display name</Field.Label>
  <Input placeholder="Ada Lovelace" />
  <Field.Description>Shown on your public profile.</Field.Description>
</Field.Root>

<Field.Root invalid>
  <Field.Label>Username</Field.Label>
  <Input defaultValue="ada lovelace" />
  <Field.Error match>Spaces are not allowed.</Field.Error>
</Field.Root>
```

---

*Generated from [devie-ui.com/components/input](https://devie-ui.com/components/input)*