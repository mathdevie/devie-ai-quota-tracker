# <Breadcrumb />

A navigation trail that shows the current location in a site hierarchy. This is a custom component with no Base UI primitive. Devie adds the `Breadcrumb.Root`, `Breadcrumb.List`, `Breadcrumb.Item`, `Breadcrumb.Separator`, `Breadcrumb.Page`, and [Breadcrumb.Ellipsis](#ellipsis) subcomponents.

## Installation

### Breadcrumb.tsx

```tsx
// https://devie-ui.com/components/breadcrumb

import clsx from "clsx";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type React from "react";
import styles from "./Breadcrumb.module.scss";

function Root(props: Breadcrumb.Root.Props) {
  return <nav aria-label="breadcrumb" {...props} />;
}

function List({ className, ...props }: Breadcrumb.List.Props) {
  return <ol className={clsx(styles.list, className)} {...props} />;
}

function Item({ className, ...props }: Breadcrumb.Item.Props) {
  return <li className={clsx(styles.item, className)} {...props} />;
}

function Page({ className, ...props }: Breadcrumb.Page.Props) {
  return (
    <span
      aria-current="page"
      className={clsx(styles.span, className)}
      {...props}
    />
  );
}

function Separator({
  className,
  children,
  ...props
}: Breadcrumb.Separator.Props) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.span, className)}
      {...props}
    >
      {children ?? <ChevronRight size={16} strokeWidth={1} />}
    </li>
  );
}

function Ellipsis({
  className,
  children,
  ...props
}: Breadcrumb.Ellipsis.Props) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.span, className)}
      {...props}
    >
      {children ?? <MoreHorizontal size={16} strokeWidth={1} />}
    </span>
  );
}

const Breadcrumb = { Root, List, Item, Separator, Ellipsis, Page };

namespace Breadcrumb {
  export namespace Root {
    export type Props = React.ComponentProps<"nav">;
  }
  export namespace List {
    export type Props = React.ComponentProps<"ol">;
  }
  export namespace Item {
    export type Props = React.ComponentProps<"li">;
  }
  export namespace Page {
    export type Props = React.ComponentProps<"span">;
  }
  export namespace Separator {
    export type Props = React.ComponentProps<"li">;
  }
  export namespace Ellipsis {
    export type Props = React.ComponentProps<"span">;
  }
}

export default Breadcrumb;
```

### Breadcrumb.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .list {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
        padding: 0;
        margin: 0;
        max-width: 100%;
        list-style: none;
    }

    .item {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
        color: $devie__color__text;
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x3;
        font-family: $devie__font-family;

        a {
            color: inherit;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }

        [aria-current="page"] {
            font-weight: 600;
        }
    }

    .span {
        display: inline-flex;
        align-items: flex-end;
    }
}
```

## Use Cases

### Simple breadcrumb

Put a link in each `Breadcrumb.Item` and wrap the current page in `Breadcrumb.Page`, which sets `aria-current`.

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <a href="#">Home</a>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <a href="#">Products</a>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <a href="#">Electronics</a>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Headphones</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

### With ellipsis

Replace the middle levels of a deep path with `Breadcrumb.Ellipsis`.

```tsx
<Breadcrumb.Root>
  <Breadcrumb.List>
    <Breadcrumb.Item>
      <a href="#">Home</a>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Ellipsis />
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <a href="#">Category</a>
    </Breadcrumb.Item>
    <Breadcrumb.Separator />
    <Breadcrumb.Item>
      <Breadcrumb.Page>Current Page</Breadcrumb.Page>
    </Breadcrumb.Item>
  </Breadcrumb.List>
</Breadcrumb.Root>
```

---

*Generated from [devie-ui.com/components/breadcrumb](https://devie-ui.com/components/breadcrumb)*