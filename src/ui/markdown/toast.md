# <Toast />

A component that generates notifications. The Toast component extends [Base UI's Toast](https://base-ui.com/react/components/toast). It adds the `Toaster` component, which renders active toasts with an icon for their `type`.

Wrap your layout in `Toast.Provider`, and render `Toaster` inside it.

Built on [Base UI](https://base-ui.com/react/components/toast).

## Installation

### Toast.tsx

```tsx
// https://devie-ui.com/components/toast
// https://base-ui.com/react/components/toast

import { Toast as BaseToast } from "@base-ui/react/toast";
import clsx from "clsx";
import styles from "./Toast.module.scss";

const Provider = BaseToast.Provider;

const useToastManager = BaseToast.useToastManager;

function Viewport({ className, ...props }: Toast.Viewport.Props) {
  return (
    <BaseToast.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Root({ className, ...props }: Toast.Root.Props) {
  return <BaseToast.Root className={clsx(styles.root, className)} {...props} />;
}

function Title({ className, ...props }: Toast.Title.Props) {
  return (
    <BaseToast.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: Toast.Description.Props) {
  return (
    <BaseToast.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Action({ className, ...props }: Toast.Action.Props) {
  return (
    <BaseToast.Action className={clsx(styles.action, className)} {...props} />
  );
}

function Close({ className, ...props }: Toast.Close.Props) {
  return (
    <BaseToast.Close className={clsx(styles.close, className)} {...props} />
  );
}

const Toast = {
  Provider,
  useToastManager,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};

namespace Toast {
  export type Type = "info" | "success" | "warning" | "danger";
  export namespace Provider {
    export type Props = BaseToast.Provider.Props;
  }
  export namespace Viewport {
    export type Props = Omit<BaseToast.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Root {
    export type Props = Omit<BaseToast.Root.Props, "className"> & {
      className?: string;
    };
    export type ToastObject = BaseToast.Root.ToastObject;
  }
  export namespace Title {
    export type Props = Omit<BaseToast.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseToast.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Action {
    export type Props = Omit<BaseToast.Action.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Close {
    export type Props = Omit<BaseToast.Close.Props, "className"> & {
      className?: string;
    };
  }
}

export default Toast;
```

### Toast.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        position: relative;
        background-color: color-mix(in srgb, $devie__color__primary 5%, $devie__color__background-raised 95%);
        border: 1px solid $devie__color__primary;
        border-radius: $devie__radius;
        padding: calc($devie__spacing__x2 - 1px) calc($devie__spacing__x4 - 1px) calc($devie__spacing__x2 - 1px) calc($devie__spacing__x2 - 1px);
        display: flex;
        align-items: flex-start;
        gap: $devie__spacing__x1;
        box-shadow: $devie__shadow__menu;
        margin-bottom: $devie__spacing__x2;
        transition: transform 0.3s ease, opacity 0.3s ease;

        &[data-type="success"] {
            background-color: color-mix(in srgb, $devie__color__success 5%, $devie__color__background-raised 95%);
            border-color: $devie__color__success;
        }

        &[data-type="warning"] {
            background-color: color-mix(in srgb, $devie__color__warning 5%, $devie__color__background-raised 95%);
            border-color: $devie__color__warning;
        }

        &[data-type="danger"] {
            background-color: color-mix(in srgb, $devie__color__danger 5%, $devie__color__background-raised 95%);
            border-color: $devie__color__danger;
        }

        &[data-starting-style] {
            animation: toastSlideIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        &[data-swiping] {
            transform: translateX(var(--toast-swipe-movement-x));
            transition: none;
        }

        &[data-ending-style] {
            opacity: 0;
        }

        &[data-ending-style][data-swipe-direction='right'] {
            transform: translateX(calc(100% + $devie__spacing__x4));
        }

        &[data-ending-style][data-swipe-direction='left'] {
            transform: translateX(calc(-100% - $devie__spacing__x4));
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;

            &[data-starting-style] {
                animation: none;
            }
        }

        @keyframes toastSlideIn {
            from {
                transform: translateX(calc(100% + $devie__spacing__x4));
            }

            to {
                transform: translateX(0);
            }
        }
    }

    .viewport {
        position: fixed;
        top: $devie__spacing__x4;
        right: $devie__spacing__x4;
        z-index: 1;
        width: 320px;

        @media (max-width: 480px) {
            top: $devie__spacing__x2;
            right: $devie__spacing__x2;
            left: $devie__spacing__x2;
            width: auto;
        }
    }

    .title {
        font-size: $devie__font-size__normal;
        font-weight: 600;
        line-height: $devie__spacing__x3;
    }

    .description {
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x3;
    }

    .action {
        background: $devie__color__primary;
        color: $devie__color__primary-label;
        border: none;
        border-radius: $devie__radius;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        font-family: inherit;
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;

        &:hover {
            background: #{devie-hover-color($devie__color__primary)};
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }
    }

    .close {
        position: absolute;
        top: $devie__spacing__x2;
        right: $devie__spacing__x1;
        background: transparent;
        border: none;
        color: $devie__color__text;
        padding: $devie__spacing__x05;
        border-radius: $devie__radius;
        display: grid;
        place-items: center;
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

### Toaster.tsx

```tsx
// https://devie-ui.com/components/toast

"use client";

import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import type React from "react";
import Toast from "./Toast";
import styles from "./Toaster.module.scss";

const icons: Record<string, React.ReactNode> = {
  info: <Info size={16} strokeWidth={1.5} />,
  success: <CheckCircle size={16} strokeWidth={1.5} />,
  warning: <AlertTriangle size={16} strokeWidth={1.5} />,
  danger: <XCircle size={16} strokeWidth={1.5} />,
} satisfies Record<Toast.Type, React.ReactNode>;

export function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Viewport>
      {toasts.map((toast) => {
        const type = toast.type || "info";
        return (
          <Toast.Root key={toast.id} toast={toast} data-type={type}>
            <div className={styles.iconContainer}>{icons[type]}</div>
            <div className={styles.contentContainer}>
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
              {toast.actionProps && <Toast.Action {...toast.actionProps} />}
            </div>
            <Toast.Close aria-label="Close">
              <X size={16} />
            </Toast.Close>
          </Toast.Root>
        );
      })}
    </Toast.Viewport>
  );
}
```

### Toaster.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .iconContainer {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: $devie__spacing__x05;
        color: $devie__color__primary;

        [data-type="success"] & {
            color: $devie__color__success;
        }

        [data-type="warning"] & {
            color: $devie__color__warning;
        }

        [data-type="danger"] & {
            color: $devie__color__danger;
        }
    }

    .contentContainer {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
        flex: 1;
        min-width: 0;
    }
}
```

## Use Cases

### Basic usage

Use the `useToastManager` hook to add toasts programmatically. Call `toastManager.add()` with a title and optional description to display a notification.

```tsx
const toastManager = Toast.useToastManager();

const showToast = () => {
  toastManager.add({
    title: "Changes saved successfully",
    description: "Your preferences have been updated.",
    type: "success",
  });
};

<Button variant="secondary" onClick={showToast}>
  Open Toast
</Button>
```

### Simple toast

Pass only a `description` to `toastManager.add()` for a quick confirmation.

```tsx
const toastManager = Toast.useToastManager();

const showSimpleToast = () => {
  toastManager.add({
    description: "Your changes have been saved.",
    type: "success",
  });
};

<Button variant="secondary" onClick={showSimpleToast}>
  Open Toast (Simple)
</Button>
```

### Toast types

Set `type` in `toastManager.add()` to `info`, `success`, `warning`, or `danger`. The default is `info`.

```tsx
const toastManager = Toast.useToastManager();

const showInfoToast = () => {
  toastManager.add({
    title: "New message received",
    description: "You have 3 unread messages in your inbox.",
    type: "info",
  });
};

const showSuccessToast = () => {
  toastManager.add({
    title: "Payment successful",
    description: "Your order #12345 has been confirmed.",
    type: "success",
  });
};

const showWarningToast = () => {
  toastManager.add({
    title: "Storage almost full",
    description: "You have used 90% of your storage quota.",
    type: "warning",
  });
};

const showDangerToast = () => {
  toastManager.add({
    title: "Connection failed",
    description: "Unable to reach the server. Please try again.",
    type: "danger",
  });
};

<div>
  <Button variant="secondary" onClick={showInfoToast}>
    Open Toast (Info)
  </Button>
  <Button variant="secondary" onClick={showSuccessToast}>
    Open Toast (Success)
  </Button>
  <Button variant="secondary" onClick={showWarningToast}>
    Open Toast (Warning)
  </Button>
  <Button variant="secondary" onClick={showDangerToast}>
    Open Toast (Danger)
  </Button>
</div>
```

---

*Generated from [devie-ui.com/components/toast](https://devie-ui.com/components/toast)*