# <Command />

The Command component is a command palette built by composing [Dialog](/components/dialog) (modal overlay) and [ Base UI's Autocomplete ](https://base-ui.com/react/components/autocomplete) (inline filtering and keyboard navigation). The autocomplete is rendered inline inside the dialog, with no portal or positioner needed. Use `Command.Shortcut` to show keyboard hints alongside items. This component is not a direct Base UI primitive.

Built on [Base UI](https://base-ui.com/react/components/autocomplete#command-palette).

## Installation

### command.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .backdrop {
        background-color: #000000;
        opacity: 0.7;
        position: fixed;
        inset: 0;
    }

    .dialogPopup {
        position: fixed;
        left: 50%;
        top: 50%;
        width: 90vw;
        min-width: 384px;
        max-width: 640px;
        max-height: 85vh;
        transform: translate(-50%, -55%);
        background: $devie__color__background;
        border-radius: $devie__radius-strong;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .inputWrapper {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x2;
        padding: $devie__spacing__x2 $devie__spacing__x3;
        border-bottom: 1px solid $devie__color__line;
    }

    .inputKbd {
        flex-shrink: 0;
        margin-left: auto;
    }

    .inputIcon {
        flex-shrink: 0;
        color: $devie__color__text-sub;
    }

    .input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: $devie__color__text;
        font-size: $devie__font-size__normal;
        font-family: $devie__font-family;
        padding: $devie__spacing__x05 0;

        &::placeholder {
            color: $devie__color__text-sub;
        }
    }

    .toolbar {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;
        padding: $devie__spacing__x05 $devie__spacing__x2;
        border-bottom: 1px solid $devie__color__line;
        font-size: $devie__font-size__small;
        color: $devie__color__text-sub;
    }

    .listScroller {
        max-height: 300px;
        overflow-y: auto;
        scroll-padding-block: $devie__spacing__x1;
        background: $devie__color__background-sub;

        mask-image:
            linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent);
        -webkit-mask-image:
            linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent);
    }

    .list {
        display: flex;
        flex-direction: column;
        padding: $devie__spacing__x1;
    }

    .item {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x2;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        border-radius: calc($devie__radius - $devie__spacing__x05);
        color: $devie__color__text;
        font-size: $devie__font-size__small;
        cursor: pointer;
        outline: none;
        user-select: none;
        transition: none;
        min-height: 36px;

        &:hover:not([data-disabled]),
        &[data-highlighted]:not([data-disabled]) {
            background: #{devie-hover-color($devie__color__background-sub)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
        }
    }

    .empty {
        padding: $devie__spacing__x4 $devie__spacing__x2;
        text-align: center;
        color: $devie__color__text-sub;
        font-size: $devie__font-size__small;

        &:empty {
            display: none;
        }
    }

    .group {
        display: flex;
        flex-direction: column;
    }

    .groupLabel {
        padding: $devie__spacing__x1 $devie__spacing__x2;
        padding-top: $devie__spacing__x2;
        font-size: 11px;
        font-weight: 600;
        color: $devie__color__text-sub;
        user-select: none;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .separator {
        height: 1px;
        background-color: $devie__color__line;
        margin: $devie__spacing__x1 $devie__spacing__x1;
    }

    .shortcut {
        margin-left: auto;
        flex-shrink: 0;
        font-family: $devie__font-family;
        font-size: 11px;
        line-height: 1;
        color: $devie__color__text-sub;
        padding: 0;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $devie__spacing__x2;
        padding: $devie__spacing__x1 $devie__spacing__x3;
        border-top: 1px solid $devie__color__line;
        font-size: $devie__font-size__small;
        color: $devie__color__text-sub;
    }

    .panel {
        background: $devie__color__background;
        border-radius: $devie__radius-strong;
        border: 1px solid $devie__color__line;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
}
```

### command.tsx

```tsx
// https://devie-ui.com/components/command
// https://base-ui.com/react/components/autocomplete#command-palette

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import { Search } from "lucide-react";
import type React from "react";
import styles from "./Command.module.scss";

function Root(props: Command.Root.Props) {
  const {
    autoHighlight = "always",
    keepHighlight = true,
    open = true,
    inline = true,
    ...rest
  } = props;
  return (
    <Autocomplete.Root
      autoHighlight={autoHighlight}
      keepHighlight={keepHighlight}
      open={open}
      inline={inline}
      {...rest}
    />
  );
}

const Dialog = BaseDialog.Root;

function DialogTrigger({ className, ...props }: BaseDialog.Trigger.Props) {
  return (
    <BaseDialog.Trigger className={className} {...props} />
  );
}

function DialogPopup({
  className,
  children,
  ...props
}: Command.DialogPopup.Props) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        className={clsx(styles.dialogPopup, className)}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function Input({ className, endAddon, ...props }: Command.Input.Props) {
  return (
    <div className={styles.inputWrapper}>
      <Search size={16} className={styles.inputIcon} />
      <Autocomplete.Input
        className={clsx(styles.input, className)}
        {...props}
      />
      {endAddon && <div className={styles.inputKbd}>{endAddon}</div>}
    </div>
  );
}

function List({ className, ...props }: Autocomplete.List.Props) {
  return (
    <div className={styles.listScroller}>
      <Autocomplete.List className={clsx(styles.list, className)} {...props} />
    </div>
  );
}

function Item({ className, ...props }: Autocomplete.Item.Props) {
  return (
    <Autocomplete.Item className={clsx(styles.item, className)} {...props} />
  );
}

function Empty({ className, ...props }: Autocomplete.Empty.Props) {
  return (
    <Autocomplete.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

function Group({ className, ...props }: Autocomplete.Group.Props) {
  return (
    <Autocomplete.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Autocomplete.GroupLabel.Props) {
  return (
    <Autocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Autocomplete.Separator.Props) {
  return (
    <Autocomplete.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Shortcut({ className, ...props }: Command.Shortcut.Props) {
  return <kbd className={clsx(styles.shortcut, className)} {...props} />;
}

function Toolbar({ className, ...props }: Command.Toolbar.Props) {
  return <div className={clsx(styles.toolbar, className)} {...props} />;
}

function Footer({ className, ...props }: Command.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Panel({ className, ...props }: Command.Panel.Props) {
  return <div className={clsx(styles.panel, className)} {...props} />;
}

const Collection = Autocomplete.Collection;

const Command = {
  Root,
  Dialog,
  DialogTrigger,
  DialogPopup,
  Input,
  List,
  Item,
  Empty,
  Group,
  GroupLabel,
  Separator,
  Shortcut,
  Toolbar,
  Footer,
  Panel,
  Collection,
};

namespace Command {
  export namespace Root {
    export type Props = React.ComponentProps<typeof Autocomplete.Root>;
  }
  export namespace Dialog {
    export type Props = BaseDialog.Root.Props;
  }
  export namespace DialogTrigger {
    export type Props = BaseDialog.Trigger.Props;
  }
  export namespace DialogPopup {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
      children?: React.ReactNode;
    }
  }
  export namespace Input {
    export interface Props extends Autocomplete.Input.Props {
      endAddon?: React.ReactNode;
    }
  }
  export namespace List {
    export type Props = Autocomplete.List.Props;
  }
  export namespace Item {
    export type Props = Autocomplete.Item.Props;
    export type State = Autocomplete.Item.State;
  }
  export namespace Empty {
    export type Props = Autocomplete.Empty.Props;
  }
  export namespace Group {
    export type Props = Autocomplete.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Autocomplete.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = Autocomplete.Separator.Props;
  }
  export namespace Shortcut {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
  export namespace Toolbar {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Footer {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Panel {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Collection {
    export type Props = React.ComponentProps<typeof Autocomplete.Collection>;
  }
}

export default Command;
```

## Use Cases

### Simple command palette

A basic command palette with a flat list of items. Type to filter, use arrow keys to navigate, and press Enter to select.

```tsx
const items = ["New File", "Open...", "Save", "Export", "Print"];

<Command.Dialog>
  <Command.DialogTrigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open Command Palette
  </Command.DialogTrigger>
  <Command.DialogPopup>
    <Command.Root items={items}>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        {(item: string) => (
          <Command.Item key={item} value={item}>
            {item}
          </Command.Item>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  </Command.DialogPopup>
</Command.Dialog>
```

### Grouped items

Use `Command.Group`, `Command.GroupLabel`, and `Command.Collection` to organize items into sections.

```tsx
const groups = [
  {
    value: "Suggestions",
    items: [
      { value: "linear", label: "Linear" },
      { value: "figma", label: "Figma" },
      { value: "slack", label: "Slack" },
    ],
  },
  {
    value: "Commands",
    items: [
      { value: "clipboard-history", label: "Clipboard History" },
      { value: "import-extension", label: "Import Extension" },
      { value: "system-preferences", label: "System Preferences" },
    ],
  },
];

<Command.Dialog>
  <Command.DialogTrigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Grouped Commands
  </Command.DialogTrigger>
  <Command.DialogPopup>
    <Command.Root items={groups}>
      <Command.Input placeholder="Search for apps and commands..." />
      <Command.List>
        {(group) => (
          <Fragment key={group.value}>
            <Command.Group items={group.items}>
              <Command.GroupLabel>{group.value}</Command.GroupLabel>
              <Command.Collection>
                {(item) => (
                  <Command.Item key={item.value} value={item.value}>
                    {item.label}
                  </Command.Item>
                )}
              </Command.Collection>
            </Command.Group>
            <Command.Separator />
          </Fragment>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  </Command.DialogPopup>
</Command.Dialog>
```

### With keyboard shortcuts

Use `Command.Shortcut` inside items to display keyboard shortcut hints aligned to the right.

```tsx
const items = [
  { value: "new-file", label: "New File", shortcut: "⌘N" },
  { value: "open", label: "Open...", shortcut: "⌘O" },
  { value: "save", label: "Save", shortcut: "⌘S" },
  { value: "save-as", label: "Save As...", shortcut: "⇧⌘S" },
  { value: "close", label: "Close Window", shortcut: "⌘W" },
  { value: "preferences", label: "Preferences", shortcut: "⌘," },
];

<Command.Dialog>
  <Command.DialogTrigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Commands with Shortcuts
  </Command.DialogTrigger>
  <Command.DialogPopup>
    <Command.Root items={items}>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        {(item) => (
          <Command.Item key={item.value} value={item.value}>
            <span>{item.label}</span>
            {item.shortcut && (
              <Command.Shortcut>{item.shortcut}</Command.Shortcut>
            )}
          </Command.Item>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  </Command.DialogPopup>
</Command.Dialog>
```

### With toolbar filters

Use `Command.Toolbar` between the input and list to add filter chips, toggles, or any controls. It renders a styled `<div>` with a bottom border, so you can compose whatever filter UI you need inside it.

```tsx
const [filter, setFilter] = useState<string>("all");

const filtered =
  filter === "all"
    ? allItems
    : allItems.filter((i) => i.category === filter);

const filterLabels = { all: "All", docs: "Docs", pages: "Pages" };

<Command.Dialog>
  <Command.DialogTrigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Search with Filters
  </Command.DialogTrigger>
  <Command.DialogPopup>
    <Command.Root items={filtered}>
      <Command.Input placeholder="Search pages and docs..." />
      <Command.Toolbar>
        <Menu.Root>
          <Menu.Trigger render={<Button variant="secondary" size="sm" />}>
            <ListFilter size={14} />
            {filterLabels[filter]}
            <ChevronDown size={12} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4} align="start">
              <Menu.Popup>
                <Menu.RadioGroup value={filter} onValueChange={setFilter}>
                  <Menu.RadioItem value="all">
                    <Menu.RadioItemIndicator />
                    All
                  </Menu.RadioItem>
                  <Menu.RadioItem value="docs">
                    <Menu.RadioItemIndicator />
                    Docs
                  </Menu.RadioItem>
                  <Menu.RadioItem value="pages">
                    <Menu.RadioItemIndicator />
                    Pages
                  </Menu.RadioItem>
                </Menu.RadioGroup>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </Command.Toolbar>
      <Command.List>
        {(item) => (
          <Command.Item key={item.value} value={item.value}>
            {item.label}
          </Command.Item>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
  </Command.DialogPopup>
</Command.Dialog>
```

### With keyboard trigger and footer

Wire a global keyboard shortcut (e.g. `⌘J`) to toggle the command palette. Use `Command.Footer` to display navigation hints with `Kbd` keys.

```tsx
const [open, setOpen] = useState(false);

useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };
  document.addEventListener("keydown", down);
  return () => document.removeEventListener("keydown", down);
}, []);

<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.DialogTrigger
    render={(props) => (
      <Button {...props} variant="secondary">
        {props.children}
      </Button>
    )}
  >
    Open{" "}
    <Kbd.Group>
      <Kbd.Root>⌘</Kbd.Root>
      <Kbd.Root>J</Kbd.Root>
    </Kbd.Group>
  </Command.DialogTrigger>
  <Command.DialogPopup>
    <Command.Root items={items}>
      <Command.Input placeholder="Type a command..." />
      <Command.List>
        {(item) => (
          <Command.Item key={item} value={item}>
            {item}
          </Command.Item>
        )}
      </Command.List>
      <Command.Empty>No results found.</Command.Empty>
    </Command.Root>
    <Command.Footer>
      <div>
        <Kbd.Group>
          <Kbd.Root><ArrowUp size={12} /></Kbd.Root>
          <Kbd.Root><ArrowDown size={12} /></Kbd.Root>
        </Kbd.Group>
        Navigate
        <Kbd.Root><CornerDownLeft size={12} /></Kbd.Root>
        Open
      </div>
      <span>
        <Kbd.Root>Esc</Kbd.Root> Close
      </span>
    </Command.Footer>
  </Command.DialogPopup>
</Command.Dialog>
```

### Standalone (without dialog)

Use `Command.Panel` to render the command palette inline without a dialog wrapper. Useful for building search experiences embedded directly in a page.

```tsx
const items = ["Calendar", "Search Emoji", "Calculator", "Launch Pad", "Manage Windows"];

<Command.Panel>
  <Command.Root items={items}>
    <Command.Input placeholder="Type a command..." />
    <Command.List>
      {(item) => (
        <Command.Item key={item} value={item}>
          {item}
        </Command.Item>
      )}
    </Command.List>
    <Command.Empty>No results found.</Command.Empty>
  </Command.Root>
</Command.Panel>
```

---

*Generated from [devie-ui.com/components/command](https://devie-ui.com/components/command)*