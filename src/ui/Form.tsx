// https://devie-ui.com/components/form
// https://base-ui.com/react/components/form

import { Form as BaseForm } from "@base-ui/react/form";
import clsx from "clsx";
import styles from "./Form.module.scss";

function Form({ className, ...props }: BaseForm.Props) {
  return <BaseForm className={clsx(styles.form, className)} {...props} />;
}

namespace Form {
  export type Props = BaseForm.Props;
  export type State = BaseForm.State;
  export type Values = BaseForm.Values;
  export type SubmitEventDetails = BaseForm.SubmitEventDetails;
}

export default Form;
