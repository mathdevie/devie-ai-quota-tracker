# <Toolbar />

A component that groups a set of buttons and controls. The Toolbar component extends [Base UI's Toolbar](https://base-ui.com/react/components/toolbar). It adds the `Toolbar.Toggle` subcomponent, a [Toggle](/components/toggle) with the `naked` variant.

Built on [Base UI](https://base-ui.com/react/components/toolbar).

## Installation

### Toolbar.tsx

```tsx
// https://devie-ui.com/components/toolbar
// https://base-ui.com/react/components/toolbar

import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import clsx from "clsx";
import Toggle from "./Toggle";
import styles from "./Toolbar.module.scss";

type ToggleProps = Toggle.Props;

function Root({ className, ...props }: Toolbar.Root.Props) {
  return (
    <BaseToolbar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Button({ className, ...props }: Toolbar.Button.Props) {
  return (
    <BaseToolbar.Button className={clsx(styles.button, className)} {...props} />
  );
}

function ToolbarToggle({
  className,
  disabled,
  ...props
}: Toolbar.Toggle.Props) {
  return (
    <BaseToolbar.Button
      disabled={disabled}
      render={<Toggle variant="naked" className={className} {...props} />}
    />
  );
}

function Link({ className, ...props }: Toolbar.Link.Props) {
  return (
    <BaseToolbar.Link className={clsx(styles.link, className)} {...props} />
  );
}

function Input({ className, ...props }: Toolbar.Input.Props) {
  return (
    <BaseToolbar.Input className={clsx(styles.input, className)} {...props} />
  );
}

function Group({ className, ...props }: Toolbar.Group.Props) {
  return (
    <BaseToolbar.Group className={clsx(styles.group, className)} {...props} />
  );
}

function Separator({ className, ...props }: Toolbar.Separator.Props) {
  return (
    <BaseToolbar.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Toolbar = {
  Root,
  Button,
  Toggle: ToolbarToggle,
  Link,
  Input,
  Group,
  Separator,
};

namespace Toolbar {
  export namespace Root {
    export type Props = Omit<BaseToolbar.Root.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Button {
    export type Props = Omit<BaseToolbar.Button.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Toggle {
    export type Props = Omit<ToggleProps, "variant">;
  }
  export namespace Link {
    export type Props = Omit<BaseToolbar.Link.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Input {
    export type Props = Omit<BaseToolbar.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseToolbar.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseToolbar.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Toolbar;
```

### Toolbar.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        padding: calc($devie__spacing__x1 - 1px);
        background-color: $devie__color__background;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;

        &[data-orientation='vertical'] {
            flex-direction: column;
            align-items: stretch;
        }
    }

    .button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $devie__spacing__x05;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        border: none;
        background: transparent;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x2;
        border-radius: $devie__radius;
        outline: none;
        transition: background 150ms ease, color 150ms ease;

        &:has(> svg:only-child) {
            padding: $devie__spacing__x1;
        }

        &:hover {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-pressed] {
            background: #{devie-hover-color($devie__color__background)};
            color: $devie__color__primary;
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
            background: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .link {
        display: flex;
        align-items: center;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        color: $devie__color__text-sub;
        text-decoration: none;
        font-family: $devie__font-family;
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        border-radius: $devie__radius;
        outline: none;
        transition: color 150ms ease;

        &:hover {
            color: $devie__color__text;
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .input {
        padding: calc($devie__spacing__x05 - 1px) $devie__spacing__x2;
        line-height: $devie__spacing__x3;
        border: 1px solid $devie__color__line;
        background: transparent;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        border-radius: $devie__radius;
        outline: none;
        transition: border-color 150ms ease;

        &:hover {
            border-color: $devie__color__text-sub;
        }

        &:focus {
            border-color: $devie__color__primary;
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
            border-color: #{devie-disabled-color($devie__color__line)};
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .group {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
    }

    .separator {
        width: 1px;
        height: $devie__spacing__x3;
        background-color: $devie__color__line;
        margin: 0 $devie__spacing__x05;

        [data-orientation='vertical'] > & {
            width: 100%;
            height: 1px;
            margin: $devie__spacing__x05 0;
        }
    }
}
```

## Use Cases

### Simple toolbar

A basic toolbar with icon buttons grouped by function, separated by vertical dividers.

```tsx
<Toolbar.Root>
  <Toolbar.Group aria-label="Text formatting">
    <Toolbar.Button aria-label="Bold">
      <Bold size={16} />
    </Toolbar.Button>
    <Toolbar.Button aria-label="Italic">
      <Italic size={16} />
    </Toolbar.Button>
    <Toolbar.Button aria-label="Underline">
      <Underline size={16} />
    </Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Group aria-label="Alignment">
    <Toolbar.Button aria-label="Align left">
      <AlignLeft size={16} />
    </Toolbar.Button>
    <Toolbar.Button aria-label="Align center">
      <AlignCenter size={16} />
    </Toolbar.Button>
    <Toolbar.Button aria-label="Align right">
      <AlignRight size={16} />
    </Toolbar.Button>
  </Toolbar.Group>
  <Toolbar.Separator />
  <Toolbar.Link href="#">View Help</Toolbar.Link>
</Toolbar.Root>
```

### With Toggle buttons

Use `Toolbar.Toggle` for two-state buttons such as bold, italic, or alignment.

```tsx
const [bold, setBold] = useState(false);
const [italic, setItalic] = useState(false);
const [underline, setUnderline] = useState(false);

<Toolbar.Root>
  <Toolbar.Group aria-label="Text formatting">
    <Toolbar.Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
      <Bold size={16} />
    </Toolbar.Toggle>
    <Toolbar.Toggle
      aria-label="Italic"
      pressed={italic}
      onPressedChange={setItalic}
    >
      <Italic size={16} />
    </Toolbar.Toggle>
    <Toolbar.Toggle
      aria-label="Underline"
      pressed={underline}
      onPressedChange={setUnderline}
    >
      <Underline size={16} />
    </Toolbar.Toggle>
  </Toolbar.Group>
</Toolbar.Root>
```

### With Tooltips

Icon-only toolbar buttons benefit from tooltips to provide context. Wrap each button with `Tooltip.Root` and use the `render` prop on `Tooltip.Trigger` to compose the tooltip with the button.

```tsx
<Tooltip.Provider>
  <Toolbar.Root>
    <Toolbar.Group aria-label="Text formatting">
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Bold">
              <Bold size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Bold</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Italic">
              <Italic size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Italic</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Underline">
              <Underline size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Underline</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Toolbar.Group>
    <Toolbar.Separator />
    <Toolbar.Group aria-label="Alignment">
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Align left">
              <AlignLeft size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Align Left</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Align center">
              <AlignCenter size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Align Center</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={
            <Toolbar.Button aria-label="Align right">
              <AlignRight size={16} />
            </Toolbar.Button>
          }
        />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Align Right</Tooltip.Popup>
            <Tooltip.Arrow />
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Toolbar.Group>
  </Toolbar.Root>
</Tooltip.Provider>
```

### With Menu integration

Toolbar buttons can be combined with the Menu component to create dropdown actions within the toolbar.

```tsx
<Toolbar.Root>
  <Toolbar.Button>New</Toolbar.Button>
  <Toolbar.Button>Open</Toolbar.Button>
  <Toolbar.Button>Save</Toolbar.Button>
  <Toolbar.Separator />
  <Menu.Root>
    <Toolbar.Button render={<Menu.Trigger />}>
      Actions
      <ChevronDown size={14} />
    </Toolbar.Button>
    <Menu.Portal>
      <Menu.Positioner sideOffset={8}>
        <Menu.Popup>
          <Menu.Item>
            <FileText size={14} />
            Duplicate
          </Menu.Item>
          <Menu.Item>
            <Download size={14} />
            Export
          </Menu.Item>
          <Menu.Item>
            <Share size={14} />
            Share
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item>
            <Trash2 size={14} />
            Delete
          </Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</Toolbar.Root>
```

### Vertical orientation

Use the `orientation="vertical"` prop to create a vertical toolbar, commonly used for drawing tools or side panels.

```tsx
<Toolbar.Root orientation="vertical">
  <Toolbar.Button aria-label="Move tool">
    <Move size={16} />
  </Toolbar.Button>
  <Toolbar.Button aria-label="Rectangle tool">
    <Square size={16} />
  </Toolbar.Button>
  <Toolbar.Button aria-label="Ellipse tool">
    <Circle size={16} />
  </Toolbar.Button>
  <Toolbar.Separator />
  <Toolbar.Button aria-label="Text tool">
    <Type size={16} />
  </Toolbar.Button>
  <Toolbar.Button aria-label="Pencil tool">
    <Pencil size={16} />
  </Toolbar.Button>
</Toolbar.Root>
```

---

*Generated from [devie-ui.com/components/toolbar](https://devie-ui.com/components/toolbar)*