# <NavigationMenu />

The NavigationMenu component extends [Base UI's NavigationMenu](https://base-ui.com/react/components/navigation-menu). It provides a collection of links and menus for website navigation, with support for hover-triggered dropdowns, keyboard navigation, and accessibility features.

Built on [Base UI](https://base-ui.com/react/components/navigation-menu).

## Installation

### NavigationMenu.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .list {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .item {
        position: relative;
    }

    .trigger {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        border: none;
        background: transparent;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        cursor: pointer;
        border-radius: $devie__radius;
        outline: none;
        transition: background 150ms ease, color 150ms ease;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-popup-open] {
            background: #{devie-hover-color($devie__color__background)};
            color: $devie__color__primary;
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 2px;
        }
    }

    .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: $devie__color__text-sub;
        transition: transform 200ms ease;

        [data-popup-open] > & {
            transform: rotate(180deg);
        }
    }

    .content {
        padding: $devie__spacing__x2;
        transition: opacity 200ms ease;

        &[data-starting-style] {
            opacity: 0;
        }

        &[data-open] {
            opacity: 1;
        }

        &[data-ending-style] {
            opacity: 0;
        }
    }

    .link {
        display: block;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        color: $devie__color__text;
        text-decoration: none;
        font-size: $devie__font-size__normal;
        border-radius: $devie__radius;
        outline: none;
        transition: background 150ms ease, color 150ms ease;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-active] {
            color: $devie__color__primary;
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 2px;
        }
    }

    .backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: transparent;
    }

    .positioner {
        z-index: 10000;

        // Animate the positioner position when switching between triggers
        &:not([data-instant]) {
            transition: left 250ms ease;
        }
    }

    .popup {
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        animation-duration: 200ms;
        animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;

        &[data-starting-style] {
            opacity: 0;
            transform: translateY(-4px);
        }

        &[data-open] {
            opacity: 1;
            transform: translateY(0);
        }

        &[data-ending-style] {
            opacity: 0;
            transform: translateY(-4px);
        }
    }

    .viewport {
        // Viewport contains the content - let it size naturally
        overflow: hidden;
    }

    .arrow {
        fill: $devie__color__background;
        stroke: $devie__color__line;
        stroke-width: 1px;
        z-index: 1;

        // Smooth arrow position transition when switching between triggers
        &:not([data-instant]) {
            transition: left 250ms ease;
        }

        &[data-side='top'] {
            bottom: -8px;
            rotate: 180deg;
        }

        &[data-side='bottom'] {
            top: -8px;
            rotate: 0deg;
        }
    }
}
```

### NavigationMenu.tsx

```tsx
// https://base-ui.com/react/components/navigation-menu

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import styles from "./NavigationMenu.module.scss";

// Root component
const Root = BaseNavigationMenu.Root;

// List component
interface ListProps extends BaseNavigationMenu.List.Props {
  className?: string;
}

function List({ className, ...props }: ListProps) {
  return (
    <BaseNavigationMenu.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

// Item component
interface ItemProps extends BaseNavigationMenu.Item.Props {
  className?: string;
}

function Item({ className, ...props }: ItemProps) {
  return (
    <BaseNavigationMenu.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

// Trigger component
interface TriggerProps extends BaseNavigationMenu.Trigger.Props {
  className?: string;
}

function Trigger({ className, ...props }: TriggerProps) {
  return (
    <BaseNavigationMenu.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

// Icon component
interface IconProps extends BaseNavigationMenu.Icon.Props {
  className?: string;
  children?: React.ReactNode;
}

function Icon({ className, children, ...props }: IconProps) {
  return (
    <BaseNavigationMenu.Icon className={clsx(styles.icon, className)} {...props}>
      {children || <ChevronDown size={14} />}
    </BaseNavigationMenu.Icon>
  );
}

// Content component
interface ContentProps extends BaseNavigationMenu.Content.Props {
  className?: string;
}

function Content({ className, ...props }: ContentProps) {
  return (
    <BaseNavigationMenu.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

// Link component
interface LinkProps extends BaseNavigationMenu.Link.Props {
  className?: string;
}

function Link({ className, ...props }: LinkProps) {
  return (
    <BaseNavigationMenu.Link
      className={clsx(styles.link, className)}
      {...props}
    />
  );
}

// Backdrop component
interface BackdropProps extends BaseNavigationMenu.Backdrop.Props {
  className?: string;
}

function Backdrop({ className, ...props }: BackdropProps) {
  return (
    <BaseNavigationMenu.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

// Portal component
const Portal = BaseNavigationMenu.Portal;

// Positioner component
interface PositionerProps extends BaseNavigationMenu.Positioner.Props {
  className?: string;
}

function Positioner({ className, ...props }: PositionerProps) {
  return (
    <BaseNavigationMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

// Popup component
interface PopupProps extends BaseNavigationMenu.Popup.Props {
  className?: string;
}

function Popup({ className, ...props }: PopupProps) {
  return (
    <BaseNavigationMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

// Viewport component
interface ViewportProps extends BaseNavigationMenu.Viewport.Props {
  className?: string;
}

function Viewport({ className, ...props }: ViewportProps) {
  return (
    <BaseNavigationMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

// Arrow component
interface ArrowProps extends BaseNavigationMenu.Arrow.Props {
  className?: string;
}

function Arrow({ className, ...props }: ArrowProps) {
  return (
    <BaseNavigationMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    />
  );
}

const NavigationMenu = {
  Root,
  List,
  Item,
  Trigger,
  Icon,
  Content,
  Link,
  Backdrop,
  Portal,
  Positioner,
  Popup,
  Viewport,
  Arrow,
};

export default NavigationMenu;
```

## Use Cases

### Basic navigation with dropdowns

A horizontal navigation bar with dropdown panels that appear on hover. Use `Trigger` for items with dropdown content and `Link` for direct navigation links.

```tsx
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Trigger>
        Products
        <NavigationMenu.Icon />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <ul className={styles.linkList}>
          <li>
            <NavigationMenu.Link href="#">
              <strong>Analytics</strong>
              <span>Track and measure</span>
            </NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link href="#">
              <strong>Automation</strong>
              <span>Streamline workflows</span>
            </NavigationMenu.Link>
          </li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Link href="#">Pricing</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>

  <NavigationMenu.Portal>
    <NavigationMenu.Positioner sideOffset={8}>
      <NavigationMenu.Popup>
        <NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner>
  </NavigationMenu.Portal>
</NavigationMenu.Root>
```

### Links only

For simple navigation without dropdowns, use `Link` components directly inside each `Item`.

```tsx
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#">Home</NavigationMenu.Link>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#">About</NavigationMenu.Link>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#">Blog</NavigationMenu.Link>
    </NavigationMenu.Item>
    <NavigationMenu.Item>
      <NavigationMenu.Link href="#">Contact</NavigationMenu.Link>
    </NavigationMenu.Item>
  </NavigationMenu.List>
</NavigationMenu.Root>
```

---

*Generated from [devie-ui.com/components/navigation-menu](https://www.devie-ui.com/components/navigation-menu)*
