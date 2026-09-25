# <ButtonGroup />

A component that joins several buttons into one control. This is a custom component with no Base UI primitive. It joins several [Button](/components/button) elements into one control: the children keep their `variant` and `size`, and only the outer corners are rounded.

## Installation

### button-group.tsx

```tsx
// https://devie-ui.com/components/button-group

import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./ButtonGroup.module.scss";

function ButtonGroup({ className, ...props }: ButtonGroup.Props) {
  return <fieldset className={clsx(styles.group, className)} {...props} />;
}

namespace ButtonGroup {
  export interface Props extends ComponentProps<"fieldset"> {
    className?: string;
  }
}

export default ButtonGroup;
```

### button-group.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .group {
        display: inline-flex;
        align-items: stretch;
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
        isolation: isolate;

        // :nth-child(n) outranks the child's own radius and height rules
        > :nth-child(n) {
            position: relative;
            height: auto;
            border-radius: 0;

            &:focus-visible {
                z-index: 1;
            }
        }

        > :first-child {
            border-top-left-radius: $devie__radius;
            border-bottom-left-radius: $devie__radius;
        }

        > :last-child {
            border-top-right-radius: $devie__radius;
            border-bottom-right-radius: $devie__radius;
        }

        > * + * {
            margin-inline-start: -1px;

            &::before {
                content: "";
                position: absolute;
                inset-block: 0;
                inset-inline-start: -1px;
                width: 1px;
                background: currentColor;
                opacity: 0.25;
            }
        }
    }
}
```

## Use Cases

### Simple button group

Wrap two or more `Button` elements in `ButtonGroup`. Set `aria-label` to name the group.

```tsx
<ButtonGroup aria-label="Pagination">
  <Button variant="secondary">Previous</Button>
  <Button variant="secondary">Next</Button>
</ButtonGroup>
```

### Split button

Pair a primary action with a [Menu](/components/menu) trigger. Pass an icon `Button` to the trigger `render` prop and give it an `aria-label`.

```tsx
<ButtonGroup aria-label="Deploy">
  <Button variant="primary">Deploy</Button>
  <Menu.Root>
    <Menu.Trigger
      aria-label="More deploy options"
      render={
        <Button variant="icon-primary">
          <ChevronDown size={16} />
        </Button>
      }
    />
    <Menu.Portal>
      <Menu.Positioner sideOffset={8} align="end">
        <Menu.Popup>
          <Menu.Item>Deploy to staging</Menu.Item>
          <Menu.Item>Schedule deploy</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Roll back</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
</ButtonGroup>
```

### Icon buttons

Use the `icon-secondary` variant for a compact group. Each button needs an `aria-label`.

```tsx
<ButtonGroup aria-label="Zoom">
  <Button variant="icon-secondary" aria-label="Zoom out">
    <ZoomOut size={16} />
  </Button>
  <Button variant="icon-secondary" aria-label="Zoom in">
    <ZoomIn size={16} />
  </Button>
  <Button variant="icon-secondary" aria-label="Fit to screen">
    <Maximize2 size={16} />
  </Button>
</ButtonGroup>
```

### Sizes

Set the same `size` on every button in a group.

```tsx
<ButtonGroup aria-label="Small">
  <Button variant="secondary" size="sm">Day</Button>
  <Button variant="secondary" size="sm">Week</Button>
  <Button variant="secondary" size="sm">Month</Button>
</ButtonGroup>

<ButtonGroup aria-label="Medium">
  <Button variant="secondary" size="md">Day</Button>
  <Button variant="secondary" size="md">Week</Button>
  <Button variant="secondary" size="md">Month</Button>
</ButtonGroup>

<ButtonGroup aria-label="Extra large">
  <Button variant="secondary" size="xl">Day</Button>
  <Button variant="secondary" size="xl">Week</Button>
  <Button variant="secondary" size="xl">Month</Button>
</ButtonGroup>
```

---

*Generated from [devie-ui.com/components/button-group](https://devie-ui.com/components/button-group)*