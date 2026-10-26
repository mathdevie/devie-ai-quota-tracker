# <Progress />

A progress bar that displays the status of a long task. The Progress component extends [Base UI's Progress](https://base-ui.com/react/components/progress). It adds an animated indicator for the [indeterminate](#indeterminate) state.

Built on [Base UI](https://base-ui.com/react/components/progress).

## Installation

### Progress.tsx

```tsx
// https://devie-ui.com/components/progress
// https://base-ui.com/react/components/progress

import { Progress as BaseProgress } from "@base-ui/react/progress";
import clsx from "clsx";
import styles from "./Progress.module.scss";

function Root({ className, ...props }: Progress.Root.Props) {
  return (
    <BaseProgress.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Track({ className, ...props }: Progress.Track.Props) {
  return (
    <BaseProgress.Track className={clsx(styles.track, className)} {...props} />
  );
}

function Indicator({ className, ...props }: Progress.Indicator.Props) {
  return (
    <BaseProgress.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Label({ className, ...props }: Progress.Label.Props) {
  return (
    <BaseProgress.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Value({ className, ...props }: Progress.Value.Props) {
  return (
    <BaseProgress.Value className={clsx(styles.value, className)} {...props} />
  );
}

const Progress = {
  Root,
  Track,
  Indicator,
  Label,
  Value,
};

namespace Progress {
  export namespace Root {
    export type Props = Omit<BaseProgress.Root.Props, "className"> & {
      className?: string;
    };
    export type State = BaseProgress.Root.State;
  }
  export namespace Track {
    export type Props = Omit<BaseProgress.Track.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Indicator {
    export type Props = Omit<BaseProgress.Indicator.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Label {
    export type Props = Omit<BaseProgress.Label.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Value {
    export type Props = Omit<BaseProgress.Value.Props, "className"> & {
      className?: string;
    };
  }
}

export default Progress;
```

### Progress.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
        width: 100%;
        font-family: $devie__font-family;
    }

    .track {
        position: relative;
        height: $devie__spacing__x1;
        width: 100%;
        overflow: hidden;
        border-radius: $devie__radius;
        background-color: $devie__color__background-sunken;
    }

    .indicator {
        height: 100%;
        background-color: $devie__color__primary;
        border-radius: $devie__radius;
        transition: width 0.3s ease-out;

        &[data-indeterminate] {
            width: 30%;
            animation: indeterminate 1.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;

            &[data-indeterminate] {
                animation-duration: 4s;
            }
        }
    }

    @keyframes indeterminate {
        0% {
            transform: translateX(-100%);
        }

        100% {
            transform: translateX(400%);
        }
    }

    .label {
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        color: $devie__color__text;
    }

    .value {
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x2;
        color: $devie__color__text-sub;
        font-variant-numeric: tabular-nums;
    }
}
```

## Use Cases

### Simple progress bar

Set `value` on `Progress.Root` to a number from 0 to 100. Place `Progress.Indicator` inside `Progress.Track`.

```tsx
<Progress.Root value={40}>
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
</Progress.Root>
```

### With label and value

Add `Progress.Label` to name the task and `Progress.Value` to show the formatted percentage.

```tsx
<Progress.Root value={65}>
  <div>
    <Progress.Label>Uploading files...</Progress.Label>
    <Progress.Value />
  </div>
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
</Progress.Root>
```

### Indeterminate state

Set `value` to `null` when the completion time is unknown. The indicator then loops across the track.

```tsx
<Progress.Root value={null}>
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
</Progress.Root>
```

---

*Generated from [devie-ui.com/components/progress](https://devie-ui.com/components/progress)*