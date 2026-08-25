# <Button />

The Button component extends [ Base UI's Button ](https://base-ui.com/react/components/button) . It adds [variant](#variant), [size](#size), [loading state](#loading-state), and [icon](#icon) props for common use cases.

Built on [Base UI](https://base-ui.com/react/components/button).

## Installation

### button.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
  .button {
    position: relative;
    display: flex;
    height: fit-content;
    align-items: center;
    justify-content: center;
    border: none;
    white-space: nowrap;
    cursor: pointer;
    gap: $devie__spacing__x05;
    border-radius: $devie__radius;
    font-family: $devie__font-family;
    width: fit-content;
    line-height: 1;
    transition: none;

    &[data-loading="true"] {
      user-select: none;
      color: transparent;
    }
  }

  .sizeSm {
    padding: $devie__spacing__x05 $devie__spacing__x1;
    font-size: $devie__font-size__small;
    gap: $devie__spacing__x05;
  }

  .sizeMd {
    padding: $devie__spacing__x1 $devie__spacing__x2;
    font-size: $devie__font-size__normal;
    gap: $devie__spacing__x05;
  }

  .sizeXl {
    padding: $devie__spacing__x2 $devie__spacing__x3;
    font-size: $devie__font-size__normal;
    gap: $devie__spacing__x1;
  }

  .icon {
    &.sizeSm {
      padding: $devie__spacing__x05;
    }

    &.sizeMd {
      padding: $devie__spacing__x1;
    }

    &.sizeXl {
      padding: $devie__spacing__x2;
    }
  }

  .loader {
    aspect-ratio: 1;
    border-radius: 50%;
    animation: buttonLoaderSpin 1s infinite linear;
  }

  .sizeSm .loader {
    width: 14px;
  }

  .sizeMd .loader {
    width: 20px;
  }

  .sizeXl .loader {
    width: 24px;
  }

  @keyframes buttonLoaderSpin {
    100% {
      transform: rotate(1turn);
    }
  }

  .loadingOverlay {
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: $devie__radius;
    display: none;
    background: inherit;

    [data-loading="true"] & {
      display: flex;
    }

    .variantNaked & {
      background: $devie__color__background;
    }
  }

  .variantPrimary {
    color: $devie__color__primary-label;
    background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%), $devie__color__primary;
    box-shadow: 0 0 0 1px $devie__color__primary, 0 1px 1px 0 rgb(9 9 11 / 15%), 0 0.75px 0 0 rgb(255 255 255 / 50%) inset;

    &:hover:not([data-loading="true"]):not([data-disabled]) {
      color: #{devie-hover-color($devie__color__primary-label)};
      background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%),
      #{devie-hover-color($devie__color__primary)};
      box-shadow: 0 0 0 1px #{devie-hover-color($devie__color__primary)},
      0 1px 1px 0 rgb(9 9 11 / 15%),
      0 0.75px 0 0 rgb(255 255 255 / 50%) inset;
    }

    &[data-disabled] {
      cursor: not-allowed;
      color: #{devie-disabled-color($devie__color__primary-label)};
      background: #{devie-disabled-color($devie__color__primary)};
      box-shadow: none;
    }
  }

  .variantPrimary .loader {
    background: radial-gradient(farthest-side, $devie__color__primary-label 94%, #0000) top/4px 4px no-repeat,
      conic-gradient(#0000 30%, $devie__color__primary-label);
    mask: radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0);
  }

  .variantSecondary {
    color: $devie__color__text;
    outline: 1px solid $devie__color__line;
    background: linear-gradient(180deg, rgb(9 9 11 / 0%) 0%, rgb(9 9 11 / 3%) 100%), $devie__color__background;

    &:hover:not([data-loading="true"]):not([data-disabled]) {
      color: #{devie-hover-color($devie__color__text)};
      background: linear-gradient(180deg, rgb(9 9 11 / 0%) 0%, rgb(9 9 11 / 3%) 100%),
      #{devie-hover-color($devie__color__background)};
    }

    &[data-disabled] {
      cursor: not-allowed;
      color: #{devie-disabled-color($devie__color__text)};
      outline: 1px solid #{devie-disabled-color($devie__color__line)};
      background: #{devie-disabled-color($devie__color__background)};
    }
  }

  .variantSecondary .loader {
    background: radial-gradient(farthest-side, $devie__color__text 94%, #0000) top/4px 4px no-repeat,
      conic-gradient(#0000 30%, $devie__color__text);
    mask: radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0);
  }

  .variantDanger {
    color: $devie__color__danger-label;
    background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%), $devie__color__danger;
    box-shadow: 0 0 0 1px $devie__color__danger, 0 1px 1px 0 rgb(9 9 11 / 15%), 0 0.75px 0 0 rgb(255 255 255 / 50%) inset;

    &:hover:not([data-loading="true"]):not([data-disabled]) {
      color: #{devie-hover-color($devie__color__danger-label)};
      background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%),
      #{devie-hover-color($devie__color__danger)};
      box-shadow: 0 0 0 1px #{devie-hover-color($devie__color__danger)},
      0 1px 1px 0 rgb(9 9 11 / 15%),
      0 0.75px 0 0 rgb(255 255 255 / 50%) inset;
    }

    &[data-disabled] {
      cursor: not-allowed;
      color: #{devie-disabled-color($devie__color__danger-label)};
      background: #{devie-disabled-color($devie__color__danger)};
      box-shadow: none;
    }
  }

  .variantDanger .loader {
    background: radial-gradient(farthest-side, $devie__color__danger-label 94%, #0000) top/4px 4px no-repeat,
      conic-gradient(#0000 30%, $devie__color__danger-label);
    mask: radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0);
  }

  .variantNaked {
    color: $devie__color__text;
    background: transparent;

    &:hover:not([data-loading="true"]):not([data-disabled]) {
      color: #{devie-hover-color($devie__color__text)};
      background: #{devie-hover-color($devie__color__background)};
    }

    &[data-disabled] {
      cursor: not-allowed;
      color: #{devie-disabled-color($devie__color__text)};
    }
  }

  .variantNaked .loader {
    background: radial-gradient(farthest-side, $devie__color__text 94%, #0000) top/4px 4px no-repeat,
      conic-gradient(#0000 30%, $devie__color__text);
    mask: radial-gradient(farthest-side, #0000 calc(100% - 4px), #000 0);
  }
}
```

### button.tsx

```tsx
// https://devie-ui.com/components/button
// https://base-ui.com/react/components/button

import { Button as BaseButton } from "@base-ui/react/button";
import clsx from "clsx";
import styles from "./Button.module.scss";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "naked"
  | "icon-primary"
  | "icon-secondary"
  | "icon-danger"
  | "icon-naked";

type Size = "sm" | "md" | "xl";

function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  disabled,
  isLoading,
  ...props
}: Button.Props) {
  return (
    <BaseButton
      className={clsx(
        styles.button,
        variant === "primary" && styles.variantPrimary,
        variant === "secondary" && styles.variantSecondary,
        variant === "danger" && styles.variantDanger,
        variant === "naked" && styles.variantNaked,
        variant === "icon-primary" && [styles.variantPrimary, styles.icon],
        variant === "icon-secondary" && [styles.variantSecondary, styles.icon],
        variant === "icon-danger" && [styles.variantDanger, styles.icon],
        variant === "icon-naked" && [styles.variantNaked, styles.icon],
        size === "sm" && styles.sizeSm,
        size === "md" && styles.sizeMd,
        size === "xl" && styles.sizeXl,
        className,
      )}
      data-loading={isLoading}
      disabled={disabled || isLoading}
      focusableWhenDisabled={isLoading}
      {...props}
    >
      {children}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loader} />
        </div>
      )}
    </BaseButton>
  );
}

namespace Button {
  export interface Props extends BaseButton.Props {
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
  }
  export type State = BaseButton.State;
}

export default Button;
```

## Use Cases

### Button with different variants

The Button component offers four distinct variants to fit different UI needs: **primary** for main call-to-action buttons, **secondary** for less visually dominant actions, **danger** for destructive actions, and **naked** for minimal buttons without background.

```tsx
<Button variant="primary">Confirm</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="naked">Naked</Button>
```

### Button with different sizes

Buttons can be sized using the `size` prop with three options: `sm` for compact buttons, `md` for the default medium size, and `xl` for larger, more prominent buttons.

```tsx
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="xl">Extra Large</Button>
```

### Loading state of the button

The `isLoading` prop provides a CSS-only loader state that maintains the button's original dimensions to prevent layout shifts during loading transitions. This ensures a smooth UI experience, especially in forms or button groups where sudden width changes could disrupt the layout.

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleClick = () => {
  setIsLoading(true);
  setTimeout(() => {
    setIsLoading(false);
  }, 2000);
};

<Button isLoading={isLoading} onClick={handleClick}>
  Save Changes
</Button>
```

### Disabled state of the buttons

Buttons can be disabled using the standard `disabled` prop. When disabled, buttons show a reduced opacity and are not interactive, providing clear visual feedback to users.

```tsx
<Button variant="primary" disabled>Disabled Primary</Button>
<Button variant="secondary" disabled>Disabled Secondary</Button>
<Button variant="danger" disabled>Disabled Danger</Button>
<Button variant="naked" disabled>Disabled Naked</Button>
```

### Icon-only buttons

The `icon` prop creates a square button with equal padding on all sides, perfect for icon-only buttons. This works with all variants and sizes.

```tsx
<Button variant="icon-primary">
  <Heart size={16} />
</Button>
<Button variant="icon-secondary">
  <Settings size={16} />
</Button>
<Button variant="icon-danger">
  <Trash2 size={16} />
</Button>
<Button variant="icon-naked">
  <Share2 size={16} />
</Button>
```

---

*Generated from [devie-ui.com/components/button](https://devie-ui.com/components/button)*