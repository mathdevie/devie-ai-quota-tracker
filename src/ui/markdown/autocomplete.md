# <Autocomplete />

A text input with a list of suggestions that filter as the user types. It extends [Base UI's Autocomplete](https://base-ui.com/react/components/autocomplete).

Use Autocomplete for free-form text with suggestions, such as a search field. To require a value from the list, use [Combobox](/components/combobox).

Built on [Base UI](https://base-ui.com/react/components/autocomplete).

## Installation

### Autocomplete.tsx

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

function Input({ className, ...props }: Autocomplete.Input.Props) {
  return (
    <BaseAutocomplete.Input
      className={clsx(styles.input, className)}
      {...props}
    />
  );
}

function InputGroup({ className, ...props }: Autocomplete.InputGroup.Props) {
  return (
    <BaseAutocomplete.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: Autocomplete.Trigger.Props) {
  return (
    <BaseAutocomplete.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: Autocomplete.Icon.Props) {
  return (
    <BaseAutocomplete.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseAutocomplete.Icon>
  );
}

function Clear({ className, children, ...props }: Autocomplete.Clear.Props) {
  return (
    <BaseAutocomplete.Clear
      aria-label={children ? undefined : "Clear"}
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseAutocomplete.Clear>
  );
}

function List({ className, ...props }: Autocomplete.List.Props) {
  return (
    <BaseAutocomplete.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

const Portal = BaseAutocomplete.Portal;

const Backdrop = BaseAutocomplete.Backdrop;

const Positioner = BaseAutocomplete.Positioner;

function Popup({ className, ...props }: Autocomplete.Popup.Props) {
  return (
    <BaseAutocomplete.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Autocomplete.Arrow.Props) {
  return (
    <BaseAutocomplete.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    >
      {children || <ArrowSvg />}
    </BaseAutocomplete.Arrow>
  );
}

function Status({ className, ...props }: Autocomplete.Status.Props) {
  return (
    <BaseAutocomplete.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: Autocomplete.Empty.Props) {
  return (
    <BaseAutocomplete.Empty
      className={clsx(styles.empty, className)}
      {...props}
    />
  );
}

const Collection = BaseAutocomplete.Collection;

function Row({ className, ...props }: Autocomplete.Row.Props) {
  return (
    <BaseAutocomplete.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: Autocomplete.Item.Props) {
  return (
    <BaseAutocomplete.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: Autocomplete.Group.Props) {
  return (
    <BaseAutocomplete.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({ className, ...props }: Autocomplete.GroupLabel.Props) {
  return (
    <BaseAutocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Autocomplete.Separator.Props) {
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
    export type Props = Omit<BaseAutocomplete.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace InputGroup {
    export type Props = Omit<BaseAutocomplete.InputGroup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseAutocomplete.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseAutocomplete.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Clear {
    export type Props = Omit<BaseAutocomplete.Clear.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseAutocomplete.List.Props, "className"> & {
      className?: string;
    };
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
    export type Props = Omit<BaseAutocomplete.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseAutocomplete.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Status {
    export type Props = Omit<BaseAutocomplete.Status.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Empty {
    export type Props = Omit<BaseAutocomplete.Empty.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Collection {
    export type Props = React.ComponentProps<
      typeof BaseAutocomplete.Collection
    >;
  }
  export namespace Row {
    export type Props = Omit<BaseAutocomplete.Row.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseAutocomplete.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseAutocomplete.Item.State;
  }
  export namespace Group {
    export type Props = Omit<BaseAutocomplete.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseAutocomplete.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseAutocomplete.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Autocomplete;

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="20"
      height="10"
      viewBox="0 0 20 10"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8V10H18.5349V8C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className={styles.arrowFill}
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9V8C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8V9C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className={styles.arrowInnerStroke}
      />
    </svg>
  );
}
```

### Autocomplete.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .inputGroup {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        width: 100%;
    }

    .input {
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        border: 1px solid $devie__color__line;
        box-shadow: 0 1px 2px 0 rgb(9 9 11 / 12%);
        box-sizing: border-box;
        min-width: 200px;
        width: 100%;
        color: $devie__color__text;
        font-size: inherit;
        font-family: inherit;
        line-height: $devie__spacing__x3;

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
            box-shadow: none;
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
        color: $devie__color__text-sub;

        &:hover:not([data-disabled]) {
            color: $devie__color__text;
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
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

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .clear {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: $devie__spacing__x05;
        color: $devie__color__text;
        border-radius: $devie__radius;
        transition: none;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }
    }

    .popup:has(.item, .empty) {
        line-height: $devie__spacing__x2;
        box-sizing: border-box;
        background-color: $devie__color__background-raised;
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
        line-height: $devie__spacing__x2;
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
        padding: $devie__spacing__x1;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        color: $devie__color__text;
        min-width: var(--anchor-width);
        outline: 0;
        font-size: $devie__font-size__normal;
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
        padding: $devie__spacing__x05 $devie__spacing__x1;
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
        display: flex;
        z-index: 1;

        &[data-side='top'] {
            bottom: calc(-1 * $devie__spacing__x1);
            rotate: 180deg;
        }

        &[data-side='bottom'] {
            top: calc(-1 * $devie__spacing__x1);
            rotate: 0deg;
        }

        // The extra 5px recentres the 20x10 ArrowSvg after its 90deg rotation
        &[data-side='left'] {
            right: calc(-1 * $devie__spacing__x1 - 5px);
            rotate: 90deg;
        }

        &[data-side='right'] {
            left: calc(-1 * $devie__spacing__x1 - 5px);
            rotate: -90deg;
        }
    }

    .arrowFill {
        fill: $devie__color__background-raised;
    }

    .arrowInnerStroke {
        fill: $devie__color__line;
    }
}
```

## Use Cases

### Uncontrolled

Pass `items` to `Autocomplete.Root` and render each item with a function inside `Autocomplete.List`. Use `defaultValue` to set an initial value.

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

Use `value` and `onValueChange` to control the input value.

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

Add `Autocomplete.Clear` to reset the input.

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

Use `Autocomplete.Empty` to show a message when no item matches the query.

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