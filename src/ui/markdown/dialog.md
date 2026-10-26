# <Dialog />

A dialog that opens on top of the entire page. The Dialog component extends [Base UI's Dialog](https://base-ui.com/react/components/dialog). It adds the `Dialog.Header`, `Dialog.Body`, and `Dialog.Footer` subcomponents and a `size` prop on `Dialog.Root`, and a `disableInteractions` prop on `Dialog.Root` and `Dialog.Popup`. For a confirmation that needs an explicit answer, use [AlertDialog](/components/alert-dialog).

Built on [Base UI](https://base-ui.com/react/components/dialog).

## Installation

### Dialog.tsx

```tsx
// https://devie-ui.com/components/dialog
// https://base-ui.com/react/components/dialog

"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import type React from "react";
import { createContext, useContext } from "react";
import styles from "./Dialog.module.scss";

type DialogSize = "sm" | "md" | "lg" | "xl";

const DialogInteractionContext = createContext<boolean | null>(null);
const DialogSizeContext = createContext<DialogSize>("md");

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

const Trigger = BaseDialog.Trigger;

const Portal = BaseDialog.Portal;

const Close = BaseDialog.Close;

function Backdrop({ className, ...props }: Dialog.Backdrop.Props) {
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
  const size = useContext(DialogSizeContext);
  const contextDisableInteractions = useContext(DialogInteractionContext);
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
      inert={resolvedDisableInteractions ? true : undefined}
      {...props}
    />
  );
}

function Title({ className, ...props }: Dialog.Title.Props) {
  return (
    <BaseDialog.Title
      className={clsx(styles.title, className)}
      // biome-ignore lint/a11y/useHeadingContent: Base UI Title renders children into this heading
      render={<h3 />}
      {...props}
    />
  );
}

function Description({ className, ...props }: Dialog.Description.Props) {
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
  export type Size = DialogSize;
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
    export type Props = Omit<BaseDialog.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Popup {
    export interface Props extends Omit<BaseDialog.Popup.Props, "className"> {
      className?: string;
      disableInteractions?: boolean;
    }
  }
  export namespace Title {
    export type Props = Omit<BaseDialog.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseDialog.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Header {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Footer {
    export type Props = React.ComponentProps<"div">;
  }
  export namespace Body {
    export type Props = React.ComponentProps<"div">;
  }
}

export default Dialog;
```

### Dialog.module.scss

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
        transition: opacity 150ms ease-out;

        &[data-starting-style],
        &[data-ending-style] {
            opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .popup {
        position: fixed;
        left: 50%;
        top: 50%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 90vw;
        max-height: 95vh;
        transform: translate(-50%, -50%);
        background: $devie__color__background-raised;
        border-radius: $devie__radius;
        box-shadow: $devie__shadow__menu;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        transition:
            opacity 150ms ease-out,
            transform 150ms ease-out,
            filter 150ms ease-out;

        &[data-nested-dialog-open] {
            filter: brightness($dialog-backdrop-brightness);
            transform: translate(-50%, -50%) scale(calc(1 - 0.04 * var(--nested-dialogs)));
        }

        &[data-starting-style],
        &[data-ending-style] {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .popupSm {
        min-width: min(288px, 90vw);
        max-width: 384px;
    }

    .popupMd {
        min-width: min(384px, 90vw);
        max-width: 640px;
    }

    .popupLg {
        min-width: min(512px, 90vw);
        max-width: 832px;
    }

    .popupXl {
        min-width: min(768px, 90vw);
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
        min-height: 0;
        overflow-y: auto;
        padding: $devie__spacing__x3 $devie__spacing__x3;
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x2;
    }

    .title {
        font-size: $devie__font-size__title3;
        line-height: $devie__spacing__x3;
        color: $devie__color__text;
        margin: 0;
    }

    .description {
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x3;
        color: $devie__color__text-sub;
        margin: 0;
    }
}
```

## Use Cases

### Simple dialog

Use `Dialog.Trigger` to open the dialog and `Dialog.Close` to dismiss it.

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

Set `size` on `Dialog.Root` to `sm`, `md`, `lg`, or `xl`. The default is `md`.

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

Use `open` and `onOpenChange` to control the dialog without a `Dialog.Trigger`.

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

Place a child `Dialog.Root` inside the parent and give it a smaller `size`. Base UI renders [no second backdrop](https://base-ui.com/react/components/dialog#nested-dialogs). Instead, the parent popup is dimmed and shrinks while the child is open. Keep the stack to two levels, and use [AlertDialog](/components/alert-dialog) for an irreversible confirmation.

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

### Async action

Set `disableInteractions` on `Dialog.Popup` while an action is pending. The popup stays inert until the action completes.

```tsx
const [open, setOpen] = useState(false);
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);
  // Simulate an API call
  await new Promise((resolve) => setTimeout(resolve, 2000));
  setIsSaving(false);
  setOpen(false);
};

<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Rename project
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup disableInteractions={isSaving}>
      <Dialog.Header>
        <Dialog.Title>Rename project</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        <Field.Root name="project">
          <Field.Label>Project name</Field.Label>
          <Field.Control defaultValue="Quarterly report" />
        </Field.Root>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close
          render={(props) => (
            <Button {...props} variant="secondary">
              Cancel
            </Button>
          )}
        />
        <Button isLoading={isSaving} onClick={handleSave}>
          Save
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

---

*Generated from [devie-ui.com/components/dialog](https://devie-ui.com/components/dialog)*