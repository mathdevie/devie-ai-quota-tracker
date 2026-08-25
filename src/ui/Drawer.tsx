// https://devie-ui.com/components/drawer
// https://base-ui.com/react/components/drawer

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import clsx from "clsx";
import type React from "react";
import styles from "./Drawer.module.scss";

// Simple re-exports
const Provider = BaseDrawer.Provider;
const Root = BaseDrawer.Root;
const Portal = BaseDrawer.Portal;
const createHandle = BaseDrawer.createHandle;

function IndentBackground({
  className,
  ...props
}: BaseDrawer.IndentBackground.Props) {
  return (
    <BaseDrawer.IndentBackground
      className={clsx(styles.indentBackground, className)}
      {...props}
    />
  );
}

function Indent({ className, ...props }: BaseDrawer.Indent.Props) {
  return (
    <BaseDrawer.Indent className={clsx(styles.indent, className)} {...props} />
  );
}

function Trigger({ className, ...props }: BaseDrawer.Trigger.Props) {
  return <BaseDrawer.Trigger className={className} {...props} />;
}

function SwipeArea({ className, ...props }: BaseDrawer.SwipeArea.Props) {
  return (
    <BaseDrawer.SwipeArea
      className={clsx(styles.swipeArea, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: BaseDrawer.Backdrop.Props) {
  return (
    <BaseDrawer.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: BaseDrawer.Viewport.Props) {
  return (
    <BaseDrawer.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: BaseDrawer.Popup.Props) {
  return (
    <BaseDrawer.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Content({ className, ...props }: BaseDrawer.Content.Props) {
  return (
    <BaseDrawer.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Title({ className, ...props }: BaseDrawer.Title.Props) {
  return (
    <BaseDrawer.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: BaseDrawer.Description.Props) {
  return (
    <BaseDrawer.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Close({ className, ...props }: BaseDrawer.Close.Props) {
  return <BaseDrawer.Close className={className} {...props} />;
}

function Handle({ className, ...props }: Drawer.Handle.Props) {
  return <div className={clsx(styles.handle, className)} {...props} />;
}

const Drawer = {
  Provider,
  IndentBackground,
  Indent,
  Root,
  createHandle,
  Trigger,
  SwipeArea,
  Portal,
  Backdrop,
  Viewport,
  Popup,
  Content,
  Title,
  Description,
  Close,
  Handle,
};

namespace Drawer {
  export namespace Root {
    export type Props = BaseDrawer.Root.Props;
  }
  export namespace Trigger {
    export type Props = BaseDrawer.Trigger.Props;
  }
  export namespace SwipeArea {
    export type Props = BaseDrawer.SwipeArea.Props;
  }
  export namespace Portal {
    export type Props = BaseDrawer.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = BaseDrawer.Backdrop.Props;
  }
  export namespace Viewport {
    export type Props = BaseDrawer.Viewport.Props;
  }
  export namespace Popup {
    export type Props = BaseDrawer.Popup.Props;
  }
  export namespace Content {
    export type Props = BaseDrawer.Content.Props;
  }
  export namespace Title {
    export type Props = BaseDrawer.Title.Props;
  }
  export namespace Description {
    export type Props = BaseDrawer.Description.Props;
  }
  export namespace Close {
    export type Props = BaseDrawer.Close.Props;
  }
  export namespace IndentBackground {
    export type Props = BaseDrawer.IndentBackground.Props;
  }
  export namespace Indent {
    export type Props = BaseDrawer.Indent.Props;
  }
  export namespace Handle {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
}

export default Drawer;
