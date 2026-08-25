import type { Provider } from "@/lib/contracts";
import styles from "./ProviderIcon.module.scss";
import ClaudeMark from "./provider-icons/claude.svg";
import CodexMark from "./provider-icons/codex.svg";
import CopilotMark from "./provider-icons/copilot.svg";

const MARKS = {
  claude: ClaudeMark,
  codex: CodexMark,
  copilot: CopilotMark,
} as const;

export const PROVIDER_NAMES: Record<Provider, string> = {
  claude: "Claude",
  codex: "Codex",
  copilot: "GitHub Copilot",
};

export default function ProviderIcon({
  provider,
  size = 18,
  framed = true,
}: {
  provider: Provider;
  size?: number;
  framed?: boolean;
}) {
  const Mark = MARKS[provider];
  const mark = (
    <Mark
      aria-hidden
      className={styles.mark}
      data-provider={provider}
      height={size}
      width={size}
    />
  );
  if (!framed) return mark;
  return (
    <span className={styles.frame} data-provider={provider}>
      {mark}
    </span>
  );
}
