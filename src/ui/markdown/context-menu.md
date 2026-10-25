# <ContextMenu />

A menu that appears at the pointer on right click or long press. The ContextMenu component extends [Base UI's ContextMenu](https://base-ui.com/react/components/context-menu). We added custom subcomponents: `SubmenuChevron` for submenu trigger icons, and `Shortcut` for displaying keyboard shortcuts alongside menu items.

Built on [Base UI](https://base-ui.com/react/components/context-menu).

## Installation

### ContextMenu.tsx

```tsx
// https://devie-ui.com/components/context-menu
// https://base-ui.com/react/components/context-menu

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./ContextMenu.module.scss";

const Root = BaseContextMenu.Root;

const Trigger = BaseContextMenu.Trigger;

const Portal = BaseContextMenu.Portal;

const Backdrop = BaseContextMenu.Backdrop;

const Positioner = BaseContextMenu.Positioner;

function Popup({ className, ...props }: ContextMenu.Popup.Props) {
  return (
    <BaseContextMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: ContextMenu.Item.Props) {
  return (
    <BaseContextMenu.Item className={clsx(styles.item, className)} {...props} />
  );
}

function LinkItem({ className, ...props }: ContextMenu.LinkItem.Props) {
  return (
    <BaseContextMenu.LinkItem
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: ContextMenu.Separator.Props) {
  return (
    <BaseContextMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Group = BaseContextMenu.Group;

function GroupLabel({ className, ...props }: ContextMenu.GroupLabel.Props) {
  return (
    <BaseContextMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

const RadioGroup = BaseContextMenu.RadioGroup;

function RadioItem({ className, ...props }: ContextMenu.RadioItem.Props) {
  return (
    <BaseContextMenu.RadioItem
      className={clsx(styles.item, styles.radioItem, className)}
      {...props}
    />
  );
}

function RadioItemIndicator({
  className,
  children,
  ...props
}: ContextMenu.RadioItemIndicator.Props) {
  return (
    <BaseContextMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseContextMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: ContextMenu.CheckboxItem.Props) {
  return (
    <BaseContextMenu.CheckboxItem
      className={clsx(styles.item, styles.checkboxItem, className)}
      {...props}
    />
  );
}

function CheckboxItemIndicator({
  className,
  children,
  ...props
}: ContextMenu.CheckboxItemIndicator.Props) {
  return (
    <BaseContextMenu.CheckboxItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseContextMenu.CheckboxItemIndicator>
  );
}

const SubmenuRoot = BaseContextMenu.SubmenuRoot;

function SubmenuTrigger({
  className,
  ...props
}: ContextMenu.SubmenuTrigger.Props) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: ContextMenu.Arrow.Props) {
  return (
    <BaseContextMenu.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseContextMenu.Arrow>
  );
}

function SubmenuChevron({
  className,
  children,
  ...props
}: ContextMenu.SubmenuChevron.Props) {
  return (
    <div className={clsx(styles.submenuChevron, className)} {...props}>
      {children || <ChevronRight size={16} />}
    </div>
  );
}

function Shortcut({ className, ...props }: ContextMenu.Shortcut.Props) {
  return <kbd className={clsx(styles.shortcut, className)} {...props} />;
}

const ContextMenu = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Item,
  LinkItem,
  Separator,
  Group,
  GroupLabel,
  RadioGroup,
  RadioItem,
  RadioItemIndicator,
  CheckboxItem,
  CheckboxItemIndicator,
  SubmenuRoot,
  SubmenuTrigger,
  SubmenuChevron,
  Shortcut,
};

namespace ContextMenu {
  export namespace Root {
    export type Props = BaseContextMenu.Root.Props;
    export type Actions = BaseContextMenu.Root.Actions;
  }
  export namespace Trigger {
    export type Props = BaseContextMenu.Trigger.Props;
    export type State = BaseContextMenu.Trigger.State;
  }
  export namespace Portal {
    export type Props = BaseContextMenu.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseContextMenu.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseContextMenu.Positioner.Props;
    export type State = BaseContextMenu.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BaseContextMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseContextMenu.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = Omit<BaseContextMenu.LinkItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = Omit<BaseContextMenu.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = BaseContextMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseContextMenu.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace RadioGroup {
    export type Props = BaseContextMenu.RadioGroup.Props;
    export type ChangeEventDetails =
      BaseContextMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = Omit<BaseContextMenu.RadioItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseContextMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = Omit<
      BaseContextMenu.RadioItemIndicator.Props,
      "className"
    > & { className?: string };
  }
  export namespace CheckboxItem {
    export type Props = Omit<
      BaseContextMenu.CheckboxItem.Props,
      "className"
    > & { className?: string };
    export type State = BaseContextMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = Omit<
      BaseContextMenu.CheckboxItemIndicator.Props,
      "className"
    > & { className?: string };
  }
  export namespace SubmenuRoot {
    export type Props = BaseContextMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = Omit<
      BaseContextMenu.SubmenuTrigger.Props,
      "className"
    > & { className?: string };
    export type State = BaseContextMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = Omit<BaseContextMenu.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace SubmenuChevron {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Shortcut {
    export type Props = React.ComponentProps<"kbd">;
  }
}

export default ContextMenu;

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

### ContextMenu.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .popup {
        outline: 0;
        line-height: $devie__spacing__x2;
        min-width: 180px;
        background-color: $devie__color__background-raised;
        border-radius: $devie__radius;
        padding: $devie__spacing__x05;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
    }

    .item {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
        padding: $devie__spacing__x1;
        user-select: none;
        outline: none;
        color: $devie__color__text;
        font-size: $devie__font-size__normal;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        transition: none;

        > svg {
            flex-shrink: 0;
            color: $devie__color__text-sub;
        }

        &:hover:not([data-disabled]),
        &[data-highlighted]:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};

            > svg {
                color: inherit;
            }
        }

        &[data-popup-open] {
            background: #{devie-hover-color($devie__color__background)};
        }
    }

    .separator {
        height: 1px;
        background-color: $devie__color__line;
        margin: $devie__spacing__x05 0;
    }

    .groupLabel {
        padding: $devie__spacing__x05 $devie__spacing__x1;
        font-weight: 600;
        color: $devie__color__text-sub;
        font-size: $devie__font-size__small;
        user-select: none;
    }

    .radioItem {
        padding-left: $devie__spacing__x3;
        position: relative;
    }

    .checkboxItem {
        padding-left: $devie__spacing__x4;
        position: relative;
    }

    .itemIndicator {
        position: absolute;
        left: $devie__spacing__x1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $devie__color__primary;
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

    .submenuChevron {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        color: $devie__color__text-sub;
        flex-shrink: 0;
    }

    .shortcut {
        margin-left: auto;
        flex-shrink: 0;
        font-family: $devie__font-family;
        font-size: $devie__font-size__small;
        font-weight: 400;
        line-height: $devie__spacing__x2;
        color: $devie__color__text-sub;
        background: none;
        border: none;
        padding: 0;
    }
}
```

## Use Cases

### Simple context menu

A basic context menu with items and a separator. Use the `disabled` prop to disable specific items.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item>Cut</ContextMenu.Item>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Item>Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item disabled>Delete</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With link items

Use `LinkItem` for context menu items that navigate to a URL. It renders an `<a>` element and supports the `closeOnClick` prop to close the menu when clicked.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger render={<div>Right click here</div>} />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item>Cut</ContextMenu.Item>
        <ContextMenu.Item>Copy</ContextMenu.Item>
        <ContextMenu.Item>Paste</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.LinkItem
          href="https://github.com"
          closeOnClick
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to GitHub
        </ContextMenu.LinkItem>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With keyboard shortcuts

Use `Shortcut` to display keyboard shortcut hints alongside menu items.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item>
          Undo
          <ContextMenu.Shortcut>⌘Z</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>
          Redo
          <ContextMenu.Shortcut>⇧⌘Z</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>
          Cut
          <ContextMenu.Shortcut>⌘X</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>
          Copy
          <ContextMenu.Shortcut>⌘C</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Item>
          Paste
          <ContextMenu.Shortcut>⌘V</ContextMenu.Shortcut>
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item>
          Select All
          <ContextMenu.Shortcut>⌘A</ContextMenu.Shortcut>
        </ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With submenu

Use `SubmenuRoot`, `SubmenuTrigger`, and `SubmenuChevron` to create nested menus.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Item>New File</ContextMenu.Item>
        <ContextMenu.Item>New Folder</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.SubmenuRoot>
          <ContextMenu.SubmenuTrigger>
            Share
            <ContextMenu.SubmenuChevron />
          </ContextMenu.SubmenuTrigger>
          <ContextMenu.Portal>
            <ContextMenu.Positioner>
              <ContextMenu.Popup>
                <ContextMenu.Item>Email</ContextMenu.Item>
                <ContextMenu.Item>Copy Link</ContextMenu.Item>
                <ContextMenu.Item>Social Media</ContextMenu.Item>
              </ContextMenu.Popup>
            </ContextMenu.Positioner>
          </ContextMenu.Portal>
        </ContextMenu.SubmenuRoot>
        <ContextMenu.Separator />
        <ContextMenu.Item>Rename</ContextMenu.Item>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With groups

Use `Group` and `GroupLabel` to organize items into labeled sections.

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>Edit</ContextMenu.GroupLabel>
          <ContextMenu.Item>Cut</ContextMenu.Item>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Item>Paste</ContextMenu.Item>
        </ContextMenu.Group>
        <ContextMenu.Separator />
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>View</ContextMenu.GroupLabel>
          <ContextMenu.Item>Zoom In</ContextMenu.Item>
          <ContextMenu.Item>Zoom Out</ContextMenu.Item>
          <ContextMenu.Item>Reset Zoom</ContextMenu.Item>
        </ContextMenu.Group>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With checkbox items

Use `CheckboxItem` and `CheckboxItemIndicator` for toggleable options within the menu.

```tsx
const [showHidden, setShowHidden] = useState(false);
const [showExtensions, setShowExtensions] = useState(true);

<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>View Options</ContextMenu.GroupLabel>
          <ContextMenu.CheckboxItem
            checked={showHidden}
            onCheckedChange={setShowHidden}
          >
            <ContextMenu.CheckboxItemIndicator />
            Show Hidden Files
          </ContextMenu.CheckboxItem>
          <ContextMenu.CheckboxItem
            checked={showExtensions}
            onCheckedChange={setShowExtensions}
          >
            <ContextMenu.CheckboxItemIndicator />
            Show Extensions
          </ContextMenu.CheckboxItem>
        </ContextMenu.Group>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

### With radio items

Use `RadioGroup`, `RadioItem`, and `RadioItemIndicator` for single-selection options.

```tsx
const [sortBy, setSortBy] = useState("name");

<ContextMenu.Root>
  <ContextMenu.Trigger
    render={<div>Right click here</div>}
  />
  <ContextMenu.Portal>
    <ContextMenu.Positioner>
      <ContextMenu.Popup>
        <ContextMenu.Group>
          <ContextMenu.GroupLabel>Sort By</ContextMenu.GroupLabel>
          <ContextMenu.RadioGroup value={sortBy} onValueChange={setSortBy}>
            <ContextMenu.RadioItem value="name">
              <ContextMenu.RadioItemIndicator />
              Name
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="date">
              <ContextMenu.RadioItemIndicator />
              Date Modified
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="size">
              <ContextMenu.RadioItemIndicator />
              Size
            </ContextMenu.RadioItem>
            <ContextMenu.RadioItem value="type">
              <ContextMenu.RadioItemIndicator />
              Type
            </ContextMenu.RadioItem>
          </ContextMenu.RadioGroup>
        </ContextMenu.Group>
      </ContextMenu.Popup>
    </ContextMenu.Positioner>
  </ContextMenu.Portal>
</ContextMenu.Root>
```

---

*Generated from [devie-ui.com/components/context-menu](https://devie-ui.com/components/context-menu)*