# <TreeLine />

The TreeLine component renders tree structure connectors for creating visual hierarchies like file explorers, navigation trees, or any nested list that needs connecting lines. This is a custom Devie component (not based on Base UI).

## Installation

### tree-line.module.scss

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

  // Straight lines
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

  // Corner pieces
  // cornerTopLeft: ┌ (goes right and down from center)
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

  // cornerTopRight: ┐ (goes left and down from center)
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

  // cornerBottomLeft: └ (comes from top, goes right)
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

  // cornerBottomRight: ┘ (comes from top, goes left)
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

  // Branch pieces
  // branchRight: ├ (vertical line with branch going right)
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

  // branchLeft: ┤ (vertical line with branch going left)
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

  // branchDown: ┬ (horizontal line with branch going down)
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

  // branchUp: ┴ (horizontal line with branch going up)
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

### tree-line.tsx

```tsx
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
```

## Use Cases

### All Variants

TreeLine provides 10 variants to create any tree structure: straight lines (`horizontal`, `vertical`), corners ( `cornerTopLeft`, `cornerTopRight`, `cornerBottomLeft`, `cornerBottomRight`), and branches (`branchRight`, `branchLeft`, `branchDown`, `branchUp`).

```tsx
import TreeLine from "@/ui/TreeLine";

// Straight lines
<TreeLine variant="horizontal" />
<TreeLine variant="vertical" />

// Corners
<TreeLine variant="cornerTopLeft" />
<TreeLine variant="cornerTopRight" />
<TreeLine variant="cornerBottomLeft" />
<TreeLine variant="cornerBottomRight" />

// Branches
<TreeLine variant="branchRight" />
<TreeLine variant="branchLeft" />
<TreeLine variant="branchDown" />
<TreeLine variant="branchUp" />
```

### File Tree Example

TreeLine can be composed to create file explorer-style hierarchies. This example shows a typical project structure with nested folders and files.

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
    <TreeLine variant="branchRight" />
    <TreeLine variant="horizontal" />
    <Folder size={16} />
    <span>components</span>
  </div>

  {/* Nested file (middle of components) */}
  <div className="row">
    <TreeLine variant="vertical" />     {/* continues parent line */}
    <TreeLine variant="branchRight" />  {/* branches to this item */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>Button.tsx</span>
  </div>

  {/* Last nested file */}
  <div className="row">
    <TreeLine variant="vertical" />
    <TreeLine variant="cornerBottomLeft" /> {/* ends the branch */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>Menu.tsx</span>
  </div>

  {/* Last root item */}
  <div className="row">
    <TreeLine variant="cornerBottomLeft" /> {/* ends root tree */}
    <TreeLine variant="horizontal" />
    <FileCode size={16} />
    <span>index.ts</span>
  </div>
</div>
```

---

*Generated from [devie-ui.com/components/tree-line](https://devie-ui.com/components/tree-line)*