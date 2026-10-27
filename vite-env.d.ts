/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_IS_DESKTOP_BUILD?: string;
}
declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}
declare module "*.scss" {}
declare module "*.css" {}
