"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IS_DESKTOP_BUILD, isDesktop } from "@/lib/desktop";

/** Packaged build in a Tauri window. A remote browser has no updater. */
const UPDATER_ENABLED = IS_DESKTOP_BUILD && isDesktop();

type Update = Awaited<
  ReturnType<typeof import("@tauri-apps/plugin-updater").check>
>;

export type UpdateStatus =
  | "idle"
  | "checking"
  | "downloading"
  | "ready"
  | "installing"
  | "error";

/** What a check found. `busy` means a download or install is in progress. */
export type CheckResult = "ready" | "up-to-date" | "error" | "busy";

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  body?: string;
}

interface AppUpdaterValue {
  enabled: boolean;
  status: UpdateStatus;
  progress: number;
  info?: UpdateInfo;
  error?: string;
  /** Looks for an update and downloads it. */
  checkForUpdates: () => Promise<CheckResult>;
  /** Installs the downloaded update and restarts the app. */
  installUpdate: () => Promise<void>;
}

const AppUpdaterContext = createContext<AppUpdaterValue | null>(null);

const BACKGROUND_INTERVAL = 15 * 60 * 1000;

function message(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

/**
 * Mirrors the Mana desktop app: the app checks at start and installs a
 * found update right away. Later checks download in the background and
 * show an "Update available" button, which installs on click.
 */
export function AppUpdaterProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [info, setInfo] = useState<UpdateInfo>();
  const [error, setError] = useState<string>();
  const statusRef = useRef<UpdateStatus>("idle");
  const updateRef = useRef<Update>(null);
  const startedRef = useRef(false);

  const commit = useCallback((next: UpdateStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const download = useCallback(async (): Promise<boolean> => {
    const update = updateRef.current;
    if (!update) return false;
    commit("downloading");
    setProgress(0);
    let total = 0;
    let received = 0;
    try {
      await update.download((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          received += event.data.chunkLength;
          if (total > 0) {
            setProgress(Math.min(100, Math.round((received / total) * 100)));
          }
        } else if (event.event === "Finished") {
          setProgress(100);
        }
      });
      commit("ready");
      return true;
    } catch (reason) {
      setError(message(reason));
      commit("error");
      return false;
    }
  }, [commit]);

  const checkForUpdates = useCallback(async (): Promise<CheckResult> => {
    if (!UPDATER_ENABLED) return "up-to-date";
    const current = statusRef.current;
    if (current === "ready") return "ready";
    if (current === "downloading" || current === "installing") return "busy";
    commit("checking");
    setError(undefined);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (!update) {
        commit("idle");
        return "up-to-date";
      }
      updateRef.current = update;
      setInfo({
        version: update.version,
        currentVersion: update.currentVersion,
        body: update.body,
      });
      return (await download()) ? "ready" : "error";
    } catch (reason) {
      setError(message(reason));
      commit("error");
      return "error";
    }
  }, [commit, download]);

  const installUpdate = useCallback(async () => {
    const update = updateRef.current;
    if (!update || statusRef.current !== "ready") return;
    commit("installing");
    try {
      await update.install();
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (reason) {
      setError(message(reason));
      commit("error");
    }
  }, [commit]);

  useEffect(() => {
    if (!UPDATER_ENABLED || startedRef.current) return;
    startedRef.current = true;
    void checkForUpdates().then((result) => {
      if (result === "ready") void installUpdate();
    });
    const timer = window.setInterval(
      () => void checkForUpdates(),
      BACKGROUND_INTERVAL,
    );
    return () => window.clearInterval(timer);
  }, [checkForUpdates, installUpdate]);

  const value = useMemo(
    () => ({
      enabled: UPDATER_ENABLED,
      status,
      progress,
      info,
      error,
      checkForUpdates,
      installUpdate,
    }),
    [status, progress, info, error, checkForUpdates, installUpdate],
  );

  return (
    <AppUpdaterContext.Provider value={value}>
      {children}
    </AppUpdaterContext.Provider>
  );
}

const disabled: AppUpdaterValue = {
  enabled: false,
  status: "idle",
  progress: 0,
  checkForUpdates: async () => "up-to-date",
  installUpdate: async () => {},
};

export function useAppUpdater(): AppUpdaterValue {
  return useContext(AppUpdaterContext) ?? disabled;
}
