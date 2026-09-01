# Changelog

All notable changes to Devie AI Quota Tracker are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-09-02

### Added

- The project is open source under the MIT license, and each release now
  attaches its DMG to GitHub Releases.

### Changed

- Renamed the app from "Devie Quota" to "Devie AI Quota Tracker". The bundle
  identifier, the update endpoint, and local data locations are unchanged.

## [0.11.0] - 2026-09-01

### Added

- The menu bar popover has its own quota filters.

### Fixed

- The menu bar header shows the active filter values.

## [0.10.0] - 2026-08-31

### Added

- Title bar navigation with contextual controls, replacing the sidebar.
- A start at login setting.
- Japanese and Simplified Chinese interface languages.
- Opt-out anonymous telemetry and crash reports (PostHog EU).

### Changed

- New monochrome quota mark as the app logo.
- Shorter dashboard title: "AI Quota".

### Removed

- The token-protected remote quota dashboard.

### Fixed

- macOS notifications use `UNUserNotificationCenter` and ask for permission.
- The popover stays open while the full screen menu bar hides.
- Native light interface and macOS surface polish.

## [0.9.7] - 2026-08-28

### Added

- Stable and nightly update channels, picked in Settings.
- Hideable quota bars on account cards.

### Fixed

- Scoped Claude weekly model limits parse correctly.
- The menu bar popover shows over full screen apps, becomes key, and keeps
  its floating level.
- Codex reset news hardening and periodic reload.

## [0.8.0] - 2026-08-27

### Added

- Cursor model pools and codex-resets.com reset news.
- A Dock icon like a regular app; the menu bar item survives closing the
  window.

## [0.7.0] - 2026-08-26

### Added

- GitHub Copilot AI Credits, paid usage rows, and plan names.
- Cursor accounts with the desktop deep-link sign-in.

## [0.6.0] - 2026-08-26

### Added

- Codex banked reset credits and localized reset dates.

### Fixed

- The menu bar popover hides on outside clicks.

## [0.5.0] - 2026-08-26

### Added

- Native-style sidebar and settings polish.

### Fixed

- The OAuth restart loop.

## [0.4.0] - 2026-08-26

### Added

- Gemini CLI quota support.
- Multilingual interface support.
- The Quota Optimizer.

### Changed

- App sign-ins only: auto-detected CLI profiles were removed.

## [0.3.0] - 2026-08-26

### Added

- Quota alerts and auto-ping.

### Changed

- Refined quota interface and menu bar logo.

## [0.2.0] - 2026-08-26

### Added

- First macOS proof of concept: menu bar item, popover, OAuth sign-in for
  Claude and Codex, SQLite storage, signed Apple silicon builds, and the
  CrabNebula auto-updater.
