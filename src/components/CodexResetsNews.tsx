"use client";

import clsx from "clsx";
import { ExternalLink, Newspaper, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CodexResetsStatus } from "@/lib/contracts";
import { formatAgo } from "@/lib/date";
import {
  getCodexResetsStatus,
  onCodexResetsStatus,
  openExternalUrl,
} from "@/lib/desktop";
import Callout from "@/ui/Callout";
import styles from "./CodexResetsNews.module.scss";
import IconTip from "./IconTip";

/** One request serves every Codex card; the core caches the answer too. */
const CACHE_FOR = 10 * 60_000;
/** Older resets are not shown. A forecast lasts until it expires. */
const MAX_AGE = 3 * 86_400_000;
/** The time of the last dismissed item. Everything up to it stays hidden. */
const DISMISSED_KEY = "codexResetsNews.dismissedAt";
/**
 * How often the banner re-checks the clock and the status. The cache serves
 * most ticks; a request goes out when it expires, and a failure is retried.
 */
const TICK = 60_000;

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
      storeStatus(value);
      return value;
    })
    .finally(() => {
      cache.pending = undefined;
    });
  return cache.pending;
}

/**
 * Keeps an answer, aged by its fetch time. When codex-resets.com fails, the
 * core hands back its last good answer with the old time, so the next tick
 * asks again instead of waiting another ten minutes.
 */
function storeStatus(value: CodexResetsStatus) {
  const fetchedAt = new Date(value.fetchedAt).getTime();
  cache.value = value;
  cache.at = Number.isFinite(fetchedAt)
    ? Math.min(fetchedAt, Date.now())
    : Date.now();
}

/** The one piece of news the banner shows. */
interface NewsItem {
  /** "banked": a granted reset credit, not an executed reset. */
  kind: "watch" | "reset" | "banked";
  /** When it happened. A dismissal hides this item and every older one. */
  at: string;
  percent?: number;
  window?: string;
  sourceUrl?: string;
}

/**
 * The newest item: an active forecast, or a reset from the last three days.
 * Items are told apart by time, because the API gives the reset an id but
 * the forecast none.
 */
export function latestNews(
  status: CodexResetsStatus,
  now = Date.now(),
): NewsItem | undefined {
  const items: NewsItem[] = [];
  const watch = status.activeWatch;
  if (watch && new Date(watch.expiresAt).getTime() > now) {
    items.push({
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
      kind: reset.resetType === "banked" ? "banked" : "reset",
      at: reset.announcedAt,
      sourceUrl: reset.sourceUrl,
    });
  }
  return items
    .filter((item) => {
      const age = now - new Date(item.at).getTime();
      return Number.isFinite(age) && (item.kind === "watch" || age < MAX_AGE);
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0];
}

/** The time of the last dismissed item, as milliseconds. */
function readDismissedAt(): number {
  try {
    return new Date(window.localStorage.getItem(DISMISSED_KEY) ?? 0).getTime();
  } catch {
    return 0;
  }
}

function writeDismissedAt(at: string) {
  try {
    window.localStorage.setItem(DISMISSED_KEY, at);
  } catch {
    // Private mode or a full store: the banner comes back next time.
  }
}

/**
 * A warning banner in the Codex card with the latest reset news from
 * codex-resets.com: one line of text, a link to the source, and a cross.
 * A dismissed item stays hidden, with everything older; a newer item shows.
 */
export default function CodexResetsNews({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState<CodexResetsStatus>();
  const [dismissedAt, setDismissedAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    setDismissedAt(readDismissedAt());
    const reload = () =>
      loadStatus()
        .then((value) => live && setStatus(value))
        .catch(() => {
          // No news is not an error worth a message in the card.
        });
    void reload();
    const timer = window.setInterval(() => {
      setNow(Date.now());
      void reload();
    }, TICK);
    const stop = onCodexResetsStatus((value) => {
      storeStatus(value);
      if (live) setStatus(value);
    });
    return () => {
      live = false;
      window.clearInterval(timer);
      stop();
    };
  }, []);

  const item = status ? latestNews(status, now) : undefined;
  if (!item || new Date(item.at).getTime() <= dismissedAt) return null;

  // The forecast window is English text from the site. It follows the
  // translated sentence instead of being inlined.
  const ago = formatAgo(item.at, i18n.language, now);
  const text =
    item.kind === "reset"
      ? t("Quota.News.Reset", { ago })
      : item.kind === "banked"
        ? t("Quota.News.Banked", { ago })
        : `${
            item.percent === undefined
              ? t("Quota.News.WatchNoPercent")
              : t("Quota.News.Watch", { percent: item.percent })
          }${item.window ? ` ${item.window}` : ""}`;

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
            writeDismissedAt(item.at);
            setDismissedAt(new Date(item.at).getTime());
          }}
          type="button"
        >
          <X size={13} />
        </button>
      </IconTip>
    </Callout.Root>
  );
}
