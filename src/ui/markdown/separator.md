# <Separator />

The Separator component is built on top of the [ Base UI Separator ](https://base-ui.com/react/components/separator) component. It supports all Base UI props including `orientation`, plus an additional [text](#text) prop for displaying text in the middle of horizontal separators.

Built on [Base UI](https://base-ui.com/react/components/separator).

## Installation

### separator.tsx

```tsx
// https://devie-ui.com/components/separator
// https://base-ui.com/react/components/separator

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import clsx from "clsx";
import styles from "./Separator.module.scss";

function Separator({
  text,
  orientation = "horizontal",
  className,
  style,
  ...props
}: Separator.Props) {
  if (text && orientation === "horizontal") {
    return (
      <div className={styles.withTextContainer} style={style}>
        <BaseSeparator
          orientation="horizontal"
          className={clsx(styles.separator, className)}
          {...props}
        />
        <span className={styles.text}>{text}</span>
        <BaseSeparator
          orientation="horizontal"
          className={clsx(styles.separator, className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <BaseSeparator
      orientation={orientation}
      className={clsx(styles.separator, className)}
      style={style}
      {...props}
    />
  );
}

namespace Separator {
  export interface Props extends BaseSeparator.Props {
    text?: string;
  }
}

export default Separator;
```

### separator.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .separator {
        background-color: $devie__color__line;
        width: 100%;

        &[data-orientation="horizontal"] {
            height: 1px;
            width: 100%;
            margin: $devie__spacing__x05 0;
        }

        &[data-orientation="vertical"] {
            height: 100%;
            width: 1px;
        }
    }

    .withTextContainer {
        display: flex;
        align-items: center;
        width: 100%;
        gap: $devie__spacing__x05;
        margin: $devie__spacing__x05 0;
    }

    .text {
        color: $devie__color__text-sub;
        font-size: $devie__font-size__small;
        font-family: $devie__font-family;
        padding: 0 $devie__spacing__x05;
    }
}
```

## Use Cases

### Horizontal and vertical separators

The Separator component supports both horizontal and vertical orientations. Use the `orientation` prop with `horizontal` (default) or `vertical` to control the separator direction.

```tsx
<Separator />
```

### Separator with text

For horizontal separators, you can add text in the middle using the `text` prop. This is useful for "or" dividers or section labels.

```tsx
<Separator text="Or" />
```

### Vertical separator

Vertical separators can be used to divide content horizontally, such as in navigation bars or between columns.

```tsx
<div>
  <div>Left</div>
  <Separator orientation="vertical" />
  <div>Right</div>
</div>
```

---

*Generated from [devie-ui.com/components/separator](https://devie-ui.com/components/separator)*