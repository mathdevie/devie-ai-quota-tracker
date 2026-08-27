"use client";

import { ExternalLink, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CodexResetsStatus } from "@/lib/contracts";
import { formatDateTime } from "@/lib/date";
import { getCodexResetsStatus, openExternalUrl } from "@/lib/desktop";
import Popover from "@/ui/Popover";
import styles from "./CodexResetsNews.module.scss";
import IconTip from "./IconTip";

/** One request serves every Codex card; the core caches the answer too. */
const CACHE_FOR = 10 * 60_000;
const cache: {
  value?: CodexResetsStatus;
  at: number;
  pending?: Promise<CodexResetsStatus>;
} = { at: 0 };

function loadStatus(): Promise<CodexResetsStatus> {
  if (cache.value && Date.now() - cache.at < CACHE_FOR) {
    return Promise.resolve(cache.value);
  }
  cache.pending ??= getCodexResetsStatus()
    .then((value) => {
      cache.value = value;
      cache.at = Date.now();
      return value;
    })
    .finally(() => {
      cache.pending = undefined;
    });
  return cache.pending;
}

/** "2 days ago", "5 hours ago", or "yesterday", in the interface language. */
function agoText(value: string, locale: string): string {
  const hours = (Date.now() - new Date(value).getTime()) / 3_600_000;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (hours < 24) return format.format(-Math.max(0, Math.round(hours)), "hour");
  return format.format(-Math.round(hours / 24), "day");
}

/** A text link that leaves the app for the browser. */
function Link({ url, children }: { url: string; children: string }) {
  return (
    <button
      className={styles.link}
      onClick={() => openExternalUrl(url)}
      type="button"
    >
      {children}
      <ExternalLink size={10} />
    </button>
  );
}

/**
 * The community reset news for Codex, from codex-resets.com: a news icon in
 * the card header and a popover with the forecast, the last reset, and the
 * sources. The icon lights up while a forecast is active.
 */
export default function CodexResetsNews({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<CodexResetsStatus>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadStatus()
      .then((value) => live && setStatus(value))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  const watch =
    status?.activeWatch &&
    new Date(status.activeWatch.expiresAt).getTime() > Date.now()
      ? status.activeWatch
      : undefined;
  const lastReset =
    status?.latestReset?.announcedAt ?? status?.stats.lastResetAt;
  const label = t("Quota.News.Title");

  return (
    <Popover.Root>
      <IconTip label={label}>
        <Popover.Trigger
          aria-label={label}
          className={className}
          data-active={watch ? true : undefined}
          data-always
          render={<button type="button" />}
        >
          <Newspaper size={13} />
        </Popover.Trigger>
      </IconTip>
      <Popover.Portal>
        <Popover.Positioner align="end" side="bottom" sideOffset={6}>
          <Popover.Popup className={styles.popup}>
            <Popover.Title className={styles.title}>{label}</Popover.Title>
            {!status && (
              <Popover.Description className={styles.muted}>
                {failed ? t("Quota.News.Unavailable") : t("Quota.News.Loading")}
              </Popover.Description>
            )}
            {status && (
              <>
                <section className={styles.section}>
                  <p
                    className={styles.lead}
                    data-active={watch ? true : undefined}
                  >
                    {watch
                      ? watch.resetChancePercent === undefined
                        ? t("Quota.News.WatchNoPercent", {
                            window: watch.forecastWindow,
                          })
                        : t("Quota.News.Watch", {
                            percent: watch.resetChancePercent,
                            window: watch.forecastWindow,
                          })
                      : t("Quota.News.NoWatch")}
                  </p>
                  {watch && (
                    <p className={styles.muted}>
                      {t("Quota.News.WatchUntil", {
                        date: formatDateTime(watch.expiresAt, i18n.language),
                      })}
                      {watch.sourceUrl && (
                        <>
                          {" · "}
                          <Link url={watch.sourceUrl}>
                            {t("Quota.News.Source")}
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                </section>
                <section className={styles.section}>
                  <p>
                    {lastReset
                      ? t("Quota.News.LastReset", {
                          ago: agoText(lastReset, i18n.language),
                          date: formatDateTime(lastReset, i18n.language),
                        })
                      : t("Quota.News.LastResetUnknown")}
                  </p>
                  <p className={styles.muted}>
                    {status.stats.avgIntervalDays !== undefined &&
                      t("Quota.News.Average", {
                        days: new Intl.NumberFormat(i18n.language, {
                          maximumFractionDigits: 1,
                        }).format(status.stats.avgIntervalDays),
                        total: status.stats.total,
                      })}
                    {status.latestReset?.sourceUrl && (
                      <>
                        {status.stats.avgIntervalDays !== undefined && " · "}
                        <Link url={status.latestReset.sourceUrl}>
                          {t("Quota.News.Source")}
                        </Link>
                      </>
                    )}
                  </p>
                </section>
                <footer className={styles.footer}>
                  <span>{t("Quota.News.Disclaimer")}</span>
                  <Link url={status.siteUrl}>codex-resets.com</Link>
                </footer>
              </>
            )}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
