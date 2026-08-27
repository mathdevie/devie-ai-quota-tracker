"use client";

import clsx from "clsx";
import { ExternalLink, Newspaper, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CodexResetsStatus } from "@/lib/contracts";
import { getCodexResetsStatus, openExternalUrl } from "@/lib/desktop";
import Callout from "@/ui/Callout";
import styles from "./CodexResetsNews.module.scss";
import IconTip from "./IconTip";

/** One request serves every Codex card; the core caches the answer too. */
const CACHE_FOR = 10 * 60_000;
/** Older news is not shown. */
const MAX_AGE = 3 * 86_400_000;
const DISMISSED_KEY = "codexResetsNews.dismissed";

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

/** The one piece of news the banner shows. */
interface NewsItem {
  /** Stable across reads, so a dismissal sticks. */
  id: string;
  kind: "watch" | "reset";
  at: string;
  percent?: number;
  window?: string;
  sourceUrl?: string;
}

/**
 * The newest item of the last three days: an active forecast, else the last
 * reset. The API gives the reset a stable id; the forecast has none, so the
 * time it was observed stands in.
 */
export function latestNews(
  status: CodexResetsStatus,
  now = Date.now(),
): NewsItem | undefined {
  const items: NewsItem[] = [];
  const watch = status.activeWatch;
  if (watch && new Date(watch.expiresAt).getTime() > now) {
    items.push({
      id: `watch:${watch.observedAt}`,
      kind: "watch",
      at: watch.observedAt,
      percent: watch.resetChancePercent,
      window: watch.forecastWindow,
      sourceUrl: watch.sourceUrl,
    });
  }
  const reset = status.latestReset;
  if (reset) {
    items.push({
      id: `reset:${reset.id}`,
      kind: "reset",
      at: reset.announcedAt,
      sourceUrl: reset.sourceUrl,
    });
  }
  return items
    .filter((item) => now - new Date(item.at).getTime() < MAX_AGE)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
}

function readDismissed(): string | undefined {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function writeDismissed(id: string) {
  try {
    window.localStorage.setItem(DISMISSED_KEY, id);
  } catch {
    // Private mode or a full store: the banner comes back next time.
  }
}

/** "2 days ago", "5 hours ago", or "yesterday", in the interface language. */
function agoText(value: string, locale: string): string {
  const hours = (Date.now() - new Date(value).getTime()) / 3_600_000;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (hours < 24) return format.format(-Math.max(0, Math.round(hours)), "hour");
  return format.format(-Math.round(hours / 24), "day");
}

/**
 * A warning banner in the Codex card with the latest reset news from
 * codex-resets.com: one line of text, a link to the source, and a cross.
 * A dismissed item stays hidden; a newer item shows again.
 */
export default function CodexResetsNews({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<CodexResetsStatus>();
  const [dismissed, setDismissed] = useState<string>();

  useEffect(() => {
    let live = true;
    setDismissed(readDismissed());
    loadStatus()
      .then((value) => live && setStatus(value))
      .catch(() => {
        // No news is not an error worth a message in the card.
      });
    return () => {
      live = false;
    };
  }, []);

  const item = status ? latestNews(status) : undefined;
  if (!item || item.id === dismissed) return null;

  const text =
    item.kind === "reset"
      ? t("Quota.News.Reset", { ago: agoText(item.at, i18n.language) })
      : item.percent === undefined
        ? t("Quota.News.WatchNoPercent", { window: item.window })
        : t("Quota.News.Watch", {
            percent: item.percent,
            window: item.window,
          });

  return (
    <Callout.Root className={clsx(styles.banner, className)} variant="warning">
      <Callout.Icon>
        <Newspaper size={14} />
      </Callout.Icon>
      <Callout.Content>{text}</Callout.Content>
      {item.sourceUrl && (
        <IconTip label={t("Quota.News.Open")}>
          <button
            aria-label={t("Quota.News.Open")}
            className={styles.action}
            onClick={() => item.sourceUrl && openExternalUrl(item.sourceUrl)}
            type="button"
          >
            <ExternalLink size={13} />
          </button>
        </IconTip>
      )}
      <IconTip label={t("Quota.News.Dismiss")}>
        <button
          aria-label={t("Quota.News.Dismiss")}
          className={styles.action}
          onClick={() => {
            writeDismissed(item.id);
            setDismissed(item.id);
          }}
          type="button"
        >
          <X size={13} />
        </button>
      </IconTip>
    </Callout.Root>
  );
}
