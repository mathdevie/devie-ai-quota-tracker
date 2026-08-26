# <Autocomplete />

The Autocomplete component provides a text input with a dropdown of suggestions that filter as the user types. It extends [ Base UI's Autocomplete ](https://base-ui.com/react/components/autocomplete) .

Autocomplete is best suited for free-form text input with suggestions (e.g., search fields, address inputs).

Built on [Base UI](https://base-ui.com/react/components/autocomplete).

## Installation

### autocomplete.module.scss

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
        font-size: inherit;
        font-family: inherit;

        &:focus-visible {
            border-color: $devie__color__primary;
            outline: 0;
        }

        &::placeholder {
            color: $devie__color__text-sub;
        }

        &[data-popup-open] {
            border-color: $devie__color__primary;
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

    .trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        color: $devie__color__text-sub;

        &:hover:not([data-disabled]) {
            color: $devie__color__text;
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text-sub)};
        }
    }

    .icon {
        display: flex;
        transition: transform 0.2s ease;
        color: $devie__color__text-sub;
        pointer-events: none;

        [data-popup-open] & {
            transform: rotate(180deg);
        }

        [data-disabled] & {
            color: #{devie-disabled-color($devie__color__text-sub)};
        }
    }

    .clear {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: $devie__spacing__x05;
        cursor: pointer;
        color: $devie__color__text;
        border-radius: $devie__radius;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }
    }

    .popup:has(.item, .empty) {
        box-sizing: border-box;
        background-color: $devie__color__background;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        padding: $devie__spacing__x05;
        max-height: var(--available-height);
        overflow-y: auto;
        scroll-padding-block: $devie__spacing__x2;
        transition: none;
    }

    .status {
        padding: $devie__spacing__x1;
        font-size: $devie__font-size__small;
        color: $devie__color__text-sub;
        text-align: center;
    }

    .item,
    .popup[data-empty] .empty {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $devie__spacing__x1;
        padding: $devie__spacing__x05 $devie__spacing__x1;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        color: $devie__color__text;
        min-width: var(--anchor-width);
        outline: 0;
        font-size: $devie__font-size__small;
        user-select: none;
        transition: none;

        &:hover:not([data-disabled]),
        &[data-highlighted]:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
        }

        &[data-selected] {
            color: $devie__color__primary;
        }
    }

    .item {
        cursor: pointer;
    }

    .empty {
        cursor: default;
    }

    .list {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    .row {
        display: flex;
        gap: $devie__spacing__x05;
    }

    .group {
        display: flex;
        flex-direction: column;
    }

    .groupLabel {
        padding: $devie__spacing__x1;
        font-size: $devie__font-size__small;
        color: $devie__color__text-sub;
        font-weight: 600;
    }

    .separator {
        height: 1px;
        background-color: $devie__color__line;
        margin: $devie__spacing__x05 0;
    }

    .arrow {
        fill: $devie__color__background;
        stroke: $devie__color__line;
        stroke-width: 1px;
        z-index: 1;

        &[data-side='top'] {
            bottom: -8px;
            rotate: 180deg;
        }

        &[data-side='bottom'] {
            top: -8px;
            rotate: 0deg;
        }

        &[data-side='left'] {
            right: -13px;
            rotate: 90deg;
        }

        &[data-side='right'] {
            left: -13px;
            rotate: -90deg;
        }
    }
}
```

### autocomplete.tsx

```tsx
// https://devie-ui.com/components/autocomplete
// https://base-ui.com/react/components/autocomplete

import { Autocomplete as BaseAutocomplete } from "@base-ui/react/autocomplete";
import clsx from "clsx";
import { ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Autocomplete.module.scss";

const Root = BaseAutocomplete.Root;

const Value = BaseAutocomplete.Value;

function Input({ className, ...props }: BaseAutocomplete.Input.Props) {
  return (
    <BaseAutocomplete.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function InputGroup({
  className,
  ...props
}: BaseAutocomplete.InputGroup.Props) {
  return (
    <BaseAutocomplete.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  render,
  ...props
}: BaseAutocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAutocomplete.Icon>) {
  return (
    <BaseAutocomplete.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseAutocomplete.Icon>
  );
}

function Clear({
  className,
  children,
  ...props
}: BaseAutocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseAutocomplete.Clear>
  );
}

function List({ className, ...props }: BaseAutocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

const Portal = BaseAutocomplete.Portal;

const Backdrop = BaseAutocomplete.Backdrop;

function Positioner({
  className,
  ...props
}: BaseAutocomplete.Positioner.Props) {
  return (
    <BaseAutocomplete.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseAutocomplete.Popup.Props) {
  return (
    <BaseAutocomplete.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseAutocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
}

function Status({ className, ...props }: BaseAutocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: BaseAutocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      className={clsx(styles.empty, className)}
      {...props}
    />
  );
}

const Collection = BaseAutocomplete.Collection;

function Row({ className, ...props }: BaseAutocomplete.Row.Props) {
  return (
    <BaseAutocomplete.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseAutocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseAutocomplete.Group.Props) {
  return (
    <BaseAutocomplete.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({
  className,
  ...props
}: BaseAutocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseAutocomplete.Separator.Props) {
  return (
    <BaseAutocomplete.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const useFilter = BaseAutocomplete.useFilter;

const Autocomplete = {
  Root,
  Value,
  Input,
  InputGroup,
  Trigger,
  Icon,
  Clear,
  List,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Status,
  Empty,
  Collection,
  Row,
  Item,
  Group,
  GroupLabel,
  Separator,
  useFilter,
};

namespace Autocomplete {
  export namespace Root {
    export type Props<Value> = BaseAutocomplete.Root.Props<Value>;
    export type ChangeEventDetails = BaseAutocomplete.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseAutocomplete.Root.ChangeEventReason;
  }
  export namespace Value {
    export type Props = BaseAutocomplete.Value.Props;
  }
  export namespace Input {
    export type Props = BaseAutocomplete.Input.Props;
  }
  export namespace InputGroup {
    export type Props = BaseAutocomplete.InputGroup.Props;
  }
  export namespace Trigger {
    export type Props = BaseAutocomplete.Trigger.Props;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseAutocomplete.Icon>;
  }
  export namespace Clear {
    export type Props = BaseAutocomplete.Clear.Props;
  }
  export namespace List {
    export type Props = BaseAutocomplete.List.Props;
  }
  export namespace Portal {
    export type Props = BaseAutocomplete.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseAutocomplete.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseAutocomplete.Positioner.Props;
    export type State = BaseAutocomplete.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseAutocomplete.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BaseAutocomplete.Arrow.Props;
  }
  export namespace Status {
    export type Props = BaseAutocomplete.Status.Props;
  }
  export namespace Empty {
    export type Props = BaseAutocomplete.Empty.Props;
  }
  export namespace Collection {
    export type Props = React.ComponentProps<
      typeof BaseAutocomplete.Collection
    >;
  }
  export namespace Row {
    export type Props = BaseAutocomplete.Row.Props;
  }
  export namespace Item {
    export type Props = BaseAutocomplete.Item.Props;
    export type State = BaseAutocomplete.Item.State;
  }
  export namespace Group {
    export type Props = BaseAutocomplete.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseAutocomplete.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseAutocomplete.Separator.Props;
  }
}

export default Autocomplete;
```

## Use Cases

### Uncontrolled

For simple use cases, use the `defaultValue` prop to set an initial value without managing state. The component handles its own internal state. Pass `items` to the `Root` and use a render function inside `List` to display each item.

```tsx
const FRUITS = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];

<Autocomplete.Root defaultValue="Apple" items={FRUITS}>
  <Autocomplete.Input placeholder="Search fruits..." />
  <Autocomplete.Portal>
    <Autocomplete.Positioner>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {(item) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
```

### Controlled

For full control over the input value, use `value` and `onValueChange` props. This allows you to react to changes, validate input, or sync with external state.

```tsx
const FRUITS = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];

const [value, setValue] = useState("");

<Autocomplete.Root value={value} onValueChange={setValue} items={FRUITS}>
  <Autocomplete.Input placeholder="Search fruits..." />
  <Autocomplete.Portal>
    <Autocomplete.Positioner sideOffset={4}>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {(item) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>

<p>Current value: {value || "(empty)"}</p>
```

### With clear button

Add `Autocomplete.Clear` to allow users to quickly reset the input. You can wrap the input and icons in a container to position them together.

```tsx
const COUNTRIES = ["United States", "United Kingdom", "Canada", "Australia"];

const [inputValue, setInputValue] = useState("");

<Autocomplete.Root
  value={inputValue}
  onValueChange={setInputValue}
  items={COUNTRIES}
>
  <div>
    <Autocomplete.Input placeholder="Search countries..." />
    <Autocomplete.Clear aria-label="Clear input" />
  </div>
  <Autocomplete.Portal>
    <Autocomplete.Positioner sideOffset={4}>
      <Autocomplete.Popup>
        <Autocomplete.List>
          {(item) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
```

### Empty state

Use `Autocomplete.Empty` to show a message when no results match the search query. This provides feedback to users when their search doesn't match any options.

```tsx
const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Rust", "Go"];

const [inputValue, setInputValue] = useState("");

<Autocomplete.Root
  value={inputValue}
  onValueChange={setInputValue}
  items={LANGUAGES}
>
  <Autocomplete.Input placeholder="Search languages..." />
  <Autocomplete.Portal>
    <Autocomplete.Positioner sideOffset={4}>
      <Autocomplete.Popup>
        <Autocomplete.Empty>No languages found</Autocomplete.Empty>
        <Autocomplete.List>
          {(item) => (
            <Autocomplete.Item key={item} value={item}>
              {item}
            </Autocomplete.Item>
          )}
        </Autocomplete.List>
      </Autocomplete.Popup>
    </Autocomplete.Positioner>
  </Autocomplete.Portal>
</Autocomplete.Root>
```

---

*Generated from [devie-ui.com/components/autocomplete](https://devie-ui.com/components/autocomplete)*