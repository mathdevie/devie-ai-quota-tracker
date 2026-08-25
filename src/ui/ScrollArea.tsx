// https://devie-ui.com/components/scroll-area
// https://base-ui.com/react/components/scroll-area

import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import clsx from "clsx";
import styles from "./ScrollArea.module.scss";

function Root({ className, children, ...props }: BaseScrollArea.Root.Props) {
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
}: BaseScrollArea.Viewport.Props) {
  return (
    <BaseScrollArea.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    >
      {children}
    </BaseScrollArea.Viewport>
  );
}

function Content({
  className,
  children,
  ...props
}: BaseScrollArea.Content.Props) {
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
}: BaseScrollArea.Scrollbar.Props) {
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

function Thumb({ className, ...props }: BaseScrollArea.Thumb.Props) {
  return (
    <BaseScrollArea.Thumb
      className={clsx(styles.thumb, className)}
      {...props}
    />
  );
}

function Corner({ className, ...props }: BaseScrollArea.Corner.Props) {
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
    export type Props = BaseScrollArea.Root.Props;
  }
  export namespace Viewport {
    export type Props = BaseScrollArea.Viewport.Props;
  }
  export namespace Content {
    export type Props = BaseScrollArea.Content.Props;
  }
  export namespace Scrollbar {
    export type Props = BaseScrollArea.Scrollbar.Props;
  }
  export namespace Thumb {
    export type Props = BaseScrollArea.Thumb.Props;
  }
  export namespace Corner {
    export type Props = BaseScrollArea.Corner.Props;
  }
}

export default ScrollArea;
