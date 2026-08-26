# <Combobox />

The Combobox component provides an input with a filterable dropdown list for selecting from predefined options. It extends [ Base UI's Combobox ](https://base-ui.com/react/components/combobox) with consistent styling that matches the design system. Unlike Autocomplete, the selected value must be from the list of options.

Built on [Base UI](https://base-ui.com/react/components/combobox).

## Installation

### combobox.module.scss

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

### combobox.tsx

```tsx
// https://devie-ui.com/components/combobox
// https://base-ui.com/react/components/combobox

import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import clsx from "clsx";
import { Check, ChevronDown, X } from "lucide-react";
import type React from "react";
import styles from "./Combobox.module.scss";

const Root = BaseCombobox.Root;

function Label({ className, ...props }: BaseCombobox.Label.Props) {
  return (
    <BaseCombobox.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Input({ className, ...props }: BaseCombobox.Input.Props) {
  return (
    <BaseCombobox.Input className={clsx(styles.input, className)} {...props} />
  );
}

function InputGroup({ className, ...props }: BaseCombobox.InputGroup.Props) {
  return (
    <BaseCombobox.InputGroup
      className={clsx(styles.inputGroup, className)}
      {...props}
    />
  );
}

function Trigger({ className, render, ...props }: BaseCombobox.Trigger.Props) {
  return (
    <BaseCombobox.Trigger
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
}: React.ComponentProps<typeof BaseCombobox.Icon>) {
  return (
    <BaseCombobox.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseCombobox.Icon>
  );
}

function Clear({ className, children, ...props }: BaseCombobox.Clear.Props) {
  return (
    <BaseCombobox.Clear className={clsx(styles.clear, className)} {...props}>
      {children || <X size={16} />}
    </BaseCombobox.Clear>
  );
}

const Portal = BaseCombobox.Portal;

const Backdrop = BaseCombobox.Backdrop;

function Positioner({ className, ...props }: BaseCombobox.Positioner.Props) {
  return (
    <BaseCombobox.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseCombobox.Popup.Props) {
  return (
    <BaseCombobox.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, ...props }: BaseCombobox.Arrow.Props) {
  return (
    <BaseCombobox.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function List({ className, ...props }: BaseCombobox.List.Props) {
  return (
    <BaseCombobox.List className={clsx(styles.list, className)} {...props} />
  );
}

function Empty({ className, ...props }: BaseCombobox.Empty.Props) {
  return (
    <BaseCombobox.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseCombobox.Item.Props) {
  return (
    <BaseCombobox.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: BaseCombobox.ItemIndicator.Props) {
  return (
    <BaseCombobox.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseCombobox.ItemIndicator>
  );
}

function Group({ className, ...props }: BaseCombobox.Group.Props) {
  return (
    <BaseCombobox.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseCombobox.GroupLabel.Props) {
  return (
    <BaseCombobox.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseCombobox.Separator.Props) {
  return (
    <BaseCombobox.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Value = BaseCombobox.Value;

function Chips({ className, ...props }: BaseCombobox.Chips.Props) {
  return (
    <BaseCombobox.Chips className={clsx(styles.chips, className)} {...props} />
  );
}

function Chip({ className, ...props }: BaseCombobox.Chip.Props) {
  return (
    <BaseCombobox.Chip className={clsx(styles.chip, className)} {...props} />
  );
}

function ChipRemove({
  className,
  children,
  ...props
}: BaseCombobox.ChipRemove.Props) {
  return (
    <BaseCombobox.ChipRemove
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
  Empty,
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
    export type Props = BaseCombobox.Input.Props;
  }
  export namespace Label {
    export type Props = BaseCombobox.Label.Props;
  }
  export namespace InputGroup {
    export type Props = BaseCombobox.InputGroup.Props;
  }
  export namespace Trigger {
    export type Props = BaseCombobox.Trigger.Props;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseCombobox.Icon>;
  }
  export namespace Clear {
    export type Props = BaseCombobox.Clear.Props;
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
    export type Props = BaseCombobox.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BaseCombobox.Arrow.Props;
  }
  export namespace List {
    export type Props = BaseCombobox.List.Props;
  }
  export namespace Empty {
    export type Props = BaseCombobox.Empty.Props;
  }
  export namespace Item {
    export type Props = BaseCombobox.Item.Props;
    export type State = BaseCombobox.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = BaseCombobox.ItemIndicator.Props;
  }
  export namespace Group {
    export type Props = BaseCombobox.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseCombobox.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseCombobox.Separator.Props;
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseCombobox.Value>;
  }
  export namespace Chips {
    export type Props = BaseCombobox.Chips.Props;
  }
  export namespace Chip {
    export type Props = BaseCombobox.Chip.Props;
  }
  export namespace ChipRemove {
    export type Props = BaseCombobox.ChipRemove.Props;
  }
}

export default Combobox;
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

Simulate a remote search by fetching items after a small delay and allow users to select more than one option. Use `multiple` with `value`/`onValueChange` and `onInputValueChange` to drive the async query. Type at least two characters (e.g. `ja`, `py`, `ru`).

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