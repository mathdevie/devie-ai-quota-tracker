// https://devie-ui.com/components/separator
// https://base-ui.com/react/components/separator

import { Separator as BaseSeparator } from "@base-ui/react/separator";
import clsx from "clsx";
import styles from "./Separator.module.scss";

function Separator({
  text,
  orientation = "horizontal",
  className,
  style,
  ...props
}: Separator.Props) {
  if (text && orientation === "horizontal") {
    const containerStyle = typeof style === "function" ? undefined : style;
    return (
      <div className={styles.withTextContainer} style={containerStyle}>
        <BaseSeparator
          orientation="horizontal"
          className={clsx(styles.separator, className)}
          {...props}
        />
        <span className={styles.text}>{text}</span>
        <BaseSeparator
          orientation="horizontal"
          className={clsx(styles.separator, className)}
          {...props}
        />
      </div>
    );
  }

  return (
    <BaseSeparator
      orientation={orientation}
      className={clsx(styles.separator, className)}
      style={style}
      {...props}
    />
  );
}

namespace Separator {
  export interface Props extends BaseSeparator.Props {
    text?: string;
  }
}

export default Separator;
