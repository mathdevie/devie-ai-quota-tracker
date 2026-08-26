# <Menu />

The Menu component extends [ Base UI's Menu ](https://base-ui.com/react/components/menu) with polished default styles and full keyboard navigation. We added custom subcomponents: `SubmenuChevron` for submenu trigger icons, and `Shortcut` for displaying keyboard shortcuts alongside menu items.

Built on [Base UI](https://base-ui.com/react/components/menu).

## Installation

### menu.module.scss

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

    .group {
        // Group is a semantic wrapper, minimal styling
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

### menu.tsx

```tsx
// https://devie-ui.com/components/menu
// https://base-ui.com/react/components/menu

import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./Menu.module.scss";

const Root = BaseMenu.Root;

function Trigger({ className, ...props }: BaseMenu.Trigger.Props) {
  return (
    <BaseMenu.Trigger className={clsx(styles.trigger, className)} {...props} />
  );
}

const Portal = BaseMenu.Portal;

const Backdrop = BaseMenu.Backdrop;

function Positioner({ className, ...props }: BaseMenu.Positioner.Props) {
  return (
    <BaseMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseMenu.Popup.Props) {
  return (
    <BaseMenu.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Viewport({ className, ...props }: BaseMenu.Viewport.Props) {
  return (
    <BaseMenu.Viewport className={clsx(styles.viewport, className)} {...props} />
  );
}

function Arrow({ className, ...props }: BaseMenu.Arrow.Props) {
  return (
    <BaseMenu.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseMenu.Item.Props) {
  return <BaseMenu.Item className={clsx(styles.item, className)} {...props} />;
}

function LinkItem({ className, ...props }: BaseMenu.LinkItem.Props) {
  return (
    <BaseMenu.LinkItem className={clsx(styles.item, className)} {...props} />
  );
}

function Separator({ className, ...props }: BaseMenu.Separator.Props) {
  return (
    <BaseMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Group({ className, ...props }: BaseMenu.Group.Props) {
  return (
    <BaseMenu.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: BaseMenu.GroupLabel.Props) {
  return (
    <BaseMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function RadioGroup({ className, ...props }: BaseMenu.RadioGroup.Props) {
  return (
    <BaseMenu.RadioGroup
      className={clsx(styles.radioGroup, className)}
      {...props}
    />
  );
}

function RadioItem({ className, ...props }: BaseMenu.RadioItem.Props) {
  return (
    <BaseMenu.RadioItem
      className={clsx(styles.item, styles.radioItem, className)}
      {...props}
    />
  );
}

function RadioItemIndicator({
  className,
  children,
  ...props
}: BaseMenu.RadioItemIndicator.Props) {
  return (
    <BaseMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: BaseMenu.CheckboxItem.Props) {
  return (
    <BaseMenu.CheckboxItem
      className={clsx(styles.item, styles.checkboxItem, className)}
      {...props}
    />
  );
}

function CheckboxItemIndicator({
  className,
  children,
  ...props
}: BaseMenu.CheckboxItemIndicator.Props) {
  return (
    <BaseMenu.CheckboxItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Check size={16} strokeWidth={1.5} />}
    </BaseMenu.CheckboxItemIndicator>
  );
}

const SubmenuRoot = BaseMenu.SubmenuRoot;

function SubmenuTrigger({
  className,
  ...props
}: BaseMenu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
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

const Menu = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Viewport,
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

namespace Menu {
  export namespace Root {
    export type Props = BaseMenu.Root.Props;
    export type Actions = BaseMenu.Root.Actions;
  }
  export namespace Trigger {
    export type Props = BaseMenu.Trigger.Props;
    export type State = BaseMenu.Trigger.State;
  }
  export namespace Portal {
    export type Props = BaseMenu.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseMenu.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BaseMenu.Positioner.Props;
    export type State = BaseMenu.Positioner.State;
  }
  export namespace Popup {
    export type Props = BaseMenu.Popup.Props;
  }
  export namespace Viewport {
    export type Props = BaseMenu.Viewport.Props;
  }
  export namespace Item {
    export type Props = BaseMenu.Item.Props;
    export type State = BaseMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = BaseMenu.LinkItem.Props;
    export type State = BaseMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = BaseMenu.Separator.Props;
  }
  export namespace Group {
    export type Props = BaseMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = BaseMenu.GroupLabel.Props;
  }
  export namespace RadioGroup {
    export type Props = BaseMenu.RadioGroup.Props;
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = BaseMenu.RadioItem.Props;
    export type State = BaseMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = BaseMenu.RadioItemIndicator.Props;
  }
  export namespace CheckboxItem {
    export type Props = BaseMenu.CheckboxItem.Props;
    export type State = BaseMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = BaseMenu.CheckboxItemIndicator.Props;
  }
  export namespace SubmenuRoot {
    export type Props = BaseMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = BaseMenu.SubmenuTrigger.Props;
    export type State = BaseMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = BaseMenu.Arrow.Props;
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

export default Menu;
```

## Use Cases

### Simple menu

A basic menu with items and a separator. Use the `disabled` prop to disable specific items.

```tsx
<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (Simple)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Item>New File</Menu.Item>
        <Menu.Item>Open...</Menu.Item>
        <Menu.Item>Save</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Export</Menu.Item>
        <Menu.Item disabled>Print</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

### With link items

Use `LinkItem` for menu items that navigate to a URL. It renders an `<a>` element and supports the `closeOnClick` prop to close the menu when clicked.

```tsx
<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (With Links)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Item>New File</Menu.Item>
        <Menu.Item>Open...</Menu.Item>
        <Menu.Separator />
        <Menu.LinkItem
          href="https://github.com"
          closeOnClick
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to GitHub
        </Menu.LinkItem>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

### With submenu

Use `SubmenuRoot`, `SubmenuTrigger`, and `SubmenuChevron` to create nested menus.

```tsx
<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (With Submenu)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Item>Undo</Menu.Item>
        <Menu.Item>Redo</Menu.Item>
        <Menu.Separator />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger>
            Find and Replace
            <Menu.SubmenuChevron />
          </Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup>
                <Menu.Item>Find...</Menu.Item>
                <Menu.Item>Find Next</Menu.Item>
                <Menu.Item>Find Previous</Menu.Item>
                <Menu.Separator />
                <Menu.Item>Replace...</Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>
        <Menu.Separator />
        <Menu.Item>Cut</Menu.Item>
        <Menu.Item>Copy</Menu.Item>
        <Menu.Item>Paste</Menu.Item>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

### With groups

Use `Group` and `GroupLabel` to organize items into labeled sections.

```tsx
<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (With Groups)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>Layout</Menu.GroupLabel>
          <Menu.Item>Full Screen</Menu.Item>
          <Menu.Item>Split View</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>Panels</Menu.GroupLabel>
          <Menu.Item>Explorer</Menu.Item>
          <Menu.Item>Terminal</Menu.Item>
          <Menu.Item>Output</Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

### With checkbox items

Use `CheckboxItem` and `CheckboxItemIndicator` for toggleable options within the menu.

```tsx
const [showLineNumbers, setShowLineNumbers] = useState(true);
const [wordWrap, setWordWrap] = useState(false);
const [minimap, setMinimap] = useState(true);

<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (With Checkbox Items)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>Editor Options</Menu.GroupLabel>
          <Menu.CheckboxItem
            checked={showLineNumbers}
            onCheckedChange={setShowLineNumbers}
          >
            <Menu.CheckboxItemIndicator />
            Show Line Numbers
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            checked={wordWrap}
            onCheckedChange={setWordWrap}
          >
            <Menu.CheckboxItemIndicator />
            Word Wrap
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            checked={minimap}
            onCheckedChange={setMinimap}
          >
            <Menu.CheckboxItemIndicator />
            Show Minimap
          </Menu.CheckboxItem>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

### With radio items

Use `RadioGroup`, `RadioItem`, and `RadioItemIndicator` for single-selection options.

```tsx
const [sortBy, setSortBy] = useState("name");

<Menu.Root>
  <Menu.Trigger render={<Button variant="secondary" />}>
    Open Menu (With Radio Items)
  </Menu.Trigger>
  <Menu.Portal>
    <Menu.Positioner sideOffset={8}>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>Sort By</Menu.GroupLabel>
          <Menu.RadioGroup value={sortBy} onValueChange={setSortBy}>
            <Menu.RadioItem value="name">
              <Menu.RadioItemIndicator />
              Name
            </Menu.RadioItem>
            <Menu.RadioItem value="date">
              <Menu.RadioItemIndicator />
              Date Modified
            </Menu.RadioItem>
            <Menu.RadioItem value="size">
              <Menu.RadioItemIndicator />
              Size
            </Menu.RadioItem>
            <Menu.RadioItem value="type">
              <Menu.RadioItemIndicator />
              Type
            </Menu.RadioItem>
          </Menu.RadioGroup>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
</Menu.Root>
```

---

*Generated from [devie-ui.com/components/menu](https://devie-ui.com/components/menu)*