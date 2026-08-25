// https://devie-ui.com/components/avatar
// https://base-ui.com/react/components/avatar

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

function Root({ className, ...props }: BaseAvatar.Root.Props) {
  return (
    <BaseAvatar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Image({ className, ...props }: BaseAvatar.Image.Props) {
  return (
    <BaseAvatar.Image className={clsx(styles.image, className)} {...props} />
  );
}

function Fallback({ className, ...props }: BaseAvatar.Fallback.Props) {
  return (
    <BaseAvatar.Fallback
      className={clsx(styles.fallback, className)}
      {...props}
    />
  );
}

const Avatar = {
  Root,
  Image,
  Fallback,
};

namespace Avatar {
  export namespace Root {
    export type Props = BaseAvatar.Root.Props;
  }
  export namespace Image {
    export type Props = BaseAvatar.Image.Props;
  }
  export namespace Fallback {
    export type Props = BaseAvatar.Fallback.Props;
  }
}

export default Avatar;
