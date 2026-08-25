# <Drawer />

This is an example hero drawer. You can pull it up or swipe it down.

A panel that slides in from the edge of the screen. Powered by Base UI, it comes with built-in swipe-to-dismiss gestures, snap points, nested drawers, and focus trapping capabilities.

Built on [Base UI](https://base-ui.com/react/components/drawer).

## Installation

### drawer.tsx

```tsx
// https://devie-ui.com/components/drawer
// https://base-ui.com/react/components/drawer

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import clsx from "clsx";
import type React from "react";
import styles from "./Drawer.module.scss";

// Simple re-exports
const Provider = BaseDrawer.Provider;
const Root = BaseDrawer.Root;
const Portal = BaseDrawer.Portal;
const createHandle = BaseDrawer.createHandle;

function IndentBackground({
  className,
  ...props
}: BaseDrawer.IndentBackground.Props) {
  return (
    <BaseDrawer.IndentBackground
      className={clsx(styles.indentBackground, className)}
      {...props}
    />
  );
}

function Indent({ className, ...props }: BaseDrawer.Indent.Props) {
  return (
    <BaseDrawer.Indent className={clsx(styles.indent, className)} {...props} />
  );
}

function Trigger({ className, ...props }: BaseDrawer.Trigger.Props) {
  return (
    <BaseDrawer.Trigger className={className} {...props} />
  );
}

function SwipeArea({ className, ...props }: BaseDrawer.SwipeArea.Props) {
  return (
    <BaseDrawer.SwipeArea
      className={clsx(styles.swipeArea, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseDrawer.Backdrop.Props) {
  return (
    <BaseDrawer.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: BaseDrawer.Viewport.Props) {
  return (
    <BaseDrawer.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseDrawer.Popup.Props) {
  return (
    <BaseDrawer.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Content({ className, ...props }: BaseDrawer.Content.Props) {
  return (
    <BaseDrawer.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Title({ className, ...props }: BaseDrawer.Title.Props) {
  return (
    <BaseDrawer.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BaseDrawer.Description.Props) {
  return (
    <BaseDrawer.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({ className, ...props }: BaseDrawer.Close.Props) {
  return (
    <BaseDrawer.Close className={className} {...props} />
  );
}

function Handle({ className, ...props }: Drawer.Handle.Props) {
  return <div className={clsx(styles.handle, className)} {...props} />;
}

const Drawer = {
  Provider,
  IndentBackground,
  Indent,
  Root,
  createHandle,
  Trigger,
  SwipeArea,
  Portal,
  Backdrop,
  Viewport,
  Popup,
  Content,
  Title,
  Description,
  Close,
  Handle,
};

namespace Drawer {
  export namespace Root {
    export type Props = BaseDrawer.Root.Props;
  }
  export namespace Trigger {
    export type Props = BaseDrawer.Trigger.Props;
  }
  export namespace SwipeArea {
    export type Props = BaseDrawer.SwipeArea.Props;
  }
  export namespace Portal {
    export type Props = BaseDrawer.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseDrawer.Backdrop.Props;
  }
  export namespace Viewport {
    export type Props = BaseDrawer.Viewport.Props;
  }
  export namespace Popup {
    export type Props = BaseDrawer.Popup.Props;
  }
  export namespace Content {
    export type Props = BaseDrawer.Content.Props;
  }
  export namespace Title {
    export type Props = BaseDrawer.Title.Props;
  }
  export namespace Description {
    export type Props = BaseDrawer.Description.Props;
  }
  export namespace Close {
    export type Props = BaseDrawer.Close.Props;
  }
  export namespace IndentBackground {
    export type Props = BaseDrawer.IndentBackground.Props;
  }
  export namespace Indent {
    export type Props = BaseDrawer.Indent.Props;
  }
  export namespace Handle {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default Drawer;
```

### drawer.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .indentBackground {
        background-color: #000000;
        height: 100vh;
        width: 100vw;
        position: fixed;
        inset: 0;
        z-index: -1;
    }

    .indent {
        background-color: $devie__color__background;
        border-radius: 0;
        transform-origin: center top;
        transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1);
        min-height: 100vh;
        
        &[data-active] {
            border-radius: $devie__radius-strong;
            transform: scale(0.95);
        }
    }

    .backdrop {
        background-color: #000000;
        --backdrop-opacity: 0.6;
        opacity: calc(var(--backdrop-opacity) * (1 - var(--drawer-swipe-progress, 0)));
        position: fixed;
        inset: 0;

        &[data-starting-style],
        &[data-ending-style] {
            opacity: 0;
        }

        &[data-ending-style] {
            transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
            transition-property: opacity;
            transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
        }

        transition-duration: 400ms;
        transition-property: opacity;
        transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
        
        &[data-swiping] {
            transition-duration: 0ms;
        }
    }

    .viewport {
        position: fixed;
        inset: 0;
        display: flex;
        pointer-events: none;
    }

    .popup {
        background: $devie__color__background;
        pointer-events: auto;
        display: flex;
        flex-direction: column;

        --stack-step: 0.05;
        --stack-scale: calc(1 - (var(--nested-drawers, 0) * var(--stack-step)));
        --nested-drawers: 0;

        transition-duration: 400ms;
        transition-property: transform;
        transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1);

        &[data-ending-style] {
            transition-duration: calc(var(--drawer-swipe-strength, 1) * 400ms);
        }

        &[data-swiping] {
            transition-duration: 0ms;
        }

        border: 1px solid $devie__color__line;
        box-shadow: $devie__shadow__menu;

        &[data-swipe-direction='down'] {
            margin-top: auto;
            width: 100%;
            max-height: 96vh;
            border-top-left-radius: $devie__radius-strong;
            border-top-right-radius: $devie__radius-strong;
            border-bottom: none;
            transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))) scale(var(--stack-scale));
        }
        &[data-ending-style][data-swipe-direction='down'],
        &[data-starting-style][data-swipe-direction='down'] {
            transform: translateY(100%);
        }

        &[data-swipe-direction='right'] {
            margin-left: auto;
            height: 100%;
            max-width: 400px;
            width: 80vw;
            border-top-left-radius: $devie__radius-strong;
            border-bottom-left-radius: $devie__radius-strong;
            border-right: none;
            transform: translateX(var(--drawer-swipe-movement-x, 0px));
        }
        &[data-ending-style][data-swipe-direction='right'],
        &[data-starting-style][data-swipe-direction='right'] {
            transform: translateX(100%);
        }

        &[data-swipe-direction='left'] {
            margin-right: auto;
            height: 100%;
            max-width: 400px;
            width: 80vw;
            border-top-right-radius: $devie__radius-strong;
            border-bottom-right-radius: $devie__radius-strong;
            border-left: none;
            transform: translateX(var(--drawer-swipe-movement-x, 0px));
        }
        &[data-ending-style][data-swipe-direction='left'],
        &[data-starting-style][data-swipe-direction='left'] {
            transform: translateX(-100%);
        }

        &[data-swipe-direction='up'] {
            margin-bottom: auto;
            width: 100%;
            max-height: 96vh;
            border-bottom-left-radius: $devie__radius-strong;
            border-bottom-right-radius: $devie__radius-strong;
            border-top: none;
            transform: translateY(calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))) scale(var(--stack-scale));
        }
        &[data-ending-style][data-swipe-direction='up'],
        &[data-starting-style][data-swipe-direction='up'] {
            transform: translateY(-100%);
        }
    }

    .content {
        flex: 1;
        overflow-y: auto;
        padding: $devie__spacing__x4;
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x2;

        transition: opacity 300ms;
        .popup[data-nested-drawer-open] & {
            opacity: 0;
        }
        .popup[data-nested-drawer-open][data-nested-drawer-swiping] & {
            opacity: 1;
        }
    }

    .handle {
        width: 32px;
        height: 5px;
        border-radius: 9999px;
        background-color: $devie__color__line;
        margin: $devie__spacing__x2 auto $devie__spacing__x1;
        flex-shrink: 0;
    }

    .title {
        font-size: $devie__font-size__title3;
        font-weight: 500;
        color: $devie__color__text;
        margin: 0;
    }

    .description {
        font-size: $devie__font-size__normal;
        color: $devie__color__text-sub;
        margin: 0;
    }

    .swipeArea {
        position: fixed;
    }
}
```

## Use Cases

### Simple Example

By default, Drawer behaves as a bottom sheet with a unified API for swiping and interaction.

```tsx
import Drawer from "@/ui/Drawer";
import Button from "@/ui/Button";

export default function SimpleDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger render={<Button>Open Drawer</Button>} />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Handle />
            <Drawer.Content>
              <Drawer.Title>Profile Settings</Drawer.Title>
              <Drawer.Description>
                Make changes to your profile here. Click save when you're done.
              </Drawer.Description>
              
              <div style={{ padding: "20px 0" }}>
                {/* Your content goes here */}
              </div>

              <Drawer.Close render={<Button variant="outline">Close</Button>} />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Position

Change the `swipeDirection` property to `"right"`, `"left"`, or `"up"` to make the Drawer slide out from different sides of the screen. Styling automatically adjusts.

```tsx
import Drawer from "@/ui/Drawer";
import Button from "@/ui/Button";

export default function DirectionalDrawer() {
  return (
    <Drawer.Root swipeDirection="right">
      <Drawer.Trigger render={<Button>Open Right Drawer</Button>} />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Drawer.Title>Sidebar Menu</Drawer.Title>
              <Drawer.Description>
                This drawer opens from the right side. Swipe right to dismiss.
              </Drawer.Description>
              <Drawer.Close render={<Button variant="outline">Close</Button>} />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Non-modal

Set `modal=&#123;false&#125;` to opt out of focus trapping and `disablePointerDismissal` to keep the drawer open on outside clicks.

```tsx
import Drawer from "@/ui/Drawer";
import Button from "@/ui/Button";

export default function NonModalDrawer() {
  return (
    <Drawer.Root swipeDirection="right" modal={false} disablePointerDismissal>
      <Drawer.Trigger render={<Button>Open Non-modal Drawer</Button>} />
      <Drawer.Portal>
        <Drawer.Viewport>
          <Drawer.Popup style={{ top: '80px', height: 'calc(100% - 80px)' }}>
            <Drawer.Content>
              <Drawer.Title>Tools</Drawer.Title>
              <Drawer.Description>
                This drawer does not trap focus and ignores outside clicks. 
                You can drag it to close, or close it manually.
              </Drawer.Description>
              <Drawer.Close render={<Button variant="outline">Close</Button>} />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

### Swipe to open

Place `<Drawer.SwipeArea>` along the edge of the viewport to enable swipe-to-open gestures.

```tsx
import Drawer from "@/ui/Drawer";

export default function SwipeToOpenDrawer() {
  return (
    <Drawer.Root swipeDirection="right" modal={false}>
      {/* Invisible area on the right edge to detect swipe */}
      <Drawer.SwipeArea style={{ right: 0, width: 40, height: '100vh', top: 0 }} />
      
      <div style={{ padding: 20 }}>
        <p>Swipe from the right edge to open the drawer.</p>
      </div>
      
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Content>
              <Drawer.Title>Your Library</Drawer.Title>
              <Drawer.Description>
                Swipe from the edge whenever you want to jump back into your playlists.
              </Drawer.Description>
              <Drawer.Close>Close</Drawer.Close>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

---

*Generated from [devie-ui.com/components/drawer](https://devie-ui.com/components/drawer)*