# <Breadcrumb />

The Breadcrumb component provides a navigational aid that helps users understand their current location within a website hierarchy. It's built as a compound component with subcomponents for flexible composition.

## Installation

### breadcrumb.tsx

```tsx
// https://devie-ui.com/components/breadcrumb

import clsx from "clsx";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import type React from "react";
import styles from "./Breadcrumb.module.scss";

const Root = ({ ...props }: React.ComponentProps<"nav">) => (
  <nav aria-label="breadcrumb" {...props} />
);

const List = ({ className, ...props }: Breadcrumb.List.Props) => (
  <ol className={clsx(styles.list, className)} {...props} />
);

const Item = ({ className, ...props }: Breadcrumb.Item.Props) => (
  <li className={clsx(styles.item, className)} {...props} />
);

const StyledSpan = ({ className, ...props }: Breadcrumb.Span.Props) => (
  <span className={clsx(styles.span, className)} {...props} />
);

const Page = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan aria-disabled="true" aria-current="page" {...props}>
    {children}
  </StyledSpan>
);

const Separator = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan role="presentation" aria-hidden="true" {...props}>
    {children ?? (
      <ChevronRight style={{ width: 16, height: 16 }} strokeWidth={1} />
    )}
  </StyledSpan>
);

const Ellipsis = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<"span">) => (
  <StyledSpan role="presentation" aria-hidden="true" {...props}>
    {children ?? (
      <MoreHorizontal style={{ width: 16, height: 16 }} strokeWidth={1} />
    )}
  </StyledSpan>
);

const Breadcrumb = { Root, List, Item, Separator, Ellipsis, Page };

namespace Breadcrumb {
  export namespace Root {
    export type Props = React.ComponentProps<"nav">;
  }
  export namespace List {
    export interface Props extends React.ComponentProps<"ol"> {
      className?: string;
    }
  }
  export namespace Item {
    export interface Props extends React.ComponentProps<"li"> {
      className?: string;
    }
  }
  export namespace Span {
    export interface Props extends React.ComponentPropsWithoutRef<"span"> {
      className?: string;
    }
  }
  export namespace Page {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
  export namespace Separator {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
  export namespace Ellipsis {
    export type Props = React.ComponentPropsWithoutRef<"span">;
  }
}

export default Breadcrumb;
```

### breadcrumb.module.scss

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
    font-family: $devie__font-family;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .span {
    display: inline-flex;
    align-items: flex-end;
  }
}
```

## Use Cases

### Breadcrumb with links

A typical breadcrumb navigation with clickable links for each level in the hierarchy. The current page is marked with `aria-current="page"` for accessibility.

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

### Breadcrumb with ellipsis

For deep navigation paths, use the `Ellipsis` component to truncate intermediate levels while keeping the first and last items visible.

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