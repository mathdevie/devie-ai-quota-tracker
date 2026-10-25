# <Menu />

A list of actions in a popup, with keyboard navigation. The Menu component extends [Base UI's Menu](https://base-ui.com/react/components/menu). We added custom subcomponents: `SubmenuChevron` for submenu trigger icons, and `Shortcut` for displaying keyboard shortcuts alongside menu items.

Built on [Base UI](https://base-ui.com/react/components/menu).

## Installation

### Menu.tsx

```tsx
// https://devie-ui.com/components/menu
// https://base-ui.com/react/components/menu

import { Menu as BaseMenu } from "@base-ui/react/menu";
import clsx from "clsx";
import { Check, ChevronRight, Circle } from "lucide-react";
import type React from "react";
import styles from "./Menu.module.scss";

const Root = BaseMenu.Root;

const Trigger = BaseMenu.Trigger;

const Portal = BaseMenu.Portal;

const Backdrop = BaseMenu.Backdrop;

const Positioner = BaseMenu.Positioner;

function Popup({ className, ...props }: Menu.Popup.Props) {
  return (
    <BaseMenu.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Viewport({ className, ...props }: Menu.Viewport.Props) {
  return (
    <BaseMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: Menu.Item.Props) {
  return <BaseMenu.Item className={clsx(styles.item, className)} {...props} />;
}

function LinkItem({ className, ...props }: Menu.LinkItem.Props) {
  return (
    <BaseMenu.LinkItem className={clsx(styles.item, className)} {...props} />
  );
}

function Separator({ className, ...props }: Menu.Separator.Props) {
  return (
    <BaseMenu.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Group = BaseMenu.Group;

function GroupLabel({ className, ...props }: Menu.GroupLabel.Props) {
  return (
    <BaseMenu.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

const RadioGroup = BaseMenu.RadioGroup;

function RadioItem({ className, ...props }: Menu.RadioItem.Props) {
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
}: Menu.RadioItemIndicator.Props) {
  return (
    <BaseMenu.RadioItemIndicator
      className={clsx(styles.itemIndicator, className)}
      {...props}
    >
      {children || <Circle size={8} fill="currentColor" />}
    </BaseMenu.RadioItemIndicator>
  );
}

function CheckboxItem({ className, ...props }: Menu.CheckboxItem.Props) {
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
}: Menu.CheckboxItemIndicator.Props) {
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

function SubmenuTrigger({ className, ...props }: Menu.SubmenuTrigger.Props) {
  return (
    <BaseMenu.SubmenuTrigger
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Menu.Arrow.Props) {
  return (
    <BaseMenu.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseMenu.Arrow>
  );
}

function SubmenuChevron({
  className,
  children,
  ...props
}: Menu.SubmenuChevron.Props) {
  return (
    <div className={clsx(styles.submenuChevron, className)} {...props}>
      {children || <ChevronRight size={16} />}
    </div>
  );
}

function Shortcut({ className, ...props }: Menu.Shortcut.Props) {
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
    export type Props = Omit<BaseMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseMenu.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseMenu.Item.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.Item.State;
  }
  export namespace LinkItem {
    export type Props = Omit<BaseMenu.LinkItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.LinkItem.State;
  }
  export namespace Separator {
    export type Props = Omit<BaseMenu.Separator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = BaseMenu.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Omit<BaseMenu.GroupLabel.Props, "className"> & {
      className?: string;
    };
  }
  export namespace RadioGroup {
    export type Props = BaseMenu.RadioGroup.Props;
    export type ChangeEventDetails = BaseMenu.RadioGroup.ChangeEventDetails;
  }
  export namespace RadioItem {
    export type Props = Omit<BaseMenu.RadioItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.RadioItem.State;
  }
  export namespace RadioItemIndicator {
    export type Props = Omit<BaseMenu.RadioItemIndicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace CheckboxItem {
    export type Props = Omit<BaseMenu.CheckboxItem.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.CheckboxItem.State;
  }
  export namespace CheckboxItemIndicator {
    export type Props = Omit<
      BaseMenu.CheckboxItemIndicator.Props,
      "className"
    > & {
      className?: string;
    };
  }
  export namespace SubmenuRoot {
    export type Props = BaseMenu.SubmenuRoot.Props;
  }
  export namespace SubmenuTrigger {
    export type Props = Omit<BaseMenu.SubmenuTrigger.Props, "className"> & {
      className?: string;
    };
    export type State = BaseMenu.SubmenuTrigger.State;
  }
  export namespace Arrow {
    export type Props = Omit<BaseMenu.Arrow.Props, "className"> & {
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

export default Menu;

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

### Menu.module.scss

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

    .viewport {
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
        <Menu.Item>
          <FilePlus size={16} />
          New File
        </Menu.Item>
        <Menu.Item>
          <FolderOpen size={16} />
          Open...
        </Menu.Item>
        <Menu.Item>
          <Save size={16} />
          Save
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item>
          <Download size={16} />
          Export
        </Menu.Item>
        <Menu.Item disabled>
          <Printer size={16} />
          Print
        </Menu.Item>
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