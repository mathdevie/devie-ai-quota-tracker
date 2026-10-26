// https://devie-ui.com/components/scroll-area
// https://base-ui.com/react/components/scroll-area

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import clsx from "clsx";
import styles from "./ScrollArea.module.scss";

function Root({ className, children, ...props }: ScrollArea.Root.Props) {
  return (
    <BaseScrollArea.Root className={clsx(styles.root, className)} {...props}>
      {children}
    </BaseScrollArea.Root>
  );
}

function Viewport({
  className,
  children,
  ...props
}: ScrollArea.Viewport.Props) {
  return (
    <BaseScrollArea.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    >
      {children}
    </BaseScrollArea.Viewport>
  );
}

function Content({ className, children, ...props }: ScrollArea.Content.Props) {
  return (
    <BaseScrollArea.Content
      className={clsx(styles.content, className)}
      {...props}
    >
      {children}
    </BaseScrollArea.Content>
  );
}

function Scrollbar({
  className,
  children,
  orientation = "vertical",
  ...props
}: ScrollArea.Scrollbar.Props) {
  return (
    <BaseScrollArea.Scrollbar
      className={clsx(styles.scrollbar, className)}
      orientation={orientation}
      {...props}
    >
      {children}
    </BaseScrollArea.Scrollbar>
  );
}

function Thumb({ className, ...props }: ScrollArea.Thumb.Props) {
  return (
    <BaseScrollArea.Thumb
      className={clsx(styles.thumb, className)}
      {...props}
    />
  );
}

function Corner({ className, ...props }: ScrollArea.Corner.Props) {
  return (
    <BaseScrollArea.Corner
      className={clsx(styles.corner, className)}
      {...props}
    />
  );
}

const ScrollArea = {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
  Corner,
};

namespace ScrollArea {
  export namespace Root {
    export type Props = Omit<BaseScrollArea.Root.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseScrollArea.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Content {
    export type Props = Omit<BaseScrollArea.Content.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Scrollbar {
    export type Props = Omit<BaseScrollArea.Scrollbar.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Thumb {
    export type Props = Omit<BaseScrollArea.Thumb.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Corner {
    export type Props = Omit<BaseScrollArea.Corner.Props, "className"> & {
      className?: string;
    };
  }
}

export default ScrollArea;
