import type { Provider } from "@/lib/contracts";
import styles from "./ProviderIcon.module.scss";

/**
 * Official app icons, 128×128 PNG, as bundled by 9router
 * (https://github.com/decolua/9router/tree/main/public/providers).
 */
export type BrandId =
  | Provider
  | "antigravity"
  | "cursor"
  | "gemini-cli"
  | "kiro"
  | "kimchi"
  | "opencode"
  | "qwen"
  | "kilocode"
  | "cline"
  | "windsurf"
  | "openrouter";

export { PROVIDER_NAMES } from "@/lib/labels";

/** The official logo of a tool, with rounded corners like a macOS app icon. */
export function BrandIcon({
  brand,
  size = 18,
  alt = "",
}: {
  brand: BrandId;
  size?: number;
  alt?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: a static PNG in the app bundle; next/image adds nothing here.
    <img
      alt={alt}
      aria-hidden={alt === "" || undefined}
      className={styles.mark}
      decoding="async"
      height={size}
      src={`/providers/${brand}.png`}
      width={size}
    />
  );
}

export default function ProviderIcon({
  provider,
  size = 18,
}: {
  provider: Provider;
  size?: number;
}) {
  return <BrandIcon brand={provider} size={size} />;
}
