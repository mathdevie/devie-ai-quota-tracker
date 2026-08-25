# <AlertDialog />

The AlertDialog component extends the [ Base UI Alert Dialog ](https://base-ui.com/react/components/alert-dialog) with additional structural sub-components: `AlertDialog.Header`, `AlertDialog.Body`, and `AlertDialog.Footer`. It also adds a `disableInteractions` prop on the root to temporarily make the dialog content inert during async actions. Use `size` on `AlertDialog.Root` for the same popup width presets as Dialog.

Built on [Base UI](https://base-ui.com/react/components/alert-dialog).

## Installation

### alert-dialog.module.scss

```scss
@use './_devie.scss' as *;

$dialog-backdrop-opacity: 0.7;
$dialog-backdrop-brightness: 1 - $dialog-backdrop-opacity;

@layer devie {
    .backdrop {
        background-color: #000000;
        opacity: $dialog-backdrop-opacity;
        position: fixed;
        inset: 0;
    }

    .popup {
        position: fixed;
        left: 50%;
        top: 50%;
        width: 90vw;
        max-height: 95vh;
        transform: translate(-50%, -50%);
        background: $devie__color__background;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        transition: filter 150ms ease-out, transform 150ms ease-out;

        &[data-nested-dialog-open] {
            filter: brightness($dialog-backdrop-brightness);
            transform: translate(-50%, -50%) scale(calc(1 - 0.04 * var(--nested-dialogs)));
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .popupSm {
        min-width: 288px;
        max-width: 384px;
    }

    .popupMd {
        min-width: 384px;
        max-width: 640px;
    }

    .popupLg {
        min-width: 512px;
        max-width: 832px;
    }

    .popupXl {
        min-width: 768px;
        max-width: 1152px;
    }

    .popupNonInteractive {
        pointer-events: none;
        user-select: none;
    }

    .header {
        border-bottom: 1px solid $devie__color__line;
        padding: $devie__spacing__x2 $devie__spacing__x3;
    }

    .footer {
        border-top: 1px solid $devie__color__line;
        padding: $devie__spacing__x2 $devie__spacing__x3;
        display: flex;
        justify-content: flex-end;
        gap: $devie__spacing__x2;
    }

    .body {
        padding: $devie__spacing__x3 $devie__spacing__x3;
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x2;
    }

    .title {
        font-size: $devie__font-size__title3;
        color: $devie__color__text;
        margin: 0;
    }

    .description {
        font-size: $devie__font-size__normal;
        color: $devie__color__text-sub;
        margin: 0;
    }
}
```

### alert-dialog.tsx

```tsx
// https://devie-ui.com/components/alert-dialog
// https://base-ui.com/react/components/alert-dialog

"use client";

import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import clsx from "clsx";
import * as React from "react";
import styles from "./AlertDialog.module.scss";
import type { DialogSize } from "./Dialog";

export type { DialogSize };

const AlertDialogInteractionContext = React.createContext<boolean | null>(null);

const AlertDialogSizeContext = React.createContext<DialogSize>("md");

function Root({
  disableInteractions,
  size = "md",
  ...props
}: AlertDialog.Root.Props) {
  return (
    <AlertDialogSizeContext.Provider value={size}>
      <AlertDialogInteractionContext.Provider
        value={disableInteractions ?? null}
      >
        <BaseAlertDialog.Root {...props} />
      </AlertDialogInteractionContext.Provider>
    </AlertDialogSizeContext.Provider>
  );
}
const createHandle = BaseAlertDialog.createHandle;

function Trigger({ className, ...props }: BaseAlertDialog.Trigger.Props) {
  return (
    <BaseAlertDialog.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseAlertDialog.Portal;

function Close({ className, render, ...props }: BaseAlertDialog.Close.Props) {
  return (
    <BaseAlertDialog.Close
      className={clsx(!render && styles.close, className)}
      render={render}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseAlertDialog.Backdrop.Props) {
  return (
    <BaseAlertDialog.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Popup({
  className,
  disableInteractions,
  ...props
}: AlertDialog.Popup.Props) {
  const size = React.useContext(AlertDialogSizeContext);
  const contextDisableInteractions = React.useContext(
    AlertDialogInteractionContext,
  );
  const resolvedDisableInteractions =
    disableInteractions ?? contextDisableInteractions ?? false;

  return (
    <BaseAlertDialog.Popup
      className={clsx(
        styles.popup,
        size === "sm" && styles.popupSm,
        size === "md" && styles.popupMd,
        size === "lg" && styles.popupLg,
        size === "xl" && styles.popupXl,
        resolvedDisableInteractions && styles.popupNonInteractive,
        className,
      )}
      aria-busy={resolvedDisableInteractions ? true : undefined}
      inert={resolvedDisableInteractions ? true : undefined}
      {...props}
    />
  );
}

function Title({ className, ...props }: BaseAlertDialog.Title.Props) {
  return (
    <BaseAlertDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({
  className,
  ...props
}: BaseAlertDialog.Description.Props) {
  return (
    <BaseAlertDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Header({ className, ...props }: AlertDialog.Header.Props) {
  return <div className={clsx(styles.header, className)} {...props} />;
}

function Footer({ className, ...props }: AlertDialog.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Body({ className, ...props }: AlertDialog.Body.Props) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

// biome-ignore lint/correctness/noUnusedVariables: merged with `namespace AlertDialog` for compound export
const AlertDialog = {
  Root,
  createHandle,
  Trigger,
  Portal,
  Close,
  Backdrop,
  Popup,
  Header,
  Footer,
  Title,
  Description,
  Body,
};

namespace AlertDialog {
  export namespace Root {
    export interface Props extends BaseAlertDialog.Root.Props {
      disableInteractions?: boolean;
      size?: DialogSize;
    }
  }
  export namespace Trigger {
    export type Props = BaseAlertDialog.Trigger.Props;
  }
  export namespace Portal {
    export type Props = BaseAlertDialog.Portal.Props;
  }
  export namespace Close {
    export type Props = BaseAlertDialog.Close.Props;
  }
  export namespace Backdrop {
    export type Props = BaseAlertDialog.Backdrop.Props;
  }
  export namespace Popup {
    export interface Props extends BaseAlertDialog.Popup.Props {
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = BaseAlertDialog.Title.Props;
  }
  export namespace Description {
    export type Props = BaseAlertDialog.Description.Props;
  }
  export namespace Header {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Footer {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Body {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default AlertDialog;
```

## Use Cases

### Opening with a Trigger component

The most common way to open an AlertDialog is by using the `AlertDialog.Trigger` component. Place it inside the `AlertDialog.Root` and it will automatically handle opening the dialog when clicked.

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open AlertDialog
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Header>
        <AlertDialog.Title>Discard draft?</AlertDialog.Title>
        <AlertDialog.Description>
          You can't undo this action.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          Your draft will be permanently deleted. Are you sure you want
          to continue?
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              {props.children}
            </Button>
          )}
        >
          Cancel
        </AlertDialog.Close>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="danger">
              {props.children}
            </Button>
          )}
        >
          Discard
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Sizes

Use the `size` prop on `AlertDialog.Root` to pick a popup width (`sm`, `md`, `lg`, `xl`). The default is `md`.

```tsx
<AlertDialog.Root size="lg">
  <AlertDialog.Trigger>Open</AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>{/* … */}</AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Opening with a detached Trigger

When defining the AlertDialog content next to its trigger is not practical, you can use a detached trigger with `AlertDialog.createHandle()`. This allows you to place the trigger button anywhere in your component tree while still controlling the same dialog instance.

```tsx
const handle = AlertDialog.createHandle();

<AlertDialog.Trigger
  handle={handle}
  render={(props) => (
    <Button {...props} variant="secondary">
      {props.children}
    </Button>
  )}
>
  Open AlertDialog (Detached Trigger)
</AlertDialog.Trigger>

<AlertDialog.Root handle={handle}>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete item?</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          The item will be permanently removed from your account.
          This cannot be recovered.
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              {props.children}
            </Button>
          )}
        >
          Cancel
        </AlertDialog.Close>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="danger">
              {props.children}
            </Button>
          )}
        >
          Delete
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Opening programmatically with state

For complete control over the dialog's visibility, use the `open` and `onOpenChange` props on `AlertDialog.Root`. This is useful when you need to open the dialog based on application logic, such as after an API call or in response to a menu action.

```tsx
const [open, setOpen] = useState(false);

<Button variant="secondary" onClick={() => setOpen(true)}>
  Open AlertDialog (Programmatic Trigger)
</Button>

<AlertDialog.Root open={open} onOpenChange={setOpen}>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Header>
        <AlertDialog.Title>Sign out?</AlertDialog.Title>
        <AlertDialog.Description>
          You will need to sign in again.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <p>
          Are you sure you want to sign out of your account? Any
          unsaved changes will be lost.
        </p>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              {props.children}
            </Button>
          )}
        >
          Cancel
        </AlertDialog.Close>
        <Button variant="danger" onClick={() => setOpen(false)}>
          Sign out
        </Button>
      </AlertDialog.Footer>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### With a form and async submission

AlertDialogs can contain forms with validation. This example shows how to handle async form submission with a loading state on the submit button while using `disableInteractions` to keep the dialog content inert until the operation completes.

```tsx
const [open, setOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (event) => {
  event.preventDefault();
  setIsLoading(true);

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 3000));

  setIsLoading(false);
  setOpen(false);
};

<AlertDialog.Root
  open={open}
  onOpenChange={setOpen}
  disableInteractions={isLoading}
>
  <AlertDialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open AlertDialog (With Form)
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <Form onSubmit={handleSubmit}>
        <AlertDialog.Header>
          <AlertDialog.Title>Edit your profile</AlertDialog.Title>
          <AlertDialog.Description>
            Make changes to your profile information
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <Field.Root name="name">
            <Field.Label>Name</Field.Label>
            <Field.Control placeholder="Enter your name" required />
            <Field.Error match="valueMissing" />
          </Field.Root>
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Field.Control
              placeholder="Enter your email"
              required
              type="email"
            />
            <Field.Error match="valueMissing" />
            <Field.Error match="typeMismatch" />
          </Field.Root>
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <AlertDialog.Close
            render={(props) => (
              <Button {...props} variant="secondary" disabled={isLoading}>
                {props.children}
              </Button>
            )}
          >
            Cancel
          </AlertDialog.Close>
          <Button type="submit" isLoading={isLoading}>
            Save changes
          </Button>
        </AlertDialog.Footer>
      </Form>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### With Select dropdowns

AlertDialogs can contain Select components for dropdown selections. However, there's a caveat: when a Select is inside a dialog (or any scrollable container with `overflow-y: auto`), the dropdown may display excessive white space below the last item.

This happens because Base UI's `Select.Positioner` defaults to `alignItemWithTrigger=&#123;true&#125;`, which calculates available height based on viewport boundaries rather than the container's bounds.

**The fix:** Pass `alignItemWithTrigger=&#123;false&#125;` to `Select.Positioner`. This disables the "selected item aligns with trigger" UX behavior (the popup appears below/above instead of overlapping), but resolves the height calculation issue.

```tsx
const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

<AlertDialog.Root>
  <AlertDialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open AlertDialog (With Select)
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup>
      <AlertDialog.Header>
        <AlertDialog.Title>Select preferences</AlertDialog.Title>
        <AlertDialog.Description>
          Choose your preferred options below
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Body>
        <div>
          <label>Favorite fruit</label>
          <Select.Root items={fruits}>
            <Select.Trigger style={{ width: "100%" }}>
              <Select.Value placeholder="Select a fruit..." />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              {/* alignItemWithTrigger={false} fixes height issues in dialogs */}
              <Select.Positioner alignItemWithTrigger={false}>
                <Select.Popup>
                  <Select.List>
                    {fruits.map((fruit) => (
                      <Select.Item key={fruit.value} value={fruit.value}>
                        <Select.ItemText>{fruit.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
        <div>
          <label>Priority level</label>
          <Select.Root items={priorities}>
            <Select.Trigger style={{ width: "100%" }}>
              <Select.Value placeholder="Select priority..." />
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner alignItemWithTrigger={false}>
                <Select.Popup>
                  <Select.List>
                    {priorities.map((priority) => (
                      <Select.Item key={priority.value} value={priority.value}>
                        <Select.ItemText>{priority.label}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </AlertDialog.Body>
      <AlertDialog.Footer>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              {props.children}
            </Button>
          )}
        >
          Cancel
        </AlertDialog.Close>
        <AlertDialog.Close
          render={(props) => (
            <Button {...props}>{props.children}</Button>
          )}
        >
          Save preferences
        </AlertDialog.Close>
      </AlertDialog.Footer>
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

### Minimal design without Header/Footer

For simpler use cases like notifications or quick confirmations, you can omit the `AlertDialog.Header`, `AlertDialog.Body`, and `AlertDialog.Footer` components entirely. Apply custom padding and positioning directly on the `AlertDialog.Popup` and use `AlertDialog.Close` with an icon for a clean, minimal look.

```tsx
<AlertDialog.Root>
  <AlertDialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open Minimal Dialog
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Backdrop />
    <AlertDialog.Popup
      style={{
        padding: "var(--devie__spacing__x4)",
        textAlign: "center",
      }}
    >
      <AlertDialog.Close
        render={(props) => (
          <Button
            {...props}
            variant="icon-naked"
            style={{
              position: "absolute",
              top: "var(--devie__spacing__x2)",
              right: "var(--devie__spacing__x2)",
            }}
          >
            <X size={20} />
          </Button>
        )}
      />
      <AlertDialog.Title style={{ marginBottom: "var(--devie__spacing__x2)" }}>
        Welcome!
      </AlertDialog.Title>
      <AlertDialog.Description>
        This is a minimal alert dialog without Header or Footer components.
        Just a centered message with a close icon.
      </AlertDialog.Description>
      <AlertDialog.Close
        render={(props) => (
          <Button
            {...props}
            style={{
              marginTop: "var(--devie__spacing__x3)",
              display: "block",
              marginInline: "auto",
            }}
          >
            Got it
          </Button>
        )}
      />
    </AlertDialog.Popup>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

---

*Generated from [devie-ui.com/components/alert-dialog](https://devie-ui.com/components/alert-dialog)*