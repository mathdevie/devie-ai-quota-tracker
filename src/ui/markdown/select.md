# <Select />

A control for choosing one predefined value from a popup list. It extends [Base UI's Select](https://base-ui.com/react/components/select) with consistent styling that matches the design system.

Built on [Base UI](https://base-ui.com/react/components/select).

## Installation

### Select.tsx

```tsx
// https://devie-ui.com/components/select
// https://base-ui.com/react/components/select

import { Select as BaseSelect } from "@base-ui/react/select";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./Select.module.scss";

const Root = BaseSelect.Root;

function Label({ className, ...props }: Select.Label.Props) {
  return (
    <BaseSelect.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Trigger({ className, ...props }: Select.Trigger.Props) {
  return (
    <BaseSelect.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

function Value({ className, ...props }: Select.Value.Props) {
  return (
    <BaseSelect.Value className={clsx(styles.value, className)} {...props} />
  );
}

function Icon({ className, children, ...props }: Select.Icon.Props) {
  return (
    <BaseSelect.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={16} />}
    </BaseSelect.Icon>
  );
}

const Portal = BaseSelect.Portal;

const Positioner = BaseSelect.Positioner;

function Popup({ className, ...props }: Select.Popup.Props) {
  return (
    <BaseSelect.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function List({ className, ...props }: Select.List.Props) {
  return (
    <BaseSelect.List className={clsx(styles.list, className)} {...props} />
  );
}

function Item({ className, ...props }: Select.Item.Props) {
  return (
    <BaseSelect.Item className={clsx(styles.item, className)} {...props} />
  );
}

function ItemIndicator({
  className,
  children,
  ...props
}: Select.ItemIndicator.Props) {
  return (
    <BaseSelect.ItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseSelect.ItemIndicator>
  );
}

function ItemText({ className, ...props }: Select.ItemText.Props) {
  return (
    <BaseSelect.ItemText
      className={clsx(styles.itemText, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Select.Arrow.Props) {
  return (
    <BaseSelect.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseSelect.Arrow>
  );
}

function ScrollUpArrow({ className, ...props }: Select.ScrollUpArrow.Props) {
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
}: Select.ScrollDownArrow.Props) {
  return (
    <BaseSelect.ScrollDownArrow
      className={clsx(styles.scrollArrow, className)}
      {...props}
    />
  );
}

const Backdrop = BaseSelect.Backdrop;

function Group({ className, ...props }: Select.Group.Props) {
  return (
    <BaseSelect.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Select.GroupLabel.Props) {
  return (
    <BaseSelect.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Select.Separator.Props) {
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
    export type Props = Omit<BaseSelect.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseSelect.Trigger.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSelect.Trigger.State;
  }
  export namespace Value {
    export type Props = Omit<BaseSelect.Value.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseSelect.Icon.Props, "className"> & {
      className?: string;
    };
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
    export type Props = Omit<BaseSelect.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace List {
    export type Props = Omit<BaseSelect.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseSelect.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ScrollUpArrow {
    export type Props = Omit<BaseSelect.ScrollUpArrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ScrollDownArrow {
    export type Props = Omit<BaseSelect.ScrollDownArrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseSelect.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSelect.Item.State;
  }
  export namespace ItemIndicator {
    export type Props = Omit<BaseSelect.ItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace ItemText {
    export type Props = Omit<BaseSelect.ItemText.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseSelect.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseSelect.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseSelect.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Select;

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

### Select.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .label {
        line-height: $devie__spacing__x3;

        &[data-invalid] {
            color: $devie__color__danger;
        }
    }

    .trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        font-family: inherit;
        font-size: inherit;
        line-height: $devie__spacing__x3;
        border: 1px solid $devie__color__line;
        box-shadow: 0 1px 2px 0 rgb(9 9 11 / 12%);
        box-sizing: border-box;
        gap: $devie__spacing__x1;
        color: $devie__color__text;

        &:hover:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &:focus-visible {
            border-color: $devie__color__primary;
            outline: 0;
        }

        &[data-popup-open] {
            border-color: $devie__color__primary;
        }

        &[data-disabled] {
            cursor: not-allowed;
            border-color: #{devie-disabled-color($devie__color__line)};
            box-shadow: none;
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

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .popup {
        outline: 0;
        line-height: $devie__spacing__x2;
        box-sizing: border-box;
        background-color: $devie__color__background-raised;
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
        padding: $devie__spacing__x1;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        color: $devie__color__text;
        min-width: var(--anchor-width);
        scroll-margin-block: $devie__spacing__x05;
        outline: 0;
        font-size: $devie__font-size__normal;
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

    .scrollArrow {
        width: 100%;
        background: $devie__color__background-raised;
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
}
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