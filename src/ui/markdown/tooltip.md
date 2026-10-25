# <Tooltip />

A hint that appears when an element is hovered or focused. The Tooltip component extends [Base UI's Tooltip](https://base-ui.com/react/components/tooltip). Wrap tooltips in `Tooltip.Provider`, which sets a default delay of 100ms.

Built on [Base UI](https://base-ui.com/react/components/tooltip).

## Installation

### Tooltip.tsx

```tsx
// https://devie-ui.com/components/tooltip
// https://base-ui.com/react/components/tooltip

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import clsx from "clsx";
import type React from "react";
import styles from "./Tooltip.module.scss";

function Trigger({ className, render, ...props }: Tooltip.Trigger.Props) {
  return (
    <BaseTooltip.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

function Arrow({ className, children, ...props }: Tooltip.Arrow.Props) {
  return (
    <BaseTooltip.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BaseTooltip.Arrow>
  );
}

function Popup({ className, ...props }: Tooltip.Popup.Props) {
  return (
    <BaseTooltip.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Provider({ delay = 100, ...props }: Tooltip.Provider.Props) {
  return <BaseTooltip.Provider delay={delay} {...props} />;
}

const Portal = BaseTooltip.Portal;

const Positioner = BaseTooltip.Positioner;

const Root = BaseTooltip.Root;

const Tooltip = {
  Provider,
  Root,
  Trigger,
  Popup,
  Arrow,
  Portal,
  Positioner,
};

namespace Tooltip {
  export namespace Provider {
    export type Props = BaseTooltip.Provider.Props;
  }
  export namespace Root {
    export type Props = BaseTooltip.Root.Props;
  }
  export namespace Trigger {
    export type Props = Omit<BaseTooltip.Trigger.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Popup {
    export type Props = Omit<BaseTooltip.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BaseTooltip.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseTooltip.Portal.Props;
  }
  export namespace Positioner {
    export type Props = BaseTooltip.Positioner.Props;
    export type State = BaseTooltip.Positioner.State;
  }
}

export default Tooltip;

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

### Tooltip.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .trigger {
        border: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        &:where(button) {
            background: none;
            padding: 0;
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }
    }

    .arrow {
        display: flex;
        position: absolute;

        &[data-side="top"] {
            bottom: calc(-1 * $devie__spacing__x1);
            rotate: 180deg;
        }

        &[data-side="bottom"] {
            top: calc(-1 * $devie__spacing__x1);
            rotate: 0deg;
        }

        // The extra 5px recentres the 20x10 ArrowSvg after its 90deg rotation
        &[data-side="left"] {
            right: calc(-1 * $devie__spacing__x1 - 5px);
            rotate: 90deg;
        }

        &[data-side="right"] {
            left: calc(-1 * $devie__spacing__x1 - 5px);
            rotate: -90deg;
        }
    }

    .popup {
        box-sizing: border-box;
        width: max-content;
        max-width: min(280px, var(--available-width, 90vw));
        background-color: $devie__color__text;
        border: 1px solid $devie__color__text;
        border-radius: calc($devie__radius / 2);
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x1;
        box-shadow: $devie__shadow__menu;
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        font-weight: 600;
        color: $devie__color__background;
        transform-origin: var(--transform-origin);
        white-space: normal;
        overflow-wrap: break-word;
        transition:
            opacity 150ms ease-out,
            transform 150ms ease-out;

        &[data-starting-style],
        &[data-ending-style] {
            opacity: 0;
            transform: scale(0.95);
        }

        &[data-instant] {
            transition-duration: 0ms;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .arrowFill {
        fill: $devie__color__text;
    }

    .arrowInnerStroke {
        fill: $devie__color__text;
    }
}
```

## Use Cases

### Simple tooltip with positioning

Use the `side` prop on the Positioner to control where the tooltip appears relative to the trigger. Available options are `top`, `bottom`, `left`, and `right`.

```tsx
<Tooltip.Provider>
  <div>
    <Tooltip.Root>
      <Tooltip.Trigger>Top</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8}>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Tooltip on top
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>Bottom</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="bottom" sideOffset={8}>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Tooltip on bottom
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>Left</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="left" sideOffset={8}>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Tooltip on left
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>

    <Tooltip.Root>
      <Tooltip.Trigger>Right</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={8}>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Tooltip on right
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  </div>
</Tooltip.Provider>
```

### Without arrow

Omit `Tooltip.Arrow` from the Popup.

```tsx
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Positioner side="top" sideOffset={8}>
        <Tooltip.Popup>Tooltip without arrow</Tooltip.Popup>
      </Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
```

---

*Generated from [devie-ui.com/components/tooltip](https://devie-ui.com/components/tooltip)*