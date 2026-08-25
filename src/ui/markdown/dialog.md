# <Dialog />

The Dialog component extends [ Base UI's Dialog ](https://base-ui.com/react/components/dialog) with polished default styles and structural subcomponents: `Dialog.Header`, `Dialog.Body`, and `Dialog.Footer`. Set `size` on `Dialog.Root` (`sm`, `md`, `lg`, `xl`) to pick a popup width preset. Unlike [AlertDialog](/components/alert-dialog) (which uses `role="alertdialog"` for confirmations), Dialog uses `role="dialog"` and closes on outside click or Escape by default.

Built on [Base UI](https://base-ui.com/react/components/dialog).

## Installation

### dialog.tsx

```tsx
// https://devie-ui.com/components/dialog
// https://base-ui.com/react/components/dialog

"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import * as React from "react";
import styles from "./Dialog.module.scss";

export type DialogSize = "sm" | "md" | "lg" | "xl";

const DialogInteractionContext = React.createContext<boolean | null>(null);
const DialogSizeContext = React.createContext<DialogSize>("md");

function Root({
  disableInteractions,
  size = "md",
  ...props
}: Dialog.Root.Props) {
  return (
    <DialogSizeContext.Provider value={size}>
      <DialogInteractionContext.Provider value={disableInteractions ?? null}>
        <BaseDialog.Root {...props} />
      </DialogInteractionContext.Provider>
    </DialogSizeContext.Provider>
  );
}

const createHandle = BaseDialog.createHandle;

function Trigger({ className, ...props }: BaseDialog.Trigger.Props) {
  return (
    <BaseDialog.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    />
  );
}

const Portal = BaseDialog.Portal;

function Close({ className, render, ...props }: BaseDialog.Close.Props) {
  return (
    <BaseDialog.Close
      className={clsx(!render && styles.close, className)}
      render={render}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Popup({
  className,
  disableInteractions,
  ...props
}: Dialog.Popup.Props) {
  const size = React.useContext(DialogSizeContext);
  const contextDisableInteractions = React.useContext(DialogInteractionContext);
  const resolvedDisableInteractions =
    disableInteractions ?? contextDisableInteractions ?? false;

  return (
    <BaseDialog.Popup
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

function Title({ className, ...props }: BaseDialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({ className, ...props }: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Header({ className, ...props }: Dialog.Header.Props) {
  return <div className={clsx(styles.header, className)} {...props} />;
}

function Footer({ className, ...props }: Dialog.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Body({ className, ...props }: Dialog.Body.Props) {
  return <div className={clsx(styles.body, className)} {...props} />;
}

// biome-ignore lint/correctness/noUnusedVariables: merged with `namespace Dialog` for compound export
const Dialog = {
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

namespace Dialog {
  export namespace Root {
    export interface Props extends BaseDialog.Root.Props {
      disableInteractions?: boolean;
      size?: DialogSize;
    }
  }
  export namespace Trigger {
    export type Props = BaseDialog.Trigger.Props;
  }
  export namespace Portal {
    export type Props = BaseDialog.Portal.Props;
  }
  export namespace Close {
    export type Props = BaseDialog.Close.Props;
  }
  export namespace Backdrop {
    export type Props = BaseDialog.Backdrop.Props;
  }
  export namespace Popup {
    export interface Props extends BaseDialog.Popup.Props {
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = BaseDialog.Title.Props;
  }
  export namespace Description {
    export type Props = BaseDialog.Description.Props;
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

export default Dialog;
```

### dialog.module.scss

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

## Use Cases

### Simple dialog

A basic dialog with a title, description, and action buttons. Use `Dialog.Trigger` to open and `Dialog.Close` to dismiss.

```tsx
<Dialog.Root>
  <Dialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open Dialog
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Header>
        <Dialog.Title>Edit Profile</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <Dialog.Description>
          Make changes to your profile here. Click save when
          you're done.
        </Dialog.Description>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              Cancel
            </Button>
          )}
        />
        <Dialog.Close
          render={(props) => (
            <Button {...props}>Save changes</Button>
          )}
        />
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Sizes

Use the `size` prop on `Dialog.Root` to choose a popup width. The default is `md`.

```tsx
<Dialog.Root size="lg">
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>{/* … */}</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Controlled with state

Use `open` and `onOpenChange` to control the dialog programmatically without a `Dialog.Trigger`.

```tsx
const [open, setOpen] = useState(false);

<Button variant="secondary" onClick={() => setOpen(true)}>
  Open Programmatically
</Button>
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Header>
        <Dialog.Title>Controlled Dialog</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <Dialog.Description>
          This dialog is opened programmatically via state,
          without using a Dialog.Trigger.
        </Dialog.Description>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close
          render={(props) => <Button {...props}>Got it</Button>}
        />
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

### Nested dialogs

Use a nested dialog for a short, tightly related subtask when closing the parent would discard useful context. Place the child `Dialog.Root` inside the parent root and usually give it a narrower `size`.

Base UI's [ nested dialog guidance ](https://base-ui.com/react/components/dialog#nested-dialogs) explains that a child backdrop is not rendered. This component keeps the single page backdrop, but applies the same 70% darkening to the entire parent popup through `data-nested-dialog-open`. The composed popup—including its content, border, and shadow—also shrinks by 4% per nested level without compounding the backdrop over the whole viewport.

**Best practice:** keep the stack to two layers, give every dialog its own title and visible close or cancel action, and let Base UI manage focus, Escape, and stacking. Use an [AlertDialog](/components/alert-dialog) for an irreversible confirmation. For a long or independent flow, prefer a page or replace the parent dialog instead of adding another layer. The [ WAI-ARIA modal dialog pattern ](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) similarly requires that only the active dialog is interactive, focus stays inside it, and focus returns to its invoking control when it closes.

```tsx
<Dialog.Root size="lg">
  <Dialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open project settings
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Header>
        <Dialog.Title>Project settings</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <Dialog.Description>
          Update the project details or invite someone without
          losing your changes.
        </Dialog.Description>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Root size="sm">
          <Dialog.Trigger
            render={(props) => (
              <Button {...props} variant="secondary">
                {props.children}
              </Button>
            )}
          >
            Invite collaborator
          </Dialog.Trigger>
          <Dialog.Portal>
            {/* Base UI reuses the parent's backdrop for nested dialogs. */}
            <Dialog.Popup>
              <Dialog.Header>
                <Dialog.Title>Invite collaborator</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Dialog.Description>
                  Send an invitation to join this project. Closing
                  this dialog returns you to project settings.
                </Dialog.Description>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close
                  render={(props) => (
                    <Button {...props} variant="secondary">
                      Cancel
                    </Button>
                  )}
                />
                <Dialog.Close
                  render={(props) => (
                    <Button {...props}>Send invite</Button>
                  )}
                />
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
        <Dialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              Cancel
            </Button>
          )}
        />
        <Dialog.Close
          render={(props) => (
            <Button {...props}>Save changes</Button>
          )}
        />
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

---

*Generated from [devie-ui.com/components/dialog](https://devie-ui.com/components/dialog)*