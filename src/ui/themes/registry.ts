import type { FC, SVGProps } from "react";
import AlpineSnowThumbnail from "./alpine-snow/thumbnail.svg";
import AuroraGreenThumbnail from "./aurora-green/thumbnail.svg";
import CatppuccinLatteThumbnail from "./catppuccin-latte/thumbnail.svg";
import CommandPromptThumbnail from "./command-prompt/thumbnail.svg";
import CopperSunsetThumbnail from "./copper-sunset/thumbnail.svg";
import DarkThumbnail from "./dark/thumbnail.svg";
import DefaultThumbnail from "./default/thumbnail.svg";
import MidnightInkThumbnail from "./midnight-ink/thumbnail.svg";
import SharinganThumbnail from "./sharingan/thumbnail.svg";
import TotoroThumbnail from "./totoro/thumbnail.svg";

type ExtendedSVGProps = SVGProps<SVGSVGElement> & { title?: string };

export const DEFAULT_THEME = "theme-default";
export const THEME_STORAGE_KEY = "devie-theme";

export interface ThemeOption {
  className: string;
  nameKey: string;
  thumbnailSrc: FC<ExtendedSVGProps>;
  displayName: string;
  categories?: string[];
}

export const THEMES: ThemeOption[] = [
  {
    nameKey: "default",
    className: "theme-default",
    thumbnailSrc: DefaultThumbnail,
    categories: ["All", "Light"],
    displayName: "Light",
  },
  {
    nameKey: "dark",
    className: "theme-dark",
    thumbnailSrc: DarkThumbnail,
    categories: ["All", "Dark"],
    displayName: "Dark",
  },
  {
    nameKey: "midnight-ink",
    className: "theme-midnight-ink",
    thumbnailSrc: MidnightInkThumbnail,
    categories: ["All", "Dark"],
    displayName: "Midnight Ink",
  },
  {
    nameKey: "copper-sunset",
    className: "theme-copper-sunset",
    thumbnailSrc: CopperSunsetThumbnail,
    categories: ["All", "Light"],
    displayName: "Copper Sunset",
  },
  {
    nameKey: "aurora-green",
    className: "theme-aurora-green",
    thumbnailSrc: AuroraGreenThumbnail,
    categories: ["All", "Dark"],
    displayName: "Aurora Green",
  },
  {
    nameKey: "sharingan",
    className: "theme-sharingan",
    thumbnailSrc: SharinganThumbnail,
    categories: ["All", "Dark"],
    displayName: "Sharingan",
  },
  {
    nameKey: "alpine-snow",
    className: "theme-alpine-snow",
    thumbnailSrc: AlpineSnowThumbnail,
    categories: ["All", "Light"],
    displayName: "Alpine Snow",
  },
  {
    nameKey: "command-prompt",
    className: "theme-command-prompt",
    thumbnailSrc: CommandPromptThumbnail,
    categories: ["All", "Dark"],
    displayName: "Command Prompt",
  },
  {
    nameKey: "totoro",
    className: "theme-totoro",
    thumbnailSrc: TotoroThumbnail,
    categories: ["All", "Light"],
    displayName: "Totoro",
  },
  {
    nameKey: "catppuccin-latte",
    className: "theme-catppuccin-latte",
    thumbnailSrc: CatppuccinLatteThumbnail,
    categories: ["All", "Light"],
    displayName: "Catppuccin Latte",
  },
];
