// https://devie-ui.com/components/separator
// https://base-ui.com/react/components/separator

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import clsx from "clsx";
import styles from "./Separator.module.scss";

function Separator({ text, className, ...props }: Separator.Props) {
  if (text) {
    return (
      <BaseSeparator
        aria-label={text}
        className={clsx(styles.withTextContainer, className)}
        {...props}
      >
        <span className={styles.line} />
        <span className={styles.text} aria-hidden="true">
          {text}
        </span>
        <span className={styles.line} />
      </BaseSeparator>
    );
  }

  return (
    <BaseSeparator className={clsx(styles.separator, className)} {...props} />
  );
}

namespace Separator {
  export interface Props extends Omit<BaseSeparator.Props, "className"> {
    className?: string;
    text?: string;
  }
}

export default Separator;
