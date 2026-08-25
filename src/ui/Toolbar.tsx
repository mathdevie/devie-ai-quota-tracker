// https://devie-ui.com/components/toolbar
// https://base-ui.com/react/components/toolbar

import type { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import clsx from "clsx";
import Toggle from "./Toggle";
import styles from "./Toolbar.module.scss";

function Root({ className, ...props }: BaseToolbar.Root.Props) {
  return (
    <BaseToolbar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Button({ className, ...props }: BaseToolbar.Button.Props) {
  return (
    <BaseToolbar.Button className={clsx(styles.button, className)} {...props} />
  );
}

function ToolbarToggle({ className, ...props }: BaseToggle.Props) {
  return (
    <Toggle
      variant="naked"
      className={clsx(styles.toggle, className)}
      {...props}
    />
  );
}

function Link({ className, ...props }: BaseToolbar.Link.Props) {
  return (
    <BaseToolbar.Link className={clsx(styles.link, className)} {...props} />
  );
}

function Input({ className, ...props }: BaseToolbar.Input.Props) {
  return (
    <BaseToolbar.Input className={clsx(styles.input, className)} {...props} />
  );
}

function Group({ className, ...props }: BaseToolbar.Group.Props) {
  return (
    <BaseToolbar.Group className={clsx(styles.group, className)} {...props} />
  );
}

function Separator({ className, ...props }: BaseToolbar.Separator.Props) {
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
    export type Props = BaseToolbar.Root.Props;
  }
  export namespace Button {
    export type Props = BaseToolbar.Button.Props;
  }
  export namespace Toggle {
    export type Props = BaseToggle.Props;
  }
  export namespace Link {
    export type Props = BaseToolbar.Link.Props;
  }
  export namespace Input {
    export type Props = BaseToolbar.Input.Props;
  }
  export namespace Group {
    export type Props = BaseToolbar.Group.Props;
  }
  export namespace Separator {
    export type Props = BaseToolbar.Separator.Props;
  }
}

export default Toolbar;
