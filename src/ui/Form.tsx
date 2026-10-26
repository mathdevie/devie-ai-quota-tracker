// https://devie-ui.com/components/form
// https://base-ui.com/react/components/form

import { Form as BaseForm } from "@base-ui/react/form";
import clsx from "clsx";
import styles from "./Form.module.scss";

function Form({ className, ...props }: Form.Props) {
  return <BaseForm className={clsx(styles.form, className)} {...props} />;
}

namespace Form {
  export type Props = Omit<BaseForm.Props, "className"> & {
    className?: string;
  };
  export type State = BaseForm.State;
  export type Values = BaseForm.Values;
  export type SubmitEventDetails = BaseForm.SubmitEventDetails;
}

export default Form;
