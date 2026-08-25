# <ContextMenu />

The ContextMenu component extends [ Base UI's ContextMenu ](https://base-ui.com/react/components/context-menu) with polished default styles. It displays a menu of contextual actions triggered by right-clicking (or long-pressing on touch devices) on an element. We added custom subcomponents: `SubmenuChevron` for submenu trigger icons, and `Shortcut` for displaying keyboard shortcuts alongside menu items.

Built on [Base UI](https://base-ui.com/react/components/context-menu).

## Installation

### context-menu.tsx

```tsx
// https://devie-ui.com/components/context-menu
// https://base-ui.com/react/components/context-menu

import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./ContextMenu.module.scss";

const Root = BaseContextMenu.Root;

function Trigger({ className, ...props }: BaseContextMenu.Trigger.Props) {
  return (
    <BaseContextMenu.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseContextMenu.Portal;

const Backdrop = BaseContextMenu.Backdrop;

function Positioner({ className, ...props }: BaseContextMenu.Positioner.Props) {
  return (
    <BaseContextMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseContextMenu.Popup.Props) {
  return (
    <BaseContextMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseContextMenu.Arrow.Props) {
  return (
    <BaseContextMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: BaseContextMenu.Item.Props) {
  return (
    <BaseContextMenu.Item className={clsx(styles.item, className)} {...props} />
  );
}

function LinkItem({ className, ...props }: BaseContextMenu.LinkItem.Props) {
  return (
    <BaseContextMenu.LinkItem
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: BaseContextMenu.Separator.Props) {
  return (
    <BaseContextMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseContextMenu.Group.Props) {
  return (
    <BaseContextMenu.Group
      className={clsx(styles.group, className)}
      {...props}
    />
  );
}

function GroupLabel({ className, ...props }: BaseContextMenu.GroupLabel.Props) {
  return (
    <BaseContextMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function RadioGroup({ className, ...props }: BaseContextMenu.RadioGroup.Props) {
  return (
    <BaseContextMenu.RadioGroup
      className={clsx(styles.radioGroup, className)}
      {...props}
    />
  );
}

function RadioItem({ className, ...props }: BaseContextMenu.RadioItem.Props) {
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
}: BaseContextMenu.RadioItemIndicator.Props) {
  return (
    <BaseContextMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseContextMenu.RadioItemIndicator>
  );
}

function CheckboxItem({
  className,
  ...props
}: BaseContextMenu.CheckboxItem.Props) {
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
}: BaseContextMenu.CheckboxItemIndicator.Props) {
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
}: BaseContextMenu.SubmenuTrigger.Props) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={clsx(styles.item, styles.submenuTrigger, className)}
      {...props}
    />
  );
}

interface SubmenuChevronProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

function SubmenuChevron({
  className,
  children,
  ...props
}: SubmenuChevronProps) {
  return (
    <div className={clsx(styles.submenuChevron, className)} {...props}>
      {children || <ChevronRight size={16} />}
    </div>
  );
}

interface ShortcutProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

function Shortcut({ className, ...props }: ShortcutProps) {
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
  }
  export namespace Trigger {
    export type Props = BaseContextMenu.Trigger.Props;
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
    export type Props = BaseContextMenu.Popup.Props;
  }
  export namespace Item {
    export type Props = BaseContextMenu.Item.Props;
    export type State = BaseContextMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = BaseContextMenu.LinkItem.Props;
    export type State = BaseContextMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = BaseContextMenu.Separator.Props;
  }
  export namespace Group {
    export type Props = BaseContextMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseContextMenu.GroupLabel.Props;
  }
  export namespace RadioGroup {
    export type Props = BaseContextMenu.RadioGroup.Props;
    export type ChangeEventDetails =
      BaseContextMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = BaseContextMenu.RadioItem.Props;
    export type State = BaseContextMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = BaseContextMenu.RadioItemIndicator.Props;
  }
  export namespace CheckboxItem {
    export type Props = BaseContextMenu.CheckboxItem.Props;
    export type State = BaseContextMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = BaseContextMenu.CheckboxItemIndicator.Props;
  }
  export namespace SubmenuRoot {
    export type Props = BaseContextMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = BaseContextMenu.SubmenuTrigger.Props;
    export type State = BaseContextMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = BaseContextMenu.Arrow.Props;
  }
  export namespace SubmenuChevron {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
      children?: React.ReactNode;
    }
  }
  export namespace Shortcut {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
}

export default ContextMenu;
```

### context-menu.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .popup {
        min-width: 180px;
        background-color: $devie__color__background;
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
        padding: $devie__spacing__x05 $devie__spacing__x1;
        user-select: none;
        outline: none;
        color: $devie__color__text;
        cursor: pointer;
        font-size: $devie__font-size__small;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        transition: none;

        &:hover:not([data-disabled]),
        &[data-highlighted]:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
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
        font-weight: 500;
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
        fill: $devie__color__background;
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
        line-height: 1.2;
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