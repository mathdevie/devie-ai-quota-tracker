# <Select />

The Select component provides a dropdown menu for selecting a single value from a list of options. It extends [ Base UI's Select ](https://base-ui.com/react/components/select) with consistent styling that matches the design system.

Built on [Base UI](https://base-ui.com/react/components/select).

## Installation

### select.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        padding: calc($devie__spacing__x1 - 1px) $devie__spacing__x1;
        border: 1px solid $devie__color__line;
        box-sizing: border-box;
        gap: $devie__spacing__x1;
        color: $devie__color__text;
        cursor: pointer;

        &:hover:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &:focus-visible {
            border-color: $devie__color__primary;
        }

        &[data-popup-open] {
            border-color: $devie__color__primary;
        }

        &[data-disabled] {
            cursor: not-allowed;
            border-color: #{devie-disabled-color($devie__color__line)};
            color: #{devie-disabled-color($devie__color__text)};
        }
    }

    .value {
        &[data-placeholder] {
            color: $devie__color__text-sub;
        }

        [data-disabled] & {
            color: #{devie-disabled-color($devie__color__text-sub)};
        }
    }

    .icon {
        display: flex;
        transition: transform 0.2s ease;
        color: $devie__color__text-sub;

        [data-popup-open] & {
            transform: rotate(180deg);
        }

        [data-disabled] & {
            color: #{devie-disabled-color($devie__color__text-sub)};
        }
    }

    .contentLike {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
    }

    .popup {
        box-sizing: border-box;
        background-color: $devie__color__background;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        padding: $devie__spacing__x05;
        transition: none;

        &[data-side='none'] {
            scroll-padding-block: $devie__spacing__x2;
        }
    }

    .list {
        box-sizing: border-box;
        position: relative;
        overflow-y: auto;
        max-height: var(--available-height);
    }

    .item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $devie__spacing__x1;
        padding: $devie__spacing__x05 $devie__spacing__x1;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        cursor: pointer;
        color: $devie__color__text;
        min-width: var(--anchor-width);
        scroll-margin-block: $devie__spacing__x05;
        outline: 0;
        font-size: $devie__font-size__small;
        user-select: none;

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

    .itemIndicator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        color: $devie__color__primary;
        flex-shrink: 0;
    }

    .itemText {
        text-align: left;
        flex: 1;
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

    .scrollArrow {
        width: 100%;
        background: canvas;
        z-index: 1;
        text-align: center;
        cursor: default;
        border-radius: $devie__radius;
        height: $devie__spacing__x3;
        font-size: $devie__font-size__small;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $devie__color__text-sub;

        &::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
        }

        &[data-direction='up'] {
            &::before {
                top: -100%;
            }
        }

        &[data-direction='down'] {
            bottom: 0;

            &::before {
                bottom: -100%;
            }
        }
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
}
```

### select.tsx

```tsx
// https://devie-ui.com/components/select
// https://base-ui.com/react/components/select

import { Select as BaseSelect } from "@base-ui/react/select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./Select.module.scss";

const Root = BaseSelect.Root;

function Label({ className, ...props }: BaseSelect.Label.Props) {
  return <BaseSelect.Label className={clsx(styles.label, className)} {...props} />;
}

function Trigger({ className, ...props }: BaseSelect.Trigger.Props) {
  return (
    <BaseSelect.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

function Value({ className, ...props }: BaseSelect.Value.Props) {
  return (
    <BaseSelect.Value className={clsx(styles.value, className)} {...props} />
  );
}

function Icon({ className, children, ...props }: BaseSelect.Icon.Props) {
  return (
    <BaseSelect.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseSelect.Icon>
  );
}

const Portal = BaseSelect.Portal;

function Positioner({ className, ...props }: BaseSelect.Positioner.Props) {
  return (
    <BaseSelect.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseSelect.Popup.Props) {
  return (
    <BaseSelect.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function List({ className, ...props }: BaseSelect.List.Props) {
  return (
    <BaseSelect.List className={clsx(styles.list, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseSelect.Item.Props) {
  return (
    <BaseSelect.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: BaseSelect.ItemIndicator.Props) {
  return (
    <BaseSelect.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseSelect.ItemIndicator>
  );
}

function ItemText({ className, ...props }: BaseSelect.ItemText.Props) {
  return (
    <BaseSelect.ItemText
      className={clsx(styles.itemText, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseSelect.Arrow.Props) {
  return (
    <BaseSelect.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function ScrollUpArrow({
  className,
  ...props
}: BaseSelect.ScrollUpArrow.Props) {
  return (
    <BaseSelect.ScrollUpArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

function ScrollDownArrow({
  className,
  ...props
}: BaseSelect.ScrollDownArrow.Props) {
  return (
    <BaseSelect.ScrollDownArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

const Backdrop = BaseSelect.Backdrop;

function Group({ className, ...props }: BaseSelect.Group.Props) {
  return (
    <BaseSelect.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseSelect.GroupLabel.Props) {
  return (
    <BaseSelect.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseSelect.Separator.Props) {
  return (
    <BaseSelect.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Select = {
  Root,
  Label,
  Trigger,
  Value,
  Icon,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  List,
  Arrow,
  ScrollUpArrow,
  ScrollDownArrow,
  Item,
  ItemIndicator,
  ItemText,
  Group,
  GroupLabel,
  Separator,
};

namespace Select {
  export namespace Root {
    export type Props<Value> = BaseSelect.Root.Props<Value>;
    export type ChangeEventDetails = BaseSelect.Root.ChangeEventDetails;
    export type ChangeEventReason = BaseSelect.Root.ChangeEventReason;
  }
  export namespace Label {
    export type Props = BaseSelect.Label.Props;
  }
  export namespace Trigger {
    export type Props = BaseSelect.Trigger.Props;
    export type State = BaseSelect.Trigger.State;
  }
  export namespace Value {
    export type Props = React.ComponentProps<typeof BaseSelect.Value>;
  }
  export namespace Icon {
    export type Props = BaseSelect.Icon.Props;
  }
  export namespace Portal {
    export type Props = BaseSelect.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseSelect.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseSelect.Positioner.Props;
    export type State = BaseSelect.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseSelect.Popup.Props;
  }
  export namespace List {
    export type Props = BaseSelect.List.Props;
  }
  export namespace Arrow {
    export type Props = BaseSelect.Arrow.Props;
  }
  export namespace ScrollUpArrow {
    export type Props = BaseSelect.ScrollUpArrow.Props;
  }
  export namespace ScrollDownArrow {
    export type Props = BaseSelect.ScrollDownArrow.Props;
  }
  export namespace Item {
    export type Props = BaseSelect.Item.Props;
    export type State = BaseSelect.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = BaseSelect.ItemIndicator.Props;
  }
  export namespace ItemText {
    export type Props = BaseSelect.ItemText.Props;
  }
  export namespace Group {
    export type Props = BaseSelect.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseSelect.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = BaseSelect.Separator.Props;
  }
}

export default Select;
```

## Use Cases

### Simple select

A basic select with a placeholder and a list of options. The trigger shows the selected value or the placeholder when nothing is selected.

```tsx
const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
  { value: "mango", label: "Mango" },
];

<Select.Root items={fruits}>
  <Select.Trigger>
    <Select.Value placeholder="Select a fruit..." />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List>
          {fruits.map((fruit) => (
            <Select.Item key={fruit.value} value={fruit.value}>
              <Select.ItemText>{fruit.label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

### Grouped options

Use `Select.Group` and `Select.GroupLabel` to organize options into logical groups. Add `Select.Separator` between groups for visual distinction.

```tsx
const tools = [
  { value: "figma", label: "Figma" },
  { value: "sketch", label: "Sketch" },
  { value: "framer", label: "Framer" },
  { value: "vscode", label: "VS Code" },
  { value: "cursor", label: "Cursor" },
  { value: "webstorm", label: "WebStorm" },
];

<Select.Root items={tools}>
  <Select.Trigger>
    <Select.Value placeholder="Select a tool..." />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List>
          <Select.Group>
            <Select.GroupLabel>Design</Select.GroupLabel>
            <Select.Item value="figma">
              <Select.ItemText>Figma</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="sketch">
              <Select.ItemText>Sketch</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="framer">
              <Select.ItemText>Framer</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.GroupLabel>Development</Select.GroupLabel>
            <Select.Item value="vscode">
              <Select.ItemText>VS Code</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="cursor">
              <Select.ItemText>Cursor</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
            <Select.Item value="webstorm">
              <Select.ItemText>WebStorm</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          </Select.Group>
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

### Disabled state

The select can be disabled entirely using the `disabled` prop on the Root, or individual items can be disabled using the `disabled` prop on each Item.

```tsx
const options = [
  { value: "available", label: "Available option" },
  { value: "disabled1", label: "Disabled option" },
  { value: "another", label: "Another option" },
  { value: "disabled2", label: "Also disabled" },
];

// Disabled select
<Select.Root items={options} disabled>
  <Select.Trigger>
    <Select.Value placeholder="Disabled select" />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List>
          {options.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              <Select.ItemText>{option.label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>

// Disabled items
<Select.Root items={options}>
  <Select.Trigger>
    <Select.Value placeholder="Disabled items" />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.List>
          <Select.Item value="available">
            <Select.ItemText>Available option</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
          <Select.Item value="disabled1" disabled>
            <Select.ItemText>Disabled option</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
          <Select.Item value="another">
            <Select.ItemText>Another option</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
          <Select.Item value="disabled2" disabled>
            <Select.ItemText>Also disabled</Select.ItemText>
            <Select.ItemIndicator />
          </Select.Item>
        </Select.List>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

---

*Generated from [devie-ui.com/components/select](https://devie-ui.com/components/select)*