# <TreeLine />

A component that draws connector lines for nested lists such as file trees. This is a custom component with no Base UI primitive. Devie adds the [variant](#variants) prop.

## Installation

### TreeLine.tsx

```tsx
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
```

### TreeLine.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .treeLine {
        position: relative;

        &::after,
        &::before {
            content: "";
            position: absolute;
            background-color: $devie__color__line;
        }
    }

    .vertical {
        &::before {
            width: 1px;
            height: 100%;
            top: 0;
            left: 50%;
        }
    }

    .horizontal {
        &::before {
            width: 100%;
            height: 1px;
            top: 50%;
            left: 0;
        }
    }

    .cornerTopLeft {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 50%;
        }

        &::before {
            width: 1px;
            height: 50%;
            bottom: 0;
            left: 50%;
        }
    }

    .cornerTopRight {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 0;
        }

        &::before {
            width: 1px;
            height: 50%;
            bottom: 0;
            left: 50%;
        }
    }

    .cornerBottomLeft {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 50%;
        }

        &::before {
            width: 1px;
            height: 50%;
            top: 0;
            left: 50%;
        }
    }

    .cornerBottomRight {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 0;
        }

        &::before {
            width: 1px;
            height: 50%;
            top: 0;
            left: 50%;
        }
    }

    .branchRight {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 50%;
        }

        &::before {
            width: 1px;
            height: 100%;
            top: 0;
            left: 50%;
        }
    }

    .branchLeft {
        &::after {
            width: 50%;
            height: 1px;
            top: 50%;
            left: 0;
        }

        &::before {
            width: 1px;
            height: 100%;
            top: 0;
            left: 50%;
        }
    }

    .branchDown {
        &::after {
            width: 100%;
            height: 1px;
            top: 50%;
            left: 0;
        }

        &::before {
            width: 1px;
            height: 50%;
            top: 50%;
            left: 50%;
        }
    }

    .branchUp {
        &::after {
            width: 100%;
            height: 1px;
            top: 50%;
            left: 0;
        }

        &::before {
            width: 1px;
            height: 50%;
            top: 0;
            left: 50%;
        }
    }
}
```

## Use Cases

### Variants

Set `variant` to `horizontal` or `vertical` for a straight line, or to a corner: `corner-top-left`, `corner-top-right`, `corner-bottom-left`, or `corner-bottom-right`. For a branch, use `branch-right`, `branch-left`, `branch-down`, or `branch-up`.

```tsx
import TreeLine from "@/ui/TreeLine";

// Straight lines
<TreeLine variant="horizontal" />
<TreeLine variant="vertical" />

// Corners
<TreeLine variant="corner-top-left" />
<TreeLine variant="corner-top-right" />
<TreeLine variant="corner-bottom-left" />
<TreeLine variant="corner-bottom-right" />

// Branches
<TreeLine variant="branch-right" />
<TreeLine variant="branch-left" />
<TreeLine variant="branch-down" />
<TreeLine variant="branch-up" />
```

### File tree

Build each row from TreeLine cells: `vertical` continues a parent line, `branch-right` connects an item, and `corner-bottom-left` ends the last one.

```tsx
import TreeLine from "@/ui/TreeLine";

// File tree structure using TreeLine
<div className="tree">
  {/* Root folder */}
  <div className="row">
    <FolderOpen size={16} />
    <span>src</span>
  </div>

  {/* components folder (middle item) */}
  <div className="row">
    <TreeLine variant="branch-right" />
    <TreeLine variant="horizontal" />
    <Folder size={16} />
    <span>components</span>
  </div>

  {/* Nested file (middle of components) */}
  <div className="row">
    <TreeLine variant="vertical" />     {/* continues parent line */}
    <TreeLine variant="branch-right" />  {/* branches to this item */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>Button.tsx</span>
  </div>

  {/* Last nested file */}
  <div className="row">
    <TreeLine variant="vertical" />
    <TreeLine variant="corner-bottom-left" /> {/* ends the branch */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>Menu.tsx</span>
  </div>

  {/* Last root item */}
  <div className="row">
    <TreeLine variant="corner-bottom-left" /> {/* ends root tree */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>index.ts</span>
  </div>
</div>
```

---

*Generated from [devie-ui.com/components/tree-line](https://devie-ui.com/components/tree-line)*