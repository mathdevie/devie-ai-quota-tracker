# <ScrollArea />

A native scroll container with custom scrollbars. The ScrollArea component extends [ Base UI's Scroll Area ](https://base-ui.com/react/components/scroll-area) . It provides a native scroll container with custom-styled scrollbars that appear on hover or when scrolling.

Built on [Base UI](https://base-ui.com/react/components/scroll-area).

## Installation

### scroll-area.tsx

```tsx
// https://devie-ui.com/components/scroll-area
// https://base-ui.com/react/components/scroll-area

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import clsx from "clsx";
import styles from "./ScrollArea.module.scss";

function Root({ className, children, ...props }: BaseScrollArea.Root.Props) {
  return (
    <BaseScrollArea.Root className={clsx(styles.root, className)} {...props}>
      {children}
    </BaseScrollArea.Root>
  );
}

function Viewport({
  className,
  children,
  ...props
}: BaseScrollArea.Viewport.Props) {
  return (
    <BaseScrollArea.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    >
      {children}
    </BaseScrollArea.Viewport>
  );
}

function Content({
  className,
  children,
  ...props
}: BaseScrollArea.Content.Props) {
  return (
    <BaseScrollArea.Content
      className={clsx(styles.content, className)}
      {...props}
    >
      {children}
    </BaseScrollArea.Content>
  );
}

function Scrollbar({
  className,
  children,
  orientation = "vertical",
  ...props
}: BaseScrollArea.Scrollbar.Props) {
  return (
    <BaseScrollArea.Scrollbar
      className={clsx(styles.scrollbar, className)}
      orientation={orientation}
      {...props}
    >
      {children}
    </BaseScrollArea.Scrollbar>
  );
}

function Thumb({ className, ...props }: BaseScrollArea.Thumb.Props) {
  return (
    <BaseScrollArea.Thumb
      className={clsx(styles.thumb, className)}
      {...props}
    />
  );
}

function Corner({ className, ...props }: BaseScrollArea.Corner.Props) {
  return (
    <BaseScrollArea.Corner
      className={clsx(styles.corner, className)}
      {...props}
    />
  );
}

const ScrollArea = {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
  Corner,
};

namespace ScrollArea {
  export namespace Root {
    export type Props = BaseScrollArea.Root.Props;
  }
  export namespace Viewport {
    export type Props = BaseScrollArea.Viewport.Props;
  }
  export namespace Content {
    export type Props = BaseScrollArea.Content.Props;
  }
  export namespace Scrollbar {
    export type Props = BaseScrollArea.Scrollbar.Props;
  }
  export namespace Thumb {
    export type Props = BaseScrollArea.Thumb.Props;
  }
  export namespace Corner {
    export type Props = BaseScrollArea.Corner.Props;
  }
}

export default ScrollArea;
```

### scroll-area.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
  .root {
    position: relative;
    overflow: hidden;
  }

  .viewport {
    height: 100%;
    overscroll-behavior: contain;
    border-radius: $devie__radius;
    outline: 1px solid $devie__color__line;
    outline-offset: -1px;

    &:focus-visible {
      @include devie-focus-ring(-2px);
    }
  }

  .content {
    display: block;
  }

  .scrollbar {
    display: flex;
    background-color: transparent;
    border-radius: $devie__radius;
    opacity: 0;
    transition: opacity 150ms;
    pointer-events: none;

    &[data-orientation="vertical"] {
      position: absolute;
      top: 0;
      right: $devie__spacing__x05;
      bottom: 0;
      width: 6px;
      flex-direction: column;
    }

    &[data-orientation="horizontal"] {
      position: absolute;
      left: 0;
      right: 0;
      bottom: $devie__spacing__x05;
      height: 6px;
      flex-direction: row;
    }

    &::before {
      content: '';
      position: absolute;
    }

    &[data-orientation="vertical"]::before {
      top: 0;
      bottom: 0;
      left: -8px;
      right: -4px;
    }

    &[data-orientation="horizontal"]::before {
      left: 0;
      right: 0;
      top: -8px;
      bottom: -4px;
    }

    &[data-scrolling] {
      transition-duration: 0ms;
    }

    &[data-hovering],
    &[data-scrolling] {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .thumb {
    border-radius: inherit;
    background-color: $devie__color__text-sub;
    transition: background-color 150ms;

    &:hover {
      background-color: $devie__color__text;
    }

    &[data-orientation="vertical"] {
      width: 100%;
    }

    &[data-orientation="horizontal"] {
      height: 100%;
    }
  }

  .corner {
    position: absolute;
    right: $devie__spacing__x05;
    bottom: 0;
    width: 8px;
    height: calc(8px + #{$devie__spacing__x05});
    background-color: transparent;
    border-radius: $devie__radius;
  }
}
```

## Use Cases

### Simple scroll area

A basic scroll area with vertical scrolling. The custom scrollbar appears when hovering over the container or when actively scrolling.

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content>
      <p>Your scrollable content here...</p>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
</ScrollArea.Root>
```

### Both scrollbars

When content overflows in both directions, use two `ScrollArea.Scrollbar` components with different orientations and a `ScrollArea.Corner` to prevent them from overlapping.

```tsx
<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content>
      <ul>
        {Array.from({ length: 64 }, (_, i) => (
          <li key={i}>{i + 1}</li>
        ))}
      </ul>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

### Long code block

A practical example showing how to wrap long code content in a fixed-height scroll area. This pattern is useful for documentation sites, code editors, or anywhere you need to display lengthy code snippets without taking up too much vertical space.

```tsx
const longCodeContent = `function example() {
  return "Scrollable code content";
}`;

<ScrollArea.Root>
  <ScrollArea.Viewport>
    <ScrollArea.Content>
      <pre>
        <code>{longCodeContent}</code>
      </pre>
    </ScrollArea.Content>
  </ScrollArea.Viewport>
  <ScrollArea.Scrollbar>
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Scrollbar orientation="horizontal">
    <ScrollArea.Thumb />
  </ScrollArea.Scrollbar>
  <ScrollArea.Corner />
</ScrollArea.Root>
```

---

*Generated from [devie-ui.com/components/scroll-area](https://devie-ui.com/components/scroll-area)*