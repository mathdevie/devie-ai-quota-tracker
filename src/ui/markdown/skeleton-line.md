# <SkeletonLine />

A placeholder bar that shimmers while content loads. This is a custom component with no Base UI primitive. Devie adds the `minWidth`, `maxWidth`, `minDuration`, `maxDuration`, `minDelay`, `maxDelay`, and `blockHeight` props.

## Installation

### SkeletonLine.tsx

```tsx
// https://devie-ui.com/components/skeleton-line

"use client";

import clsx from "clsx";
import type React from "react";
import { useId } from "react";
import styles from "./SkeletonLine.module.scss";

// Seeded by useId, not Math.random(), so server and client render the same markup.
function pseudoRandom(seed: string, min: number, max: number): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  }
  return min + (max - min) * ((hash >>> 0) / 4294967296);
}

function SkeletonLine({
  minWidth = 30,
  maxWidth = 100,
  minDuration = 1.3,
  maxDuration = 1.7,
  minDelay = 0,
  maxDelay = 0.5,
  blockHeight,
  className,
  style,
  ...props
}: SkeletonLine.Props) {
  const id = useId();
  const width = pseudoRandom(`${id}width`, minWidth, maxWidth);
  const duration = pseudoRandom(`${id}duration`, minDuration, maxDuration);
  const delay = pseudoRandom(`${id}delay`, minDelay, maxDelay);

  const line = (
    <div
      className={clsx(styles.skeletonLine, className)}
      style={
        {
          "--skeleton-line-width": `${width.toFixed(0)}%`,
          "--skeleton-line-duration": `${duration.toFixed(2)}s`,
          "--skeleton-line-delay": `${delay.toFixed(2)}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );

  if (blockHeight === undefined) {
    return line;
  }

  return (
    <div
      className={styles.block}
      style={{
        height:
          typeof blockHeight === "number" ? `${blockHeight}px` : blockHeight,
      }}
    >
      {line}
    </div>
  );
}

namespace SkeletonLine {
  export interface Props extends React.ComponentProps<"div"> {
    minWidth?: number;
    maxWidth?: number;
    minDuration?: number;
    maxDuration?: number;
    minDelay?: number;
    maxDelay?: number;
    blockHeight?: string | number;
  }
}

export default SkeletonLine;
```

### SkeletonLine.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .skeletonLine {
        position: relative;
        overflow: hidden;
        width: var(--skeleton-line-width, 100%);
        height: $devie__spacing__x1;
        border-radius: $devie__radius;
        background-color: $devie__color__background-sunken;

        &::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
                90deg,
                transparent 0%,
                color-mix(in srgb, $devie__color__text 8%, transparent) 50%,
                transparent 100%
            );
            animation: skeletonShimmer var(--skeleton-line-duration, 1.5s)
                ease-in-out var(--skeleton-line-delay, 0s) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
            &::after {
                animation: none;
            }
        }
    }

    @keyframes skeletonShimmer {
        0% {
            transform: translateX(-100%);
        }

        100% {
            transform: translateX(100%);
        }
    }

    .block {
        display: flex;
        align-items: center;
    }
}
```

## Use Cases

### Simple skeleton line

Each line picks a random width between `minWidth` and `maxWidth`, in percent of the container. Stack lines to sketch loading text.

```tsx
<SkeletonLine />
<SkeletonLine />
<SkeletonLine />
```

### Custom widths

Narrow the `minWidth` and `maxWidth` range to control how much the width varies.

```tsx
<SkeletonLine minWidth={80} maxWidth={100} />
<SkeletonLine minWidth={60} maxWidth={80} />
<SkeletonLine minWidth={40} maxWidth={60} />
```

### With block height

Set `blockHeight` to center the line in a container of that height. Use it to replace text of a known line height without layout shift.

```tsx
<SkeletonLine blockHeight={32} />
<SkeletonLine blockHeight={48} />
<SkeletonLine blockHeight={64} />
```

### Card loading state

Compose skeleton lines inside a [LayerCard](/components/layer-card) to build the loading state of a content area.

```tsx
<LayerCard.Root>
  <LayerCard.Inner className="card-content">
    <SkeletonLine minWidth={40} maxWidth={60} />
    <SkeletonLine />
    <SkeletonLine />
    <SkeletonLine minWidth={50} maxWidth={70} />
  </LayerCard.Inner>
</LayerCard.Root>
```

---

*Generated from [devie-ui.com/components/skeleton-line](https://devie-ui.com/components/skeleton-line)*