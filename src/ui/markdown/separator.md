# <Separator />

A separator line that is accessible to screen readers. The Separator component extends [Base UI's Separator](https://base-ui.com/react/components/separator). It adds a [text](#text) prop for a label in the middle of the separator.

Built on [Base UI](https://base-ui.com/react/components/separator).

## Installation

### Separator.tsx

```tsx
// https://devie-ui.com/components/separator
// https://base-ui.com/react/components/separator

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import clsx from "clsx";
import styles from "./Separator.module.scss";

function Separator({ text, className, ...props }: Separator.Props) {
  if (text) {
    return (
      <BaseSeparator
        aria-label={text}
        className={clsx(styles.withTextContainer, className)}
        {...props}
      >
        <span className={styles.line} />
        <span className={styles.text} aria-hidden="true">
          {text}
        </span>
        <span className={styles.line} />
      </BaseSeparator>
    );
  }

  return (
    <BaseSeparator className={clsx(styles.separator, className)} {...props} />
  );
}

namespace Separator {
  export interface Props extends Omit<BaseSeparator.Props, "className"> {
    className?: string;
    text?: string;
  }
}

export default Separator;
```

### Separator.module.scss

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

        &[data-orientation="vertical"] {
            flex-direction: column;
            width: auto;
            height: 100%;
            margin: 0;
        }
    }

    .line {
        flex: 1;
        background-color: $devie__color__line;

        [data-orientation="horizontal"] > & {
            height: 1px;
        }

        [data-orientation="vertical"] > & {
            width: 1px;
        }
    }

    .text {
        color: $devie__color__text-sub;
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        font-family: $devie__font-family;
        padding: 0 $devie__spacing__x05;
    }
}
```

## Use Cases

### Simple separator

Place a `Separator` between two blocks of content. The default `orientation` is `horizontal`.

```tsx
<Separator />
```

### With text

Set `text` to show a label in the middle, such as "Or". The text also becomes the separator's accessible name.

```tsx
<Separator text="Or" />
```

### Vertical orientation

Set `orientation` to `vertical`. The line fills the height of its parent.

```tsx
<div>
  <div>Left</div>
  <Separator orientation="vertical" />
  <div>Right</div>
</div>
```

---

*Generated from [devie-ui.com/components/separator](https://devie-ui.com/components/separator)*