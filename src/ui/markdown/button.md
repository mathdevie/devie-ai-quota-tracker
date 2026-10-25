# <Button />

A button that can render as another tag and stay focusable when disabled. The Button component extends [Base UI's Button](https://base-ui.com/react/components/button). It adds [variant](#variant), [size](#size), and [isLoading](#loading-state) props, with [icon variants](#icon) for icon-only buttons.

Built on [Base UI](https://base-ui.com/react/components/button).

## Installation

### Button.tsx

```tsx
// https://devie-ui.com/components/button
// https://base-ui.com/react/components/button

import { Button as BaseButton } from "@base-ui/react/button";
import clsx from "clsx";
import styles from "./Button.module.scss";

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
        size === "lg" && styles.sizeLg,
        className,
      )}
      aria-busy={isLoading || undefined}
      data-loading={isLoading}
      disabled={disabled || isLoading}
      focusableWhenDisabled={isLoading}
      {...props}
    >
      {children}
      {isLoading && (
        <span className={styles.loadingOverlay}>
          <span className={styles.loader} />
        </span>
      )}
    </BaseButton>
  );
}

namespace Button {
  export type Variant =
    | "primary"
    | "secondary"
    | "danger"
    | "naked"
    | "icon-primary"
    | "icon-secondary"
    | "icon-danger"
    | "icon-naked";
  export type Size = "sm" | "md" | "lg";
  export interface Props extends Omit<BaseButton.Props, "className"> {
    className?: string;
    variant?: Variant;
    size?: Size;
    isLoading?: boolean;
  }
  export type State = BaseButton.State;
}

export default Button;
```

### Button.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .button {
        position: relative;
        display: flex;
        box-sizing: border-box;
        height: fit-content;
        align-items: center;
        justify-content: center;
        border: none;
        white-space: nowrap;
        gap: $devie__spacing__x05;
        border-radius: $devie__radius;
        font-family: $devie__font-family;
        font-weight: 500;
        width: fit-content;
        line-height: $devie__spacing__x2;
        transition: none;

        &[data-loading="true"] {
            user-select: none;
            color: transparent;
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }
    }

    .sizeSm {
        min-height: $devie__spacing__x3;
        border-radius: calc($devie__radius / 2);
        padding: $devie__spacing__x05 $devie__spacing__x1;
        font-size: $devie__font-size__small;
        gap: $devie__spacing__x05;
    }

    .sizeMd {
        min-height: $devie__spacing__x4;
        padding: $devie__spacing__x1 $devie__spacing__x2;
        font-size: $devie__font-size__normal;
        gap: $devie__spacing__x05;
    }

    .sizeLg {
        min-height: $devie__spacing__x6;
        padding: $devie__spacing__x2 $devie__spacing__x3;
        font-size: $devie__font-size__normal;
        gap: $devie__spacing__x1;
    }

    .icon {
        &.sizeSm {
            min-width: $devie__spacing__x3;
            padding: $devie__spacing__x05;
        }

        &.sizeMd {
            min-width: $devie__spacing__x4;
            padding: $devie__spacing__x1;
        }

        &.sizeLg {
            min-width: $devie__spacing__x6;
            padding: $devie__spacing__x2;
        }
    }

    .loader {
        aspect-ratio: 1;
        border-radius: 50%;
        animation: buttonLoaderSpin 1s infinite linear;

        @media (prefers-reduced-motion: reduce) {
            animation-duration: 3s;
        }
    }

    .sizeSm .loader {
        width: 14px;
    }

    .sizeMd .loader {
        width: 20px;
    }

    .sizeLg .loader {
        width: 24px;
    }

    @keyframes buttonLoaderSpin {
        100% {
            transform: rotate(1turn);
        }
    }

    .loadingOverlay {
        position: absolute;
        inset: 1px;
        align-items: center;
        justify-content: center;
        border-radius: inherit;
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
        box-shadow: 0 0 0 1px $devie__color__primary inset, 0 1px 1px 0 rgb(9 9 11 / 15%), 0 1.75px 0 0 rgb(255 255 255 / 50%) inset;

        &:hover:not([data-loading="true"]):not([data-disabled]) {
            color: #{devie-hover-color($devie__color__primary-label)};
            background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%),
            #{devie-hover-color($devie__color__primary)};
            box-shadow: 0 0 0 1px #{devie-hover-color($devie__color__primary)} inset,
            0 1px 1px 0 rgb(9 9 11 / 15%),
            0 1.75px 0 0 rgb(255 255 255 / 50%) inset;
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
        background: linear-gradient(180deg, rgb(9 9 11 / 0%) 0%, rgb(9 9 11 / 3%) 100%), $devie__color__background;
        box-shadow: 0 0 0 1px $devie__color__line inset, 0 1px 2px 0 rgb(9 9 11 / 12%);

        &:hover:not([data-loading="true"]):not([data-disabled]) {
            color: #{devie-hover-color($devie__color__text)};
            background: linear-gradient(180deg, rgb(9 9 11 / 0%) 0%, rgb(9 9 11 / 3%) 100%),
            #{devie-hover-color($devie__color__background)};
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
            box-shadow: 0 0 0 1px #{devie-disabled-color($devie__color__line)} inset;
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
        box-shadow: 0 0 0 1px $devie__color__danger inset, 0 1px 1px 0 rgb(9 9 11 / 15%), 0 1.75px 0 0 rgb(255 255 255 / 50%) inset;

        &:hover:not([data-loading="true"]):not([data-disabled]) {
            color: #{devie-hover-color($devie__color__danger-label)};
            background: linear-gradient(180deg, rgb(255 255 255 / 16%) 0%, rgb(255 255 255 / 0%) 100%),
            #{devie-hover-color($devie__color__danger)};
            box-shadow: 0 0 0 1px #{devie-hover-color($devie__color__danger)} inset,
            0 1px 1px 0 rgb(9 9 11 / 15%),
            0 1.75px 0 0 rgb(255 255 255 / 50%) inset;
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

        &:active:not([data-loading="true"]):not([data-disabled]) {
            background: #{devie-hover-color(devie-hover-color($devie__color__background))};
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

## Use Cases

### Variants

Set `variant` to `primary`, `secondary`, `danger`, or `naked`. Use `danger` for a destructive action and `naked` for a button without background.

```tsx
<Button variant="primary">Confirm</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="naked">Naked</Button>
```

### Sizes

Set `size` to `sm`, `md`, or `lg`. The default is `md`.

```tsx
<Button variant="primary" size="sm">Small</Button>
<Button variant="primary" size="md">Medium</Button>
<Button variant="primary" size="lg">Large</Button>
```

### Loading state

Set `isLoading` to show a spinner. The button keeps its width, so the layout does not shift.

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

### Disabled state

Set `disabled` to prevent interaction.

```tsx
<Button variant="primary" disabled>Disabled Primary</Button>
<Button variant="secondary" disabled>Disabled Secondary</Button>
<Button variant="danger" disabled>Disabled Danger</Button>
<Button variant="naked" disabled>Disabled Naked</Button>
```

### Icon-only buttons

Set `variant` to `icon-primary`, `icon-secondary`, `icon-danger`, or `icon-naked` and give the button an `aria-label`. With an icon up to 16px, it stays square at the height of a labeled button of the same `size`.

```tsx
<Button variant="icon-primary" aria-label="Like">
  <Heart size={16} />
</Button>
<Button variant="icon-secondary" aria-label="Settings">
  <Settings size={16} />
</Button>
<Button variant="icon-danger" aria-label="Delete">
  <Trash2 size={16} />
</Button>
<Button variant="icon-naked" aria-label="Share">
  <Share2 size={16} />
</Button>

<Button variant="secondary" size="sm">
  <ArrowUp size={14} />
  Send now
</Button>
<Button variant="icon-secondary" size="sm" aria-label="Edit">
  <Pencil size={14} />
</Button>
<Button variant="icon-secondary" size="sm" aria-label="Remove">
  <X size={14} />
</Button>
```

---

*Generated from [devie-ui.com/components/button](https://devie-ui.com/components/button)*