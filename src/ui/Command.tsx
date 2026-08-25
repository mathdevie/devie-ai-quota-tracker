// https://devie-ui.com/components/command
// https://base-ui.com/react/components/autocomplete#command-palette

import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import clsx from "clsx";
import { Search } from "lucide-react";
import type React from "react";
import styles from "./Command.module.scss";

function Root(props: Command.Root.Props) {
  const {
    autoHighlight = "always",
    keepHighlight = true,
    open = true,
    inline = true,
    ...rest
  } = props;
  return (
    <Autocomplete.Root
      autoHighlight={autoHighlight}
      keepHighlight={keepHighlight}
      open={open}
      inline={inline}
      {...rest}
    />
  );
}

const Dialog = BaseDialog.Root;

function DialogTrigger({ className, ...props }: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger className={className} {...props} />;
}

function DialogPopup({
  className,
  children,
  ...props
}: Command.DialogPopup.Props) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={styles.backdrop} />
      <BaseDialog.Popup
        className={clsx(styles.dialogPopup, className)}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function Input({ className, endAddon, ...props }: Command.Input.Props) {
  return (
    <div className={styles.inputWrapper}>
      <Search size={16} className={styles.inputIcon} />
      <Autocomplete.Input
        className={clsx(styles.input, className)}
        {...props}
      />
      {endAddon && <div className={styles.inputKbd}>{endAddon}</div>}
    </div>
  );
}

function List({ className, ...props }: Autocomplete.List.Props) {
  return (
    <div className={styles.listScroller}>
      <Autocomplete.List className={clsx(styles.list, className)} {...props} />
    </div>
  );
}

function Item({ className, ...props }: Autocomplete.Item.Props) {
  return (
    <Autocomplete.Item className={clsx(styles.item, className)} {...props} />
  );
}

function Empty({ className, ...props }: Autocomplete.Empty.Props) {
  return (
    <Autocomplete.Empty className={clsx(styles.empty, className)} {...props} />
  );
}

function Group({ className, ...props }: Autocomplete.Group.Props) {
  return (
    <Autocomplete.Group className={clsx(styles.group, className)} {...props} />
  );
}

function GroupLabel({ className, ...props }: Autocomplete.GroupLabel.Props) {
  return (
    <Autocomplete.GroupLabel
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
}

function Separator({ className, ...props }: Autocomplete.Separator.Props) {
  return (
    <Autocomplete.Separator
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
}

function Shortcut({ className, ...props }: Command.Shortcut.Props) {
  return <kbd className={clsx(styles.shortcut, className)} {...props} />;
}

function Toolbar({ className, ...props }: Command.Toolbar.Props) {
  return <div className={clsx(styles.toolbar, className)} {...props} />;
}

function Footer({ className, ...props }: Command.Footer.Props) {
  return <div className={clsx(styles.footer, className)} {...props} />;
}

function Panel({ className, ...props }: Command.Panel.Props) {
  return <div className={clsx(styles.panel, className)} {...props} />;
}

const Collection = Autocomplete.Collection;

const Command = {
  Root,
  Dialog,
  DialogTrigger,
  DialogPopup,
  Input,
  List,
  Item,
  Empty,
  Group,
  GroupLabel,
  Separator,
  Shortcut,
  Toolbar,
  Footer,
  Panel,
  Collection,
};

namespace Command {
  export namespace Root {
    export type Props = React.ComponentProps<typeof Autocomplete.Root>;
  }
  export namespace Dialog {
    export type Props = BaseDialog.Root.Props;
  }
  export namespace DialogTrigger {
    export type Props = BaseDialog.Trigger.Props;
  }
  export namespace DialogPopup {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
      children?: React.ReactNode;
    }
  }
  export namespace Input {
    export interface Props extends Autocomplete.Input.Props {
      endAddon?: React.ReactNode;
    }
  }
  export namespace List {
    export type Props = Autocomplete.List.Props;
  }
  export namespace Item {
    export type Props = Autocomplete.Item.Props;
    export type State = Autocomplete.Item.State;
  }
  export namespace Empty {
    export type Props = Autocomplete.Empty.Props;
  }
  export namespace Group {
    export type Props = Autocomplete.Group.Props;
  }
  export namespace GroupLabel {
    export type Props = Autocomplete.GroupLabel.Props;
  }
  export namespace Separator {
    export type Props = Autocomplete.Separator.Props;
  }
  export namespace Shortcut {
    export interface Props extends React.HTMLAttributes<HTMLElement> {
      className?: string;
    }
  }
  export namespace Toolbar {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Footer {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Panel {
    export interface Props extends React.HTMLAttributes<HTMLDivElement> {
      className?: string;
    }
  }
  export namespace Collection {
    export type Props = React.ComponentProps<typeof Autocomplete.Collection>;
  }
}

export default Command;
