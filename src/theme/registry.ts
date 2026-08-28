import type { FC, SVGProps } from "react";

import DarkThumbnail from "@/ui/themes/dark/thumbnail.svg";
import LightThumbnail from "@/ui/themes/light/thumbnail.svg";
import SystemThumbnail from "@/ui/themes/system/thumbnail.svg";

type ExtendedSVGProps = SVGProps<SVGSVGElement> & { title?: string };

export interface ThemeOption {
  className: string;
  nameKey: string;
  thumbnailSrc: FC<ExtendedSVGProps>;
  displayName: Record<string, string>;
}

export const SYSTEM_THEME = "system";
export const LIGHT_THEME = "theme-light";
export const DARK_THEME = "theme-dark";

/** The app offers only the three appearances supplied by macOS. */
export const THEMES: ThemeOption[] = [
  {
    nameKey: "system",
    className: SYSTEM_THEME,
    thumbnailSrc: SystemThumbnail,
    displayName: {
      "en-US": "System",
      "en-GB": "System",
      "fr-FR": "Système",
      "de-DE": "System",
      "it-IT": "Sistema",
      "es-ES": "Sistema",
      "es-419": "Sistema",
      "pt-BR": "Sistema",
      "fi-FI": "Järjestelmä",
      "da-DK": "System",
      "nl-NL": "Systeem",
      "nb-NO": "System",
      "sv-SE": "System",
    },
  },
  {
    nameKey: "light",
    className: LIGHT_THEME,
    thumbnailSrc: LightThumbnail,
    displayName: {
      "en-US": "Light",
      "en-GB": "Light",
      "fr-FR": "Clair",
      "de-DE": "Hell",
      "it-IT": "Chiaro",
      "es-ES": "Claro",
      "es-419": "Claro",
      "pt-BR": "Claro",
      "fi-FI": "Vaalea",
      "da-DK": "Lys",
      "nl-NL": "Licht",
      "nb-NO": "Lys",
      "sv-SE": "Ljus",
    },
  },
  {
    nameKey: "dark",
    className: DARK_THEME,
    thumbnailSrc: DarkThumbnail,
    displayName: {
      "en-US": "Dark",
      "en-GB": "Dark",
      "fr-FR": "Sombre",
      "de-DE": "Dunkel",
      "it-IT": "Scuro",
      "es-ES": "Oscuro",
      "es-419": "Oscuro",
      "pt-BR": "Escuro",
      "fi-FI": "Tumma",
      "da-DK": "Mørk",
      "nl-NL": "Donker",
      "nb-NO": "Mørk",
      "sv-SE": "Mörk",
    },
  },
];

export type ThemeClassName = (typeof THEMES)[number]["className"];
