# <Popover />

An accessible popup anchored to a trigger. The Popover component extends [Base UI's Popover](https://base-ui.com/react/components/popover). It styles the `Popover.Popup`, `Popover.Arrow`, `Popover.Title`, `Popover.Description`, and `Popover.Backdrop` subcomponents, and gives `Popover.Close` a default icon.

Built on [Base UI](https://base-ui.com/react/components/popover).

## Installation

### Popover.tsx

```tsx
// https://devie-ui.com/components/popover
// https://base-ui.com/react/components/popover

import { Popover as BasePopover } from "@base-ui/react/popover";
import clsx from "clsx";
import { X } from "lucide-react";
import type React from "react";
import styles from "./Popover.module.scss";

const Root = BasePopover.Root;

const Trigger = BasePopover.Trigger;

const Portal = BasePopover.Portal;

function Backdrop({ className, ...props }: Popover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

const Positioner = BasePopover.Positioner;

function Popup({ className, ...props }: Popover.Popup.Props) {
  return (
    <BasePopover.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, children, ...props }: Popover.Arrow.Props) {
  return (
    <BasePopover.Arrow className={clsx(styles.arrow, className)} {...props}>
      {children || <ArrowSvg />}
    </BasePopover.Arrow>
  );
}

function Title({ className, ...props }: Popover.Title.Props) {
  return (
    <BasePopover.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: Popover.Description.Props) {
  return (
    <BasePopover.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({ className, render, children, ...props }: Popover.Close.Props) {
  if (render) {
    return (
      <BasePopover.Close className={className} render={render} {...props}>
        {children}
      </BasePopover.Close>
    );
  }

  return (
    <BasePopover.Close
      aria-label={children ? undefined : "Close"}
      className={clsx(styles.close, className)}
      {...props}
    >
      {children ?? <X size={16} />}
    </BasePopover.Close>
  );
}

const Popover = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Positioner,
  Popup,
  Arrow,
  Title,
  Description,
  Close,
};

namespace Popover {
  export namespace Root {
    export type Props = BasePopover.Root.Props;
  }
  export namespace Trigger {
    export type Props = BasePopover.Trigger.Props;
    export type State = BasePopover.Trigger.State;
  }
  export namespace Portal {
    export type Props = BasePopover.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = Omit<BasePopover.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Positioner {
    export type Props = BasePopover.Positioner.Props;
    export type State = BasePopover.Positioner.State;
  }
  export namespace Popup {
    export type Props = Omit<BasePopover.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Arrow {
    export type Props = Omit<BasePopover.Arrow.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Title {
    export type Props = Omit<BasePopover.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BasePopover.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Close {
    export type Props = Omit<BasePopover.Close.Props, "className"> & {
      className?: string;
    };
  }
}

export default Popover;

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

### Popover.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        transition: opacity 150ms ease-out;

        &[data-open] {
            opacity: 1;
        }

        &[data-starting-style],
        &[data-ending-style] {
            opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .popup {
        outline: 0;
        background-color: $devie__color__background-raised;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        min-width: 200px;
        max-width: var(--available-width, 90vw);
        transform-origin: var(--transform-origin);
        transition:
            transform 150ms ease-out,
            opacity 150ms ease-out;

        &[data-starting-style] {
            opacity: 0;
            transform: scale(0.95);
        }

        &[data-ending-style] {
            opacity: 0;
            transform: scale(0.95);
        }

        &[data-instant] {
            transition: none;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
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

    .title {
        margin: 0;
        font-size: $devie__font-size__normal;
        font-weight: 600;
        line-height: $devie__spacing__x3;
        color: $devie__color__text;
    }

    .description {
        margin: 0;
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        color: $devie__color__text-sub;
    }

    .close {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: $devie__spacing__x05;
        color: $devie__color__text;
        border-radius: $devie__radius;
        transition: none;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }
    }
}
```

## Use Cases

### Simple popover

Use `Popover.Title`, `Popover.Description`, `Popover.Close`, and `Popover.Arrow` inside the Popup.

```tsx
<Popover.Root>
  <Popover.Trigger
    render={<Button variant="secondary">Open Popover (Simple)</Button>}
  />
  <Popover.Portal>
    <Popover.Positioner side="bottom" sideOffset={8}>
      <Popover.Popup>
        <Popover.Arrow />
        <div>
          <div>
            <Popover.Title>Popover Title</Popover.Title>
            <Popover.Close />
          </div>
          <Popover.Description>
            This is a popover component that displays supplementary content when
            triggered. It positions itself relative to the trigger element.
          </Popover.Description>
        </div>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

### Open on hover

Set `openOnHover` on `Popover.Trigger`. On the same trigger, set `delay` and `closeDelay` in milliseconds to wait before opening and closing.

```tsx
<Popover.Root>
  <Popover.Trigger
    openOnHover
    delay={200}
    render={<Button variant="secondary">Open Popover (On Hover)</Button>}
  />
  <Popover.Portal>
    <Popover.Positioner side="bottom" sideOffset={8}>
      <Popover.Popup className={styles.hoverPopup}>
        <Popover.Arrow />
        <div className={styles.hoverContent}>
          <Popover.Title>Quick Info</Popover.Title>
          <Popover.Description>
            This popover opens on hover with a 200ms delay. Move your mouse away
            to close it automatically.
          </Popover.Description>
        </div>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

```scss
.hoverPopup {
  width: 280px !important;
}

.hoverContent {
  padding: $devie__spacing__x2;
  display: flex;
  flex-direction: column;
  gap: $devie__spacing__x1;
}
```

### Modal mode

Set `modal` on `Popover.Root` to `true` to lock page scroll and block interactions outside the popover. Add `Popover.Backdrop` for a visible overlay.

```tsx
<Popover.Root modal>
  <Popover.Trigger
    render={<Button variant="secondary">Open Popover (Modal Mode)</Button>}
  />
  <Popover.Portal>
    <Popover.Backdrop />
    <Popover.Positioner side="bottom" sideOffset={8}>
      <Popover.Popup className={styles.modalPopup}>
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>
            <AlertTriangle size={24} />
          </div>
          <Popover.Title>Delete your account?</Popover.Title>
          <Popover.Description>
            This action cannot be undone. All your data will be permanently
            removed from our servers.
          </Popover.Description>
          <div className={styles.modalActions}>
            <Popover.Close render={<Button variant="secondary">Cancel</Button>} />
            <Popover.Close render={<Button variant="danger">Yes, delete</Button>} />
          </div>
        </div>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

```scss
.modalPopup {
  width: 320px !important;
}

.modalContent {
  padding: $devie__spacing__x3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: $devie__spacing__x2;
}

.modalIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: $devie__color__danger;
  color: $devie__color__danger-label;
}

.modalActions {
  display: flex;
  gap: $devie__spacing__x1;
  margin-top: $devie__spacing__x1;
}
```

### Controlled with state

Use `open` and `onOpenChange` on `Popover.Root` to control the popover. Pass a `className` to `Popover.Popup` to lay out a header, a list, and footer actions.

```tsx
const NOTIFICATIONS = [
  {
    id: 1,
    icon: MessageSquare,
    title: "New comment on your post",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: 2,
    icon: Calendar,
    title: "Meeting reminder: Team sync",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    icon: Check,
    title: "Your settings were updated",
    time: "Yesterday",
    unread: false,
  },
];

const [isOpen, setIsOpen] = useState(false);
const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
  <Popover.Trigger
    render={<Button variant="naked" className={styles.triggerWithBadge} />}
  >
    <Bell size={16} />
    Notifications
    {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
  </Popover.Trigger>
  <Popover.Portal>
    <Popover.Positioner side="top" align="start" sideOffset={8}>
      <Popover.Popup className={styles.richPopup}>
        <div className={styles.richHeader}>
          <div className={styles.richHeaderLeft}>
            <Bell size={16} />
            <Popover.Title className={styles.richTitle}>
              Notifications
            </Popover.Title>
          </div>
          <Popover.Close className={styles.richClose}>
            <X size={16} />
          </Popover.Close>
        </div>

        <div className={styles.richContent}>
          {NOTIFICATIONS.map((notification) => (
            <div
              key={notification.id}
              className={styles.notificationItem}
              data-unread={notification.unread}
            >
              <div className={styles.notificationIcon}>
                <notification.icon size={14} />
              </div>
              <div className={styles.notificationText}>
                <div className={styles.notificationTitle}>
                  {notification.title}
                </div>
                <div className={styles.notificationTime}>
                  {notification.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.richFooter}>
          <Button variant="naked" size="sm" onClick={() => setIsOpen(false)}>
            Mark all as read
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            View all
          </Button>
        </div>
      </Popover.Popup>
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
```

```scss
.triggerWithBadge {
  position: relative;
  gap: $devie__spacing__x05;
}

.badge {
  background: $devie__color__primary;
  color: $devie__color__primary-label;
  border-radius: 9999px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  min-width: 18px;
  text-align: center;
}

.richPopup {
  width: 320px !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.richHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $devie__spacing__x2;
  border-bottom: 1px solid $devie__color__line;
  color: $devie__color__primary;
}

.richHeaderLeft {
  display: flex;
  align-items: center;
  gap: $devie__spacing__x1;
}

.richTitle {
  font-size: $devie__font-size__normal;
  font-weight: 600;
  color: $devie__color__text;
  margin: 0;
}

.richClose {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: $devie__radius;
  border: none;
  background: none;
  cursor: pointer;
  color: $devie__color__text-sub;

  &:hover {
    background: $devie__color__background-sunken;
    color: $devie__color__text;
  }
}

.richContent {
  flex: 1;
  overflow-y: auto;
}

.notificationItem {
  display: flex;
  gap: $devie__spacing__x1;
  padding: $devie__spacing__x1 $devie__spacing__x2;
  cursor: pointer;
  border-left: 2px solid transparent;

  &:hover {
    background: #{devie-hover-color($devie__color__background)};
  }

  &[data-unread="true"] {
    font-weight: 600;
    border-left-color: $devie__color__primary;
  }
}

.notificationIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: $devie__radius;
  background: $devie__color__background-sunken;
  color: $devie__color__text;
  flex-shrink: 0;

  [data-unread="true"] & {
    background: $devie__color__primary;
    color: $devie__color__primary-label;
  }
}

.notificationText {
  flex: 1;
  min-width: 0;
}

.notificationTitle {
  font-size: $devie__font-size__small;
  color: $devie__color__text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notificationTime {
  font-size: $devie__font-size__small;
  color: $devie__color__text-sub;
}

.richFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $devie__spacing__x1 $devie__spacing__x2;
  border-top: 1px solid $devie__color__line;
}
```

---

*Generated from [devie-ui.com/components/popover](https://devie-ui.com/components/popover)*