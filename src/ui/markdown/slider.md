# <Slider />

A slider that works like a range input. The Slider component extends [Base UI's Slider](https://base-ui.com/react/components/slider). It provides a user control for selecting a value or a range of values from a specified range.

Built on [Base UI](https://base-ui.com/react/components/slider).

## Installation

### Slider.tsx

```tsx
// https://devie-ui.com/components/slider
// https://base-ui.com/react/components/slider

import { Slider as BaseSlider } from "@base-ui/react/slider";
import clsx from "clsx";
import styles from "./Slider.module.scss";

function Label({ className, ...props }: Slider.Label.Props) {
  return (
    <BaseSlider.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Root({ className, ...props }: Slider.Root.Props) {
  return (
    <BaseSlider.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Control({ className, ...props }: Slider.Control.Props) {
  return (
    <BaseSlider.Control
      className={clsx(styles.control, className)}
      {...props}
    />
  );
}

function Track({ className, ...props }: Slider.Track.Props) {
  return (
    <BaseSlider.Track className={clsx(styles.track, className)} {...props} />
  );
}

function Indicator({ className, ...props }: Slider.Indicator.Props) {
  return (
    <BaseSlider.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Thumb({ className, ...props }: Slider.Thumb.Props) {
  return (
    <BaseSlider.Thumb className={clsx(styles.thumb, className)} {...props} />
  );
}

function Value({ className, ...props }: Slider.Value.Props) {
  return (
    <BaseSlider.Value className={clsx(styles.value, className)} {...props} />
  );
}

const Slider = {
  Label,
  Root,
  Control,
  Track,
  Indicator,
  Thumb,
  Value,
};

namespace Slider {
  export namespace Label {
    export type Props = Omit<BaseSlider.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Root {
    export type Props = Omit<BaseSlider.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSlider.Root.State;
    export type ChangeEventDetails = BaseSlider.Root.ChangeEventDetails;
  }
  export namespace Control {
    export type Props = Omit<BaseSlider.Control.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Track {
    export type Props = Omit<BaseSlider.Track.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Indicator {
    export type Props = Omit<BaseSlider.Indicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Thumb {
    export type Props = Omit<BaseSlider.Thumb.Props, "className"> & {
      className?: string;
    };
    export type State = BaseSlider.Thumb.State;
  }
  export namespace Value {
    export type Props = Omit<BaseSlider.Value.Props, "className"> & {
      className?: string;
    };
  }
}

export default Slider;
```

### Slider.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .label {
        line-height: $devie__spacing__x3;

        &[data-invalid] {
            color: $devie__color__danger;
        }
    }

    .root {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
        width: 200px;

        &[data-orientation='vertical'] {
            height: 200px;
            width: auto;
        }
    }

    .control {
        display: flex;
        align-items: center;
        width: 100%;
        height: $devie__spacing__x3;
        touch-action: none;

        &[data-orientation='vertical'] {
            width: $devie__spacing__x3;
            height: 100%;
            flex-direction: column;
        }

        &[data-disabled] {
            cursor: not-allowed;
        }
    }

    .track {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        height: 4px;
        border-radius: 999px;
        background-color: $devie__color__line;

        [data-orientation='vertical'] & {
            height: 100%;
            width: 4px;
            flex-direction: column;
        }

        [data-disabled] & {
            background-color: #{devie-disabled-color($devie__color__line)};
        }
    }

    .indicator {
        border-radius: 999px;
        background-color: $devie__color__primary;

        [data-orientation='horizontal'] & {
            height: 100%;
        }

        [data-orientation='vertical'] & {
            width: 100%;
        }

        [data-disabled] & {
            background-color: #{devie-disabled-color($devie__color__primary)};
        }
    }

    .thumb {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        width: $devie__spacing__x2;
        height: $devie__spacing__x2;
        border-radius: 999px;
        background-color: $devie__color__background;
        border: 2px solid $devie__color__primary;
        box-shadow: 0 1px 3px rgb(9 9 11 / 15%);
        outline: none;
        transition: box-shadow 150ms ease, border-color 150ms ease;

        &:hover:not([data-disabled]) {
            box-shadow: 0 2px 4px rgb(9 9 11 / 20%);
        }

        &:focus-visible {
            @include devie-focus-ring(2px);
        }

        &[data-dragging] {
            box-shadow: 0 2px 6px rgb(9 9 11 / 25%);
        }

        [data-disabled] & {
            cursor: not-allowed;
            background-color: #{devie-disabled-color($devie__color__background)};
            border-color: #{devie-disabled-color($devie__color__primary)};
            box-shadow: none;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    .value {
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        color: $devie__color__text-sub;
        font-family: $devie__font-family;
    }
}
```

## Use Cases

### Simple slider

A basic slider with a single thumb. Use the `defaultValue` prop for uncontrolled usage, or `value` with `onValueChange` for controlled state management.

```tsx
<Slider.Root defaultValue={50}>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

### Range slider

For range selection, pass an array to `defaultValue` and render multiple `Slider.Thumb` components with the `index` prop.

```tsx
<Slider.Root defaultValue={[25, 75]}>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb index={0} />
      <Slider.Thumb index={1} />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

### Slider with value display

Use the `Slider.Value` component to display the current slider value. It automatically updates as the slider is moved.

```tsx
<Slider.Root defaultValue={50}>
  <Slider.Value />
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

### Vertical slider

Set the `orientation` prop to `"vertical"` for a vertical slider layout.

```tsx
<Slider.Root defaultValue={50} orientation="vertical">
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

### Disabled slider

Sliders can be disabled using the `disabled` prop. When disabled, the slider is not interactive and shows a reduced visual state.

```tsx
<Slider.Root defaultValue={50} disabled>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
      <Slider.Thumb />
    </Slider.Track>
  </Slider.Control>
</Slider.Root>
```

---

*Generated from [devie-ui.com/components/slider](https://devie-ui.com/components/slider)*