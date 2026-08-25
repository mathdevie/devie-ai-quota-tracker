// https://devie-ui.com/components/tree-line

import clsx from "clsx";
import type React from "react";
import styles from "./TreeLine.module.scss";

type Variant =
  | "horizontal"
  | "vertical"
  | "cornerTopLeft"
  | "cornerTopRight"
  | "cornerBottomLeft"
  | "cornerBottomRight"
  | "branchRight"
  | "branchLeft"
  | "branchDown"
  | "branchUp";

function TreeLine({ variant, className, ...props }: TreeLine.Props) {
  return (
    <div
      className={clsx(
        styles.treeLine,
        variant === "horizontal" && styles.horizontal,
        variant === "vertical" && styles.vertical,
        variant === "cornerTopLeft" && styles.cornerTopLeft,
        variant === "cornerTopRight" && styles.cornerTopRight,
        variant === "cornerBottomLeft" && styles.cornerBottomLeft,
        variant === "cornerBottomRight" && styles.cornerBottomRight,
        variant === "branchRight" && styles.branchRight,
        variant === "branchLeft" && styles.branchLeft,
        variant === "branchDown" && styles.branchDown,
        variant === "branchUp" && styles.branchUp,
        className,
      )}
      {...props}
    />
  );
}

namespace TreeLine {
  export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    variant: Variant;
  }
}

export default TreeLine;
