# <Popover />

The Popover component extends [ Base UI's Popover ](https://base-ui.com/react/components/popover) . It provides a floating panel that appears relative to a trigger element, useful for displaying supplementary content, tooltips with rich content, or contextual actions.

Built on [Base UI](https://base-ui.com/react/components/popover).

## Installation

### popover.tsx

```tsx
// https://devie-ui.com/components/popover
// https://base-ui.com/react/components/popover

import { Popover as BasePopover } from "@base-ui/react/popover";
import clsx from "clsx";
import { X } from "lucide-react";
import styles from "./Popover.module.scss";

const Root = BasePopover.Root;

function Trigger({ className, render, ...props }: BasePopover.Trigger.Props) {
  return (
    <BasePopover.Trigger
      className={clsx(!render && styles.trigger, className)}
      render={render}
      {...props}
    />
  );
}

const Portal = BasePopover.Portal;

function Backdrop({ className, ...props }: BasePopover.Backdrop.Props) {
  return (
    <BasePopover.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Positioner({ className, ...props }: BasePopover.Positioner.Props) {
  return (
    <BasePopover.Positioner
      className={clsx(styles.positioner, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BasePopover.Popup.Props) {
  return (
    <BasePopover.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Arrow({ className, ...props }: BasePopover.Arrow.Props) {
  return (
    <BasePopover.Arrow className={clsx(styles.arrow, className)} {...props} />
  );
}

function Title({ className, ...props }: BasePopover.Title.Props) {
  return (
    <BasePopover.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BasePopover.Description.Props) {
  return (
    <BasePopover.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({
  className,
  render,
  children,
  ...props
}: BasePopover.Close.Props) {
  if (render) {
    return (
      <BasePopover.Close className={className} render={render} {...props} />
    );
  }

  return (
    <BasePopover.Close className={clsx(styles.close, className)} {...props}>
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
    export type Props = BasePopover.Backdrop.Props;
  }
  export namespace Positioner {
    export type Props = BasePopover.Positioner.Props;
    export type State = BasePopover.Positioner.State;
  }
  export namespace Popup {
    export type Props = BasePopover.Popup.Props;
  }
  export namespace Arrow {
    export type Props = BasePopover.Arrow.Props;
  }
  export namespace Title {
    export type Props = BasePopover.Title.Props;
  }
  export namespace Description {
    export type Props = BasePopover.Description.Props;
  }
  export namespace Close {
    export type Props = BasePopover.Close.Props;
  }
}

export default Popover;
```

### popover.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .trigger {
        cursor: pointer;
    }

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
    }

    .popup {
        background-color: $devie__color__background;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        width: 600px;
        max-width: var(--available-width, 90vw);
        max-height: 80vh;
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
    }

    .arrow {
        fill: $devie__color__background;
        stroke: $devie__color__line;
        stroke-width: 1px;
        z-index: 1;

        &[data-side='top'] {
            bottom: calc(-1 * $devie__spacing__x1);
            rotate: 180deg;
        }

        &[data-side='bottom'] {
            top: calc(-1 * $devie__spacing__x1);
            rotate: 0deg;
        }

        &[data-side='left'] {
            right: -13px;
            rotate: 90deg;
        }

        &[data-side='right'] {
            left: -13px;
            rotate: -90deg;
        }
    }

    .title {
        margin: 0;
        font-size: $devie__font-size__normal;
        font-weight: 600;
        color: $devie__color__text;
    }

    .description {
        margin: 0;
        font-size: $devie__font-size__small;
        color: $devie__color__text-sub;
    }

    .close {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        padding: $devie__spacing__x05;
        cursor: pointer;
        color: $devie__color__text;
        border-radius: $devie__radius;
        transition: none;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }
    }
}
```

## Use Cases

### Simple popover

A basic popover with a title, description, close button, and arrow. The popover positions itself relative to the trigger and includes smooth scale and opacity animations.

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

The popover can be configured to open on hover using the `openOnHover` prop. Use `delay` to specify how long to wait (in milliseconds) before opening, and `closeDelay` for how long before closing.

### Modal mode

Set `modal` to `true` to lock page scroll and disable interactions outside the popover. Use `Popover.Backdrop` to add a visible overlay. This is useful for confirmation dialogs or actions that require user attention.

### Rich content with controlled state

A more complex example showing a notifications panel with custom header, list items, and footer actions. This demonstrates using controlled state via `open` and `onOpenChange` props, custom styling via `className`, and structured layouts within the popup.

### Additional Examples

#### Rich Content Scss

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
    background: $devie__color__background-sub;
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
  background: $devie__color__background-sub;
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

#### Rich Content Tsx

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

#### Modal Tsx

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

#### Hover Scss

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

#### Modal Scss

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

#### Hover Tsx

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

---

*Generated from [devie-ui.com/components/popover](https://devie-ui.com/components/popover)*