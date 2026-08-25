# <Progress />

The Progress component extends [ Base UI's Progress ](https://base-ui.com/react/components/progress) . It provides a visual indicator for the completion status of a task, supporting both determinate and indeterminate states.

Built on [Base UI](https://base-ui.com/react/components/progress).

## Installation

### progress.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
  .root {
    display: flex;
    flex-direction: column;
    gap: $devie__spacing__x05;
    width: 100%;
    font-family: $devie__font-family;
  }

  .track {
    position: relative;
    height: 8px;
    width: 100%;
    overflow: hidden;
    border-radius: $devie__radius;
    background-color: $devie__color__background-sub;
  }

  .indicator {
    height: 100%;
    background-color: $devie__color__primary;
    border-radius: $devie__radius;
    transition: width 0.3s ease-out;

    &[data-indeterminate] {
      width: 30% !important;
      animation: indeterminate 1.5s ease-in-out infinite;
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
    color: $devie__color__text;
  }

  .value {
    font-size: $devie__font-size__small;
    color: $devie__color__text-sub;
    font-variant-numeric: tabular-nums;
  }
}
```

### progress.tsx

```tsx
// https://devie-ui.com/components/progress
// https://base-ui.com/react/components/progress

import { Progress as BaseProgress } from "@base-ui/react/progress";
import clsx from "clsx";
import styles from "./Progress.module.scss";

function Root({ className, children, ...props }: BaseProgress.Root.Props) {
  return (
    <BaseProgress.Root className={clsx(styles.root, className)} {...props}>
      {children}
    </BaseProgress.Root>
  );
}

function Track({ className, children, ...props }: BaseProgress.Track.Props) {
  return (
    <BaseProgress.Track className={clsx(styles.track, className)} {...props}>
      {children}
    </BaseProgress.Track>
  );
}

function Indicator({ className, ...props }: BaseProgress.Indicator.Props) {
  return (
    <BaseProgress.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Label({ className, children, ...props }: BaseProgress.Label.Props) {
  return (
    <BaseProgress.Label className={clsx(styles.label, className)} {...props}>
      {children}
    </BaseProgress.Label>
  );
}

function Value({ className, children, ...props }: BaseProgress.Value.Props) {
  return (
    <BaseProgress.Value className={clsx(styles.value, className)} {...props}>
      {children}
    </BaseProgress.Value>
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
    export type Props = BaseProgress.Root.Props;
    export type State = BaseProgress.Root.State;
  }
  export namespace Track {
    export type Props = BaseProgress.Track.Props;
  }
  export namespace Indicator {
    export type Props = BaseProgress.Indicator.Props;
  }
  export namespace Label {
    export type Props = BaseProgress.Label.Props;
  }
  export namespace Value {
    export type Props = BaseProgress.Value.Props;
  }
}

export default Progress;
```

## Use Cases

### Simple progress bar

The basic progress bar displays the current progress as a filled portion of the track. Use the `value` prop to set the progress (0-100).

```tsx
<Progress.Root value={40}>
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
</Progress.Root>
```

### Progress with label and value

Add a label and value display using the `Progress.Label` and `Progress.Value` components. The value automatically displays the current percentage.

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

### Indeterminate progress

When the progress value is unknown, set `value=` to display an indeterminate animation. This is useful for loading states where the completion time is unpredictable.

```tsx
<Progress.Root value={null}>
  <Progress.Track>
    <Progress.Indicator />
  </Progress.Track>
</Progress.Root>
```

---

*Generated from [devie-ui.com/components/progress](https://devie-ui.com/components/progress)*