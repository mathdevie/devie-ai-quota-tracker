// https://devie-ui.com/components/toolbar
// https://base-ui.com/react/components/toolbar

import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import clsx from "clsx";
import Toggle from "./Toggle";
import styles from "./Toolbar.module.scss";

type ToggleProps = Toggle.Props;

function Root({ className, ...props }: Toolbar.Root.Props) {
  return (
    <BaseToolbar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Button({ className, ...props }: Toolbar.Button.Props) {
  return (
    <BaseToolbar.Button className={clsx(styles.button, className)} {...props} />
  );
}

function ToolbarToggle({
  className,
  disabled,
  ...props
}: Toolbar.Toggle.Props) {
  return (
    <BaseToolbar.Button
      disabled={disabled}
      render={<Toggle variant="naked" className={className} {...props} />}
    />
  );
}

function Link({ className, ...props }: Toolbar.Link.Props) {
  return (
    <BaseToolbar.Link className={clsx(styles.link, className)} {...props} />
  );
}

function Input({ className, ...props }: Toolbar.Input.Props) {
  return (
    <BaseToolbar.Input className={clsx(styles.input, className)} {...props} />
  );
}

function Group({ className, ...props }: Toolbar.Group.Props) {
  return (
    <BaseToolbar.Group className={clsx(styles.group, className)} {...props} />
  );
}

function Separator({ className, ...props }: Toolbar.Separator.Props) {
  return (
    <BaseToolbar.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

const Toolbar = {
  Root,
  Button,
  Toggle: ToolbarToggle,
  Link,
  Input,
  Group,
  Separator,
};

namespace Toolbar {
  export namespace Root {
    export type Props = Omit<BaseToolbar.Root.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Button {
    export type Props = Omit<BaseToolbar.Button.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Toggle {
    export type Props = Omit<ToggleProps, "variant">;
  }
  export namespace Link {
    export type Props = Omit<BaseToolbar.Link.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Input {
    export type Props = Omit<BaseToolbar.Input.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Group {
    export type Props = Omit<BaseToolbar.Group.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Separator {
    export type Props = Omit<BaseToolbar.Separator.Props, "className"> & {
      className?: string;
    };
  }
}

export default Toolbar;
