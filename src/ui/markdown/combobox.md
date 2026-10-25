# <Combobox />

An input combined with a filterable list of predefined items to select. It extends [Base UI's Combobox](https://base-ui.com/react/components/combobox) with consistent styling that matches the design system. Unlike Autocomplete, the selected value must be from the list of options.

Built on [Base UI](https://base-ui.com/react/components/combobox).

## Installation

### Combobox.tsx

```tsx
// https://devie-ui.com/components/combobox
// https://base-ui.com/react/components/combobox

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Combobox.module.scss";

const Root = BaseCombobox.Root;

function Label({ className, ...props }: Combobox.Label.Props) {
  return (
    <BaseCombobox.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Input({ className, ...props }: Combobox.Input.Props) {
  return (
    <BaseCombobox.Input className={clsx(styles.input, className)} {...props} />
  );
}

function InputGroup({ className, ...props }: Combobox.InputGroup.Props) {
  return (
    <BaseCombobox.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: Combobox.Trigger.Props) {
  return (
    <BaseCombobox.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: Combobox.Icon.Props) {
  return (
    <BaseCombobox.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseCombobox.Icon>
  );
}

function Clear({ className, children, ...props }: Combobox.Clear.Props) {
  return (
    <BaseCombobox.Clear
      aria-label={children ? undefined : "Clear"}
      className={clsx(styles.clear, className)}
      {...props}
    >
      {children || <X size={16} />}
    </BaseCombobox.Clear>
  );
}

const Portal = BaseCombobox.Portal;

const Backdrop = BaseCombobox.Backdrop;

const Positioner = BaseCombobox.Positioner;

function Popup({ className, ...props }: Combobox.Popup.Props) {
  return (
    <BaseCombobox.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, children, ...props }: Combobox.Arrow.Props) {
  return (
    <BaseCombobox.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseCombobox.Arrow>
  );
}

function List({ className, ...props }: Combobox.List.Props) {
  return (
    <BaseCombobox.List className={clsx(styles.list, className)} {...props} />
  );
}

function Status({ className, ...props }: Combobox.Status.Props) {
  return (
    <BaseCombobox.Status
      className={clsx(styles.status, className)}
      {...props}
    />
  );
}

function Empty({ className, ...props }: Combobox.Empty.Props) {
  return (
    <BaseCombobox.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

const Collection = BaseCombobox.Collection;

function Row({ className, ...props }: Combobox.Row.Props) {
  return (
    <BaseCombobox.Row className={clsx(styles.row, className)} {...props} />
  );
}

function Item({ className, ...props }: Combobox.Item.Props) {
  return (
    <BaseCombobox.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: Combobox.ItemIndicator.Props) {
  return (
    <BaseCombobox.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseCombobox.ItemIndicator>
  );
}

function Group({ className, ...props }: Combobox.Group.Props) {
  return (
    <BaseCombobox.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Combobox.GroupLabel.Props) {
  return (
    <BaseCombobox.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Combobox.Separator.Props) {
  return (
    <BaseCombobox.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Value = BaseCombobox.Value;

function Chips({ className, ...props }: Combobox.Chips.Props) {
  return (
    <BaseCombobox.Chips className={clsx(styles.chips, className)} {...props} />
  );
}

function Chip({ className, ...props }: Combobox.Chip.Props) {
  return (
    <BaseCombobox.Chip className={clsx(styles.chip, className)} {...props} />
  );
}

function ChipRemove({
  className,
  children,
  ...props
}: Combobox.ChipRemove.Props) {
  return (
    <BaseCombobox.ChipRemove
      aria-label={children ? undefined : "Remove"}
      className={clsx(styles.chipRemove, className)}
      {...props}
    >
      {children || <X size={12} />}
    </BaseCombobox.ChipRemove>
  );
}

const useFilter = BaseCombobox.useFilter;

const Combobox = {
  Root,
  Label,
  Input,
  InputGroup,
  Trigger,
  Icon,
  Clear,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  List,
  Status,
  Empty,
  Collection,
  Row,
  Item,
  ItemIndicator,
  Group,
  GroupLabel,
  Separator,
  Value,
  Chips,
  Chip,
  ChipRemove,
  useFilter,
};

namespace Combobox {
  export namespace Root {
    export type Props<
      Value,
      Multiple extends boolean = false,
    > = BaseCombobox.Root.Props<Value, Multiple>;
    export type ChangeEventDetails = BaseCombobox.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseCombobox.Root.ChangeEventReason;
  }
  export namespace Input {
    export type Props = Omit<BaseCombobox.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Label {
    export type Props = Omit<BaseCombobox.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace InputGroup {
    export type Props = Omit<BaseCombobox.InputGroup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseCombobox.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseCombobox.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Clear {
    export type Props = Omit<BaseCombobox.Clear.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseCombobox.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseCombobox.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseCombobox.Positioner.Props;
    export type State = BaseCombobox.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BaseCombobox.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseCombobox.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseCombobox.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Status {
    export type Props = Omit<BaseCombobox.Status.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Empty {
    export type Props = Omit<BaseCombobox.Empty.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Collection {
    export type Props = BaseCombobox.Collection.Props;
  }
  export namespace Row {
    export type Props = Omit<BaseCombobox.Row.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseCombobox.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseCombobox.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = Omit<BaseCombobox.ItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseCombobox.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseCombobox.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseCombobox.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseCombobox.Value>;
  }
  export namespace Chips {
    export type Props = Omit<BaseCombobox.Chips.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Chip {
    export type Props = Omit<BaseCombobox.Chip.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ChipRemove {
    export type Props = Omit<BaseCombobox.ChipRemove.Props, "className"> & {
      className?: string;
    };
  }
}

export default Combobox;

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

### Combobox.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .label {
        line-height: $devie__spacing__x3;

        &[data-invalid] {
            color: $devie__color__danger;
        }
    }

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

    .itemIndicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: $devie__color__primary;
        flex-shrink: 0;
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

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: $devie__spacing__x05;
        padding: $devie__spacing__x05 0;
    }

    .chip {
        display: inline-flex;
        align-items: center;
        gap: $devie__spacing__x05;
        background: $devie__color__background-sunken;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        line-height: $devie__spacing__x2;
        font-size: $devie__font-size__small;
        color: $devie__color__text;
        white-space: nowrap;
    }

    .chipRemove {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: 0;
        color: $devie__color__text-sub;
        border-radius: 50%;

        &:hover {
            color: $devie__color__text;
            background: #{devie-hover-color($devie__color__background-sunken)};
        }
    }
}
```

## Use Cases

### Simple combobox

A basic combobox with a list of items. Pass `items` to the `Root` and use a render function inside `List` to display each item. The `ItemIndicator` shows a checkmark for the selected item.

```tsx
import Combobox from "@/ui/Combobox";
import styles from "./combobox-simple.module.scss";

const FRUITS = [
  "Apple",
  "Banana",
  "Orange",
  "Mango",
  "Pineapple",
  "Strawberry",
  "Blueberry",
  "Watermelon",
];

function Example() {
  return (
    <div style={{ width: 280 }}>
      <Combobox.Root items={FRUITS}>
        <div className={styles.inputWrapper}>
          <Combobox.Input placeholder="Search fruits..." />
          <Combobox.Trigger
            aria-label="Open popup"
            className={styles.triggerButton}
          >
            <Combobox.Icon />
          </Combobox.Trigger>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup>
              <Combobox.Empty>No fruits found</Combobox.Empty>
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    {item}
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
```

### With clear button

Add `Combobox.Clear` and `Combobox.Trigger` to provide buttons for clearing the selection and opening the popup. Wrap the input and buttons in a container for proper positioning.

```tsx
import Combobox from "@/ui/Combobox";

const FRUITS = ["Apple", "Banana", "Orange", "Mango", "Pineapple"];

function Example() {
  return (
    <div style={{ width: 280 }}>
      <Combobox.Root items={FRUITS}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Combobox.Input
            placeholder="Search fruits..."
            style={{ paddingRight: 60 }}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Combobox.Clear aria-label="Clear selection" />
            <Combobox.Trigger aria-label="Open popup">
              <Combobox.Icon />
            </Combobox.Trigger>
          </div>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup>
              <Combobox.Empty>No fruits found</Combobox.Empty>
              <Combobox.List>
                {(item: string) => (
                  <Combobox.Item key={item} value={item}>
                    {item}
                    <Combobox.ItemIndicator />
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
```

### Grouped options

Use `Combobox.Group` and `Combobox.GroupLabel` to organize options into logical groups. Add `Combobox.Separator` between groups for visual distinction. Each group must have its own `items` prop.

```tsx
import Combobox from "@/ui/Combobox";
import styles from "./combobox-groups.module.scss";

const ALL_FRUITS = [
  { value: "orange", label: "Orange", group: "citrus" },
  { value: "lemon", label: "Lemon", group: "citrus" },
  { value: "lime", label: "Lime", group: "citrus" },
  { value: "grapefruit", label: "Grapefruit", group: "citrus" },
  { value: "strawberry", label: "Strawberry", group: "berries" },
  { value: "blueberry", label: "Blueberry", group: "berries" },
  { value: "raspberry", label: "Raspberry", group: "berries" },
  { value: "mango", label: "Mango", group: "tropical" },
  { value: "pineapple", label: "Pineapple", group: "tropical" },
  { value: "papaya", label: "Papaya", group: "tropical" },
];

function Example() {
  return (
    <div style={{ width: 280 }}>
      <Combobox.Root items={ALL_FRUITS}>
        <div className={styles.inputWrapper}>
          <Combobox.Input placeholder="Search fruits..." />
          <Combobox.Trigger
            aria-label="Open popup"
            className={styles.triggerButton}
          >
            <Combobox.Icon />
          </Combobox.Trigger>
        </div>
        <Combobox.Portal>
          <Combobox.Positioner sideOffset={4}>
            <Combobox.Popup>
              <Combobox.Empty>No fruits found</Combobox.Empty>
              <Combobox.List>
                <Combobox.Group>
                  <Combobox.GroupLabel>Citrus</Combobox.GroupLabel>
                  {ALL_FRUITS.filter((f) => f.group === "citrus").map(
                    (fruit) => (
                      <Combobox.Item key={fruit.value} value={fruit}>
                        {fruit.label}
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    ),
                  )}
                </Combobox.Group>
                <Combobox.Separator />
                <Combobox.Group>
                  <Combobox.GroupLabel>Berries</Combobox.GroupLabel>
                  {ALL_FRUITS.filter((f) => f.group === "berries").map(
                    (fruit) => (
                      <Combobox.Item key={fruit.value} value={fruit}>
                        {fruit.label}
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    ),
                  )}
                </Combobox.Group>
                <Combobox.Separator />
                <Combobox.Group>
                  <Combobox.GroupLabel>Tropical</Combobox.GroupLabel>
                  {ALL_FRUITS.filter((f) => f.group === "tropical").map(
                    (fruit) => (
                      <Combobox.Item key={fruit.value} value={fruit}>
                        {fruit.label}
                        <Combobox.ItemIndicator />
                      </Combobox.Item>
                    ),
                  )}
                </Combobox.Group>
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
```

### Async search with multiple selection

Simulate a remote search by fetching items after a small delay and allow users to select more than one option. Use `multiple` with `value`/`onValueChange` and `onInputValueChange` to drive the async query. Type at least two characters, such as `ja`, `py`, or `ru`.

```tsx
import { useEffect, useRef, useState } from "react";
import Combobox from "@/ui/Combobox";
import styles from "./combobox-async-multiple.module.scss";

const LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  // ... more languages
];

type Language = (typeof LANGUAGES)[number];

function Example() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<Language[]>([]);
  const { contains } = Combobox.useFilter({ multiple: true, value });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    // Simulate async search
    const timeout = setTimeout(() => {
      const nextItems = LANGUAGES.filter((item) =>
        contains(item, trimmed, (language) => language.label),
      );
      setItems(nextItems);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, contains]);

  return (
    <Combobox.Root
      multiple
      items={items}
      filteredItems={items}
      filter={null}
      value={value}
      onValueChange={(nextValue) =>
        setValue(Array.isArray(nextValue) ? nextValue : [])
      }
      onInputValueChange={(val) => setQuery(val)}
      inputValue={query}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      isItemEqualToValue={(item, val) => item.value === val.value}
    >
      {/* Chips container is the anchor for positioning */}
      <Combobox.Chips className={styles.inputWrapper} ref={containerRef}>
        <Combobox.Value>
          {(selected) => (
            <>
              {selected.map((chip) => (
                <Combobox.Chip key={chip.value} aria-label={chip.label}>
                  {chip.label}
                  <Combobox.ChipRemove aria-label="Remove" />
                </Combobox.Chip>
              ))}
              <Combobox.Input
                placeholder={selected.length > 0 ? "" : "Search languages..."}
              />
            </>
          )}
        </Combobox.Value>
        <div className={styles.actionButtons}>
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup">
            <Combobox.Icon />
          </Combobox.Trigger>
        </div>
      </Combobox.Chips>
      <Combobox.Portal>
        {/* anchor prop positions popup relative to Chips container */}
        <Combobox.Positioner sideOffset={4} anchor={containerRef}>
          <Combobox.Popup>
            <Combobox.Empty>
              {isLoading ? "Searching..." : "No results found."}
            </Combobox.Empty>
            <Combobox.List>
              {(item) => (
                <Combobox.Item key={item.value} value={item}>
                  {item.label}
                  <Combobox.ItemIndicator />
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
```

---

*Generated from [devie-ui.com/components/combobox](https://devie-ui.com/components/combobox)*