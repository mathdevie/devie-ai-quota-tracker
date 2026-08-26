"use client";

import { useTranslation } from "react-i18next";

export default function BrandMark({ size = 34 }: { size?: number }) {
  const { t } = useTranslation();
  return (
    <svg
      aria-label={t("Common.AppName")}
      height={size}
      role="img"
      viewBox="0 0 40 40"
      width={size}
    >
      <rect
        fill="var(--devie__color__primary)"
        height="40"
        rx="12"
        width="40"
      />
      <path
        d="M11 11h8.2c6.2 0 10.3 3.5 10.3 9s-4.1 9-10.3 9H11V11Zm7.8 13.2c3.1 0 5-1.5 5-4.2s-1.9-4.2-5-4.2h-2.2v8.4h2.2Z"
        fill="white"
      />
    </svg>
  );
}
