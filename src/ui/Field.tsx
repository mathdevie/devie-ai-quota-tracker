// https://devie-ui.com/components/field
// https://base-ui.com/react/components/field

import { Field as BaseField } from "@base-ui/react/field";
import clsx from "clsx";
import styles from "./Field.module.scss";

function Root({ className, ...props }: BaseField.Root.Props) {
  return <BaseField.Root className={clsx(styles.root, className)} {...props} />;
}

function Label({ className, ...props }: BaseField.Label.Props) {
  return (
    <BaseField.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Control({ className, ...props }: BaseField.Control.Props) {
  return (
    <BaseField.Control className={clsx(styles.control, className)} {...props} />
  );
}

function Description({ className, ...props }: BaseField.Description.Props) {
  return (
    <BaseField.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: BaseField.Item.Props) {
  return <BaseField.Item className={clsx(styles.item, className)} {...props} />;
}

function ErrorField({ className, ...props }: BaseField.Error.Props) {
  return (
    <BaseField.Error className={clsx(styles.error, className)} {...props} />
  );
}

const Field = {
  Root,
  Label,
  Control,
  Description,
  Item,
  Error: ErrorField,
  Validity: BaseField.Validity,
};

namespace Field {
  export namespace Root {
    export type Props = BaseField.Root.Props;
    export type State = BaseField.Root.State;
  }
  export namespace Label {
    export type Props = BaseField.Label.Props;
  }
  export namespace Control {
    export type Props = BaseField.Control.Props;
  }
  export namespace Description {
    export type Props = BaseField.Description.Props;
  }
  export namespace Item {
    export type Props = BaseField.Item.Props;
  }
  export namespace Error {
    export type Props = BaseField.Error.Props;
  }
  export namespace Validity {
    export type Props = BaseField.Validity.Props;
    export type State = BaseField.Validity.State;
  }
}

export default Field;
