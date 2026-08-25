# <NavigationMenu />

The NavigationMenu component extends [ Base UI's NavigationMenu ](https://base-ui.com/react/components/navigation-menu) . It provides a collection of links and menus for website navigation, with support for hover-triggered dropdowns, keyboard navigation, and accessibility features.

Built on [Base UI](https://base-ui.com/react/components/navigation-menu).

## Installation

### navigation-menu.tsx

```tsx
// https://devie-ui.com/components/navigation-menu
// https://base-ui.com/react/components/navigation-menu

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./NavigationMenu.module.scss";

const Root = BaseNavigationMenu.Root;

function List({
  className,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.List>) {
  return (
    <BaseNavigationMenu.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

function Item({
  className,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.Item>) {
  return (
    <BaseNavigationMenu.Item
      className={clsx(styles.item, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  render,
  ...props
}: React.ComponentProps<typeof BaseNavigationMenu.Trigger>) {
  return (
    <BaseNavigationMenu.Trigger
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
}: React.ComponentProps<typeof BaseNavigationMenu.Icon>) {
  return (
    <BaseNavigationMenu.Icon
      className={clsx(styles.icon, className)}
      {...props}
    >
      {children || <ChevronDown size={14} />}
    </BaseNavigationMenu.Icon>
  );
}

function Content({ className, ...props }: BaseNavigationMenu.Content.Props) {
  return (
    <BaseNavigationMenu.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: BaseNavigationMenu.Link.Props) {
  return (
    <BaseNavigationMenu.Link
      className={clsx(styles.link, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseNavigationMenu.Backdrop.Props) {
  return (
    <BaseNavigationMenu.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Portal = BaseNavigationMenu.Portal;

function Positioner({
  className,
  ...props
}: BaseNavigationMenu.Positioner.Props) {
  return (
    <BaseNavigationMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseNavigationMenu.Popup.Props) {
  return (
    <BaseNavigationMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: BaseNavigationMenu.Viewport.Props) {
  return (
    <BaseNavigationMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Arrow({ className, ...props }: BaseNavigationMenu.Arrow.Props) {
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

namespace NavigationMenu {
  export namespace Root {
    export type Props = BaseNavigationMenu.Root.Props;
  }
  export namespace List {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.List>;
  }
  export namespace Item {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Item>;
  }
  export namespace Trigger {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Trigger>;
  }
  export namespace Icon {
    export type Props = React.ComponentProps<typeof BaseNavigationMenu.Icon>;
  }
  export namespace Content {
    export type Props = BaseNavigationMenu.Content.Props;
  }
  export namespace Link {
    export type Props = BaseNavigationMenu.Link.Props;
  }
  export namespace Backdrop {
    export type Props = BaseNavigationMenu.Backdrop.Props;
  }
  export namespace Portal {
    export type Props = BaseNavigationMenu.Portal.Props;
  }
  export namespace Positioner {
    export type Props = BaseNavigationMenu.Positioner.Props;
  }
  export namespace Popup {
    export type Props = BaseNavigationMenu.Popup.Props;
  }
  export namespace Viewport {
    export type Props = BaseNavigationMenu.Viewport.Props;
  }
  export namespace Arrow {
    export type Props = BaseNavigationMenu.Arrow.Props;
  }
}

export default NavigationMenu;
```

### navigation-menu.module.scss

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
        padding: $devie__spacing__x1 $devie__spacing__x1;
        border: none;
        background: transparent;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        cursor: pointer;
        border-radius: $devie__radius;
        outline: none;
        transition: none;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-popup-open] {
            background: #{devie-hover-color($devie__color__background)};
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

        [data-popup-open]>& {
            transform: rotate(180deg);
        }
    }

    .content {
        padding: $devie__spacing__x2;
    }

    .link {
        display: block;
        padding: $devie__spacing__x1 $devie__spacing__x1;
        color: $devie__color__text;
        text-decoration: none;
        font-size: $devie__font-size__normal;
        border-radius: $devie__radius;
        outline: none;
        transition: none;

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
        background: transparent;
    }

    .positioner {
        &:not([data-instant]) {
            transition: left 400ms ease;
        }
    }

    .popup {
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
    }

    .viewport {
        overflow: hidden;
    }

    .arrow {
        fill: $devie__color__background;
        stroke: $devie__color__line;
        stroke-width: 1px;
        z-index: 1;

        &:not([data-instant]) {
            transition: left 400ms ease;
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
        <ul>
          <li>
            <NavigationMenu.Link href="#">Analytics</NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link href="#">Automation</NavigationMenu.Link>
          </li>
        </ul>
      </NavigationMenu.Content>
    </NavigationMenu.Item>

    <NavigationMenu.Item>
      <NavigationMenu.Trigger>
        Resources
        <NavigationMenu.Icon />
      </NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <ul>
          <li>
            <NavigationMenu.Link href="#">Documentation</NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link href="#">Blog</NavigationMenu.Link>
          </li>
          <li>
            <NavigationMenu.Link href="#">Community</NavigationMenu.Link>
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

*Generated from [devie-ui.com/components/navigation-menu](https://devie-ui.com/components/navigation-menu)*