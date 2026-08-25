# <CheckboxGroup />

The CheckboxGroup component extends [ Base UI's CheckboxGroup ](https://base-ui.com/react/components/checkbox-group) . It provides shared state to a series of checkboxes, making it easy to manage multiple selections and implement "select all" patterns.

Built on [Base UI](https://base-ui.com/react/components/checkbox-group).

## Installation

### checkbox-group.module.scss

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

### checkbox-group.tsx

```tsx
// https://devie-ui.com/components/checkbox-group
// https://base-ui.com/react/components/checkbox-group

import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import clsx from "clsx";
import styles from "./CheckboxGroup.module.scss";

function Root({ className, ...props }: BaseCheckboxGroup.Props) {
  return (
    <BaseCheckboxGroup className={clsx(styles.root, className)} {...props} />
  );
}

const CheckboxGroup = {
  Root,
};

namespace CheckboxGroup {
  export namespace Root {
    export type Props = BaseCheckboxGroup.Props;
    export type State = BaseCheckboxGroup.State;
    export type ChangeEventDetails = BaseCheckboxGroup.ChangeEventDetails;
  }
}

export default CheckboxGroup;
```

## Use Cases

### Simple group

Use `value` and `onValueChange` to control the group state. Each checkbox needs a unique `value` prop.

```tsx
const [value, setValue] = useState<string[]>(["email"]);

<CheckboxGroup.Root value={value} onValueChange={setValue}>
  <label>
    <Checkbox.Root name="notifications" value="email">
      <Checkbox.Indicator />
    </Checkbox.Root>
    Email notifications
  </label>

  <label>
    <Checkbox.Root name="notifications" value="sms">
      <Checkbox.Indicator />
    </Checkbox.Root>
    SMS notifications
  </label>

  <label>
    <Checkbox.Root name="notifications" value="push">
      <Checkbox.Indicator />
    </Checkbox.Root>
    Push notifications
  </label>
</CheckboxGroup.Root>
```

### Parent checkbox

Add the `parent` prop to a checkbox to make it control all other checkboxes in the group. Pass `allValues` to the group to enable the indeterminate state when some (but not all) items are selected.

```tsx
const allValues = ["read", "write", "delete"];
const [value, setValue] = useState<string[]>([]);

<CheckboxGroup.Root
  value={value}
  onValueChange={setValue}
  allValues={allValues}
>
  <label>
    <Checkbox.Root parent>
      <Checkbox.Indicator />
    </Checkbox.Root>
    All permissions
  </label>

  <div>
    <label>
      <Checkbox.Root value="read">
        <Checkbox.Indicator />
      </Checkbox.Root>
      Read
    </label>

    <label>
      <Checkbox.Root value="write">
        <Checkbox.Indicator />
      </Checkbox.Root>
      Write
    </label>

    <label>
      <Checkbox.Root value="delete">
        <Checkbox.Indicator />
      </Checkbox.Root>
      Delete
    </label>
  </div>
</CheckboxGroup.Root>
```

---

*Generated from [devie-ui.com/components/checkbox-group](https://devie-ui.com/components/checkbox-group)*