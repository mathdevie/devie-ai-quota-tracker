# <Toggle />

The Toggle component extends [ Base UI's Toggle ](https://base-ui.com/react/components/toggle) . It's a two-state button that can be on (pressed) or off. Perfect for favorite buttons, formatting options, or any binary state.

Built on [Base UI](https://base-ui.com/react/components/toggle).

## Installation

### toggle.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $devie__spacing__x05;
        padding: $devie__spacing__x1;
        border: none;
        cursor: pointer;
        border-radius: $devie__radius;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        line-height: 1;
        transition: background 150ms ease, color 150ms ease, outline-color 150ms ease;

        &[data-disabled] {
            cursor: not-allowed;
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: 2px;
        }
    }

    .variantSecondary {
        color: $devie__color__text;
        background: transparent;
        outline: 1px solid $devie__color__line;

        &:hover:not([data-disabled]):not([data-pressed]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-pressed] {
            background: $devie__color__primary;
            color: $devie__color__primary-label;
            outline-color: $devie__color__primary;

            &:hover:not([data-disabled]) {
                background: #{devie-hover-color($devie__color__primary)};
                color: #{devie-hover-color($devie__color__primary-label)};
                outline-color: #{devie-hover-color($devie__color__primary)};
            }
        }

        &[data-disabled] {
            color: #{devie-disabled-color($devie__color__text)};
            outline-color: #{devie-disabled-color($devie__color__line)};

            &[data-pressed] {
                background: #{devie-disabled-color($devie__color__primary)};
                color: #{devie-disabled-color($devie__color__primary-label)};
                outline-color: #{devie-disabled-color($devie__color__primary)};
            }
        }
    }

    .variantNaked {
        color: $devie__color__text;
        background: transparent;

        &:hover:not([data-disabled]):not([data-pressed]) {
            background: #{devie-hover-color($devie__color__background)};
        }

        &[data-pressed] {
            background: $devie__color__primary;
            color: $devie__color__primary-label;

            &:hover:not([data-disabled]) {
                background: #{devie-hover-color($devie__color__primary)};
                color: #{devie-hover-color($devie__color__primary-label)};
            }
        }

        &[data-disabled] {
            color: #{devie-disabled-color($devie__color__text)};

            &[data-pressed] {
                background: #{devie-disabled-color($devie__color__primary)};
                color: #{devie-disabled-color($devie__color__primary-label)};
            }
        }
    }
}
```

### toggle.tsx

```tsx
// https://devie-ui.com/components/toggle
// https://base-ui.com/react/components/toggle

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import clsx from "clsx";
import styles from "./Toggle.module.scss";

type Variant = "secondary" | "naked";

function Toggle({ className, variant = "secondary", ...props }: Toggle.Props) {
  return (
    <BaseToggle
      className={clsx(
        styles.toggle,
        variant === "secondary" && styles.variantSecondary,
        variant === "naked" && styles.variantNaked,
        className,
      )}
      {...props}
    />
  );
}

namespace Toggle {
  export interface Props extends BaseToggle.Props {
    variant?: Variant;
  }
  export type State = BaseToggle.State;
  export type ChangeEventDetails = BaseToggle.ChangeEventDetails;
}

export default Toggle;
```

## Use Cases

### Simple toggle

A basic toggle button that switches between pressed and unpressed states. The `data-pressed` attribute is applied when active.

```tsx
<Toggle aria-label="Favorite">
  <Heart size={16} />
</Toggle>
```

### Controlled toggle

Use `pressed` and `onPressedChange` props for controlled state management.

```tsx
const [starred, setStarred] = useState(false);

<Toggle aria-label="Star" pressed={starred} onPressedChange={setStarred}>
  <Star size={16} fill={starred ? "currentColor" : "none"} />
</Toggle>
```

### With text

Toggle buttons can include text labels alongside icons.

```tsx
const [muted, setMuted] = useState(false);

<Toggle pressed={muted} onPressedChange={setMuted}>
  {muted ? <BellOff size={16} /> : <Bell size={16} />}
  {muted ? "Muted" : "Mute"}
</Toggle>
```

### Disabled

Use the `disabled` prop to prevent interaction.

```tsx
<Toggle disabled aria-label="Favorite">
  <Heart size={16} />
</Toggle>
<Toggle disabled defaultPressed aria-label="Favorite">
  <Heart size={16} />
</Toggle>
```

---

*Generated from [devie-ui.com/components/toggle](https://devie-ui.com/components/toggle)*