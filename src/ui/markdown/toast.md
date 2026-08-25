# <Toast />

The Toast component extends [ Base UI's Toast ](https://base-ui.com/react/components/toast) . Toasts display brief, non-intrusive notifications that appear temporarily and auto-dismiss. They're ideal for confirming actions, showing status updates, or providing feedback without interrupting the user's workflow.

The implementation consists of two parts: `Toast` provides the styled primitives (Viewport, Root, Title, Description, Close), while `Toaster` is a ready-to-use component that renders all active toasts with appropriate icons based on their type. Note that `Toast.Provider` must be imported directly from Base UI in your layout due to React context limitations.

Built on [Base UI](https://base-ui.com/react/components/toast).

## Installation

### toaster.tsx

```tsx
// https://devie-ui.com/components/toast

"use client";

import { CheckCircle, Info, X, XCircle } from "lucide-react";
import Toast from "@/ui/Toast";
import styles from "./Toaster.module.scss";

export function Toaster() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Viewport>
      {toasts.map((toast) => {
        const type = toast.type || "info";
        return (
          <Toast.Root key={toast.id} toast={toast} data-type={type}>
            <div className={styles.iconContainer}>
              {type === "info" && <Info size={16} strokeWidth={1.5} />}
              {type === "success" && (
                <CheckCircle size={16} strokeWidth={1.5} />
              )}
              {type === "error" && <XCircle size={16} strokeWidth={1.5} />}
            </div>
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

### toast.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        position: relative;
        background: $devie__color__background;
        border: 1px solid $devie__color__primary;
        border-left-width: 4px;
        border-radius: $devie__radius;
        padding: $devie__spacing__x2 $devie__spacing__x4 $devie__spacing__x2 $devie__spacing__x2;
        display: flex;
        align-items: flex-start;
        gap: $devie__spacing__x1;
        box-shadow: $devie__shadow__menu;
        margin-bottom: $devie__spacing__x2;
        transition: transform 0.3s ease, opacity 0.3s ease;

        &[data-type="success"] {
            border-color: $devie__color__success;
        }

        &[data-type="error"] {
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

        @keyframes toastHide {
            from {
                opacity: 1;
            }

            to {
                opacity: 0;
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

        @media (max-width: 1024px) {
            top: $devie__spacing__x2;
            right: $devie__spacing__x2;
            left: $devie__spacing__x2;
            width: auto;
        }
    }

    .title {
        font-size: $devie__font-size__normal;
        font-weight: 500;
    }

    .description {
        font-size: $devie__font-size__normal;
    }

    .action {
        background: $devie__color__primary;
        color: $devie__color__primary-label;
        border: none;
        border-radius: $devie__radius;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        font-size: $devie__font-size__small;
        cursor: pointer;

        &:hover {
            background: #{devie-hover-color($devie__color__primary)};
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
        cursor: pointer;

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }
    }
}
```

### toaster.module.scss

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

    [data-type="error"] & {
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

### toast.tsx

```tsx
// https://devie-ui.com/components/toast
// https://base-ui.com/react/components/toast

"use client";

import { Toast as BaseToast } from "@base-ui/react/toast";
import clsx from "clsx";
import styles from "./Toast.module.scss";

/**
 * NOTE: Toast.Provider must be imported directly from '@base-ui/react/toast'
 * in your layout because React context can't be properly re-exported.
 *
 * Usage:
 * 1. In layout.tsx: import { Toast } from '@base-ui/react/toast';
 * 2. Elsewhere: import Toast from '@/ui/Toast';
 */

// Base UI v1.3.0 extends the manager API with close-all support.
const useToastManager = BaseToast.useToastManager;

function Viewport({ className, ...props }: BaseToast.Viewport.Props) {
  return (
    <BaseToast.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Root({ className, ...props }: BaseToast.Root.Props) {
  return <BaseToast.Root className={clsx(styles.root, className)} {...props} />;
}

function Title({ className, ...props }: BaseToast.Title.Props) {
  return (
    <BaseToast.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BaseToast.Description.Props) {
  return (
    <BaseToast.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Action({ className, ...props }: BaseToast.Action.Props) {
  return (
    <BaseToast.Action className={clsx(styles.action, className)} {...props} />
  );
}

function Close({ className, ...props }: BaseToast.Close.Props) {
  return (
    <BaseToast.Close className={clsx(styles.close, className)} {...props} />
  );
}

const Toast = {
  useToastManager,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};

namespace Toast {
  export namespace Viewport {
    export type Props = BaseToast.Viewport.Props;
  }
  export namespace Root {
    export type Props = BaseToast.Root.Props;
    export type ToastObject = BaseToast.Root.ToastObject;
  }
  export namespace Title {
    export type Props = BaseToast.Title.Props;
  }
  export namespace Description {
    export type Props = BaseToast.Description.Props;
  }
  export namespace Action {
    export type Props = BaseToast.Action.Props;
  }
  export namespace Close {
    export type Props = BaseToast.Close.Props;
  }
}

export default Toast;
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

For quick confirmations, you can show a toast with just a description and no title.

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

Toasts support three types: `info` (default), `success`, and `error`. Each type displays a different icon and border color to communicate the message's nature.

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

const showErrorToast = () => {
  toastManager.add({
    title: "Connection failed",
    description: "Unable to reach the server. Please try again.",
    type: "error",
  });
};

<div>
  <Button variant="secondary" onClick={showInfoToast}>
    Open Toast (Info)
  </Button>
  <Button variant="secondary" onClick={showSuccessToast}>
    Open Toast (Success)
  </Button>
  <Button variant="secondary" onClick={showErrorToast}>
    Open Toast (Error)
  </Button>
</div>
```

---

*Generated from [devie-ui.com/components/toast](https://devie-ui.com/components/toast)*