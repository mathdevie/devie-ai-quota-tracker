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
