// https://devie-ui.com/components/drawer
// https://base-ui.com/react/components/drawer

import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import clsx from "clsx";
import type React from "react";
import styles from "./Drawer.module.scss";

const Provider = BaseDrawer.Provider;
const Root = BaseDrawer.Root;
const Portal = BaseDrawer.Portal;
const createHandle = BaseDrawer.createHandle;
const Trigger = BaseDrawer.Trigger;
const Close = BaseDrawer.Close;

function IndentBackground({
  className,
  ...props
}: Drawer.IndentBackground.Props) {
  return (
    <BaseDrawer.IndentBackground
      className={clsx(styles.indentBackground, className)}
      {...props}
    />
  );
}

function Indent({ className, ...props }: Drawer.Indent.Props) {
  return (
    <BaseDrawer.Indent className={clsx(styles.indent, className)} {...props} />
  );
}

function SwipeArea({ className, ...props }: Drawer.SwipeArea.Props) {
  return (
    <BaseDrawer.SwipeArea
      className={clsx(styles.swipeArea, className)}
      {...props}
    />
  );
}

function Backdrop({ className, ...props }: Drawer.Backdrop.Props) {
  return (
    <BaseDrawer.Backdrop
      className={clsx(styles.backdrop, className)}
      {...props}
    />
  );
}

function Viewport({ className, ...props }: Drawer.Viewport.Props) {
  return (
    <BaseDrawer.Viewport
      className={clsx(styles.viewport, className)}
      {...props}
    />
  );
}

function Popup({ className, ...props }: Drawer.Popup.Props) {
  return (
    <BaseDrawer.Popup className={clsx(styles.popup, className)} {...props} />
  );
}

function Content({ className, ...props }: Drawer.Content.Props) {
  return (
    <BaseDrawer.Content
      className={clsx(styles.content, className)}
      {...props}
    />
  );
}

function Title({ className, ...props }: Drawer.Title.Props) {
  return (
    <BaseDrawer.Title className={clsx(styles.title, className)} {...props} />
  );
}

function Description({ className, ...props }: Drawer.Description.Props) {
  return (
    <BaseDrawer.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
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
    export type Props = Omit<BaseDrawer.SwipeArea.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Portal {
    export type Props = BaseDrawer.Portal.Props;
  }
  export namespace Backdrop {
    export type Props = Omit<BaseDrawer.Backdrop.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Viewport {
    export type Props = Omit<BaseDrawer.Viewport.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Popup {
    export type Props = Omit<BaseDrawer.Popup.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Content {
    export type Props = Omit<BaseDrawer.Content.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Title {
    export type Props = Omit<BaseDrawer.Title.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Description {
    export type Props = Omit<BaseDrawer.Description.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Close {
    export type Props = BaseDrawer.Close.Props;
  }
  export namespace IndentBackground {
    export type Props = Omit<BaseDrawer.IndentBackground.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Indent {
    export type Props = Omit<BaseDrawer.Indent.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Handle {
    export type Props = React.ComponentProps<"div">;
  }
}

export default Drawer;
