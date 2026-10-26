# <NavigationMenu />

A collection of links and menus for website navigation. The NavigationMenu component extends [Base UI's NavigationMenu](https://base-ui.com/react/components/navigation-menu). It provides a collection of links and menus for website navigation, with support for hover-triggered dropdowns, keyboard navigation, and accessibility features.

Built on [Base UI](https://base-ui.com/react/components/navigation-menu).

## Installation

### NavigationMenu.tsx

```tsx
// https://devie-ui.com/components/navigation-menu
// https://base-ui.com/react/components/navigation-menu

import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type React from "react";
import styles from "./NavigationMenu.module.scss";

const Root = BaseNavigationMenu.Root;

function List({ className, ...props }: NavigationMenu.List.Props) {
  return (
    <BaseNavigationMenu.List
      className={clsx(styles.list, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: NavigationMenu.Item.Props) {
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
}: NavigationMenu.Trigger.Props) {
  return (
    <BaseNavigationMenu.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Icon({ className, children, ...props }: NavigationMenu.Icon.Props) {
  return (
    <BaseNavigationMenu.Icon
      className={clsx(styles.icon, className)}
      {...props}
    >
      {children || <ChevronDown size={14} />}
    </BaseNavigationMenu.Icon>
  );
}

function Content({ className, ...props }: NavigationMenu.Content.Props) {
  return (
    <BaseNavigationMenu.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: NavigationMenu.Link.Props) {
  return (
    <BaseNavigationMenu.Link
      className={clsx(styles.link, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: NavigationMenu.Backdrop.Props) {
  return (
    <BaseNavigationMenu.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Portal = BaseNavigationMenu.Portal;

function Positioner({ className, ...props }: NavigationMenu.Positioner.Props) {
  return (
    <BaseNavigationMenu.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: NavigationMenu.Popup.Props) {
  return (
    <BaseNavigationMenu.Popup
      className={clsx(styles.popup, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: NavigationMenu.Viewport.Props) {
  return (
    <BaseNavigationMenu.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: NavigationMenu.Arrow.Props) {
  return (
    <BaseNavigationMenu.Arrow
      className={clsx(styles.arrow, className)}
      {...props}
    >
      {children || <ArrowSvg />}
    </BaseNavigationMenu.Arrow>
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
    export type Props = Omit<BaseNavigationMenu.List.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Item {
    export type Props = Omit<BaseNavigationMenu.Item.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Trigger {
    export type Props = Omit<BaseNavigationMenu.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Icon {
    export type Props = Omit<BaseNavigationMenu.Icon.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Content {
    export type Props = Omit<BaseNavigationMenu.Content.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Link {
    export type Props = Omit<BaseNavigationMenu.Link.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Backdrop {
    export type Props = Omit<BaseNavigationMenu.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseNavigationMenu.Portal.Props;
  }
  export namespace Positioner {
    export type Props = Omit<
      BaseNavigationMenu.Positioner.Props,
      "className"
    > & { className?: string };
  }
  export namespace Popup {
    export type Props = Omit<BaseNavigationMenu.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseNavigationMenu.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseNavigationMenu.Arrow.Props, "className"> & {
      className?: string;
    };
  }
}

export default NavigationMenu;

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
        padding: $devie__spacing__x1 $devie__spacing__x1;
        border: none;
        background: transparent;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x2;
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
            @include devie-focus-ring(2px);
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

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .content {
        padding: $devie__spacing__x2;
    }

    .link {
        display: block;
        padding: $devie__spacing__x05 $devie__spacing__x1;
        line-height: $devie__spacing__x3;
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
            @include devie-focus-ring(2px);
        }
    }

    .backdrop {
        position: fixed;
        inset: 0;
    }

    .positioner {
        &:not([data-instant]) {
            transition: left 300ms ease;

            @media (prefers-reduced-motion: reduce) {
                transition: none;
            }
        }
    }

    .popup {
        background-color: $devie__color__background-raised;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        transform-origin: var(--transform-origin);
        transition:
            opacity 200ms ease,
            transform 200ms ease;

        &[data-starting-style] {
            opacity: 0;
            transform: scale(0.96);
        }

        &[data-ending-style] {
            opacity: 0;
            transform: scale(0.96);
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .viewport {
        overflow: hidden;
        transition:
            width 300ms ease,
            height 300ms ease;

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .arrow {
        display: flex;
        z-index: 1;

        &:not([data-instant]) {
            transition: left 300ms ease;

            @media (prefers-reduced-motion: reduce) {
                transition: none;
            }
        }

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