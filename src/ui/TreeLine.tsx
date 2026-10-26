// https://devie-ui.com/components/tree-line

import clsx from "clsx";
import type React from "react";
import styles from "./TreeLine.module.scss";

type TreeLineVariant =
  | "horizontal"
  | "vertical"
  | "corner-top-left"
  | "corner-top-right"
  | "corner-bottom-left"
  | "corner-bottom-right"
  | "branch-right"
  | "branch-left"
  | "branch-down"
  | "branch-up";

function TreeLine({ variant, className, ...props }: TreeLine.Props) {
  return (
    <div
      className={clsx(
        styles.treeLine,
        variant === "horizontal" && styles.horizontal,
        variant === "vertical" && styles.vertical,
        variant === "corner-top-left" && styles.cornerTopLeft,
        variant === "corner-top-right" && styles.cornerTopRight,
        variant === "corner-bottom-left" && styles.cornerBottomLeft,
        variant === "corner-bottom-right" && styles.cornerBottomRight,
        variant === "branch-right" && styles.branchRight,
        variant === "branch-left" && styles.branchLeft,
        variant === "branch-down" && styles.branchDown,
        variant === "branch-up" && styles.branchUp,
        className,
      )}
      {...props}
    />
  );
}

namespace TreeLine {
  export type Variant = TreeLineVariant;
  export interface Props extends React.ComponentProps<"div"> {
    variant: Variant;
  }
}

export default TreeLine;
