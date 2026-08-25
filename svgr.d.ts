declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  type ExtendedSVGProps = SVGProps<SVGSVGElement> & { title?: string };

  const content: FC<ExtendedSVGProps>;
  export default content;
}
