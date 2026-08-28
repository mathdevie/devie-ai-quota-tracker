# Remote dashboard

> Removed from the product: the feature shipped in 0.9.x but was not ready,
> so it is out of every build after 0.9.6. The complete implementation, the
> `src-desktop/src/remote.rs` server, the `RemoteAccessSettings` and
> `RemoteTokenGate` components, the `Settings.Remote` translations, and the
> `docs/remote-access.md` user guide, stays on the `archive/remote-dashboard`
> branch. Start from there to bring it back.
>
> What the shipped version did differently from this plan: the remote page
> polled `/api/state` every 30 seconds instead of server-sent events (simpler,
> and Cloudflare buffers long streams), the copied link carried the token in
> the URL fragment, and the files came from Tauri's embedded assets, so no
> `tower-http` static file service was needed.
>
> One thing to redo on the way back: `Database::initialize` now deletes the
> `remote_enabled`, `remote_port`, `remote_lan`, and `remote_token` rows on
> every start. Drop that statement before the settings can persist again.

Goal: read the quota dashboard from another device. The user puts the app
behind a Cloudflare Tunnel or a Tailscale network. Devie Quota only needs to
serve the dashboard on a local URL.

## Shape

The Rust core gains a small HTTP server, off by default.

- `axum` on `127.0.0.1:<port>` (default `47321`). The user can set the port and
  the bind address (`127.0.0.1` for Cloudflare Tunnel, `0.0.0.0` or the
  Tailscale IP for a tailnet).
- Routes:
  - `GET /` and static files: the same Next.js export in `out/`, served from the
    Tauri resource directory. The web build already runs without Tauri, because
    `isDesktop()` is false in a browser.
  - `GET /api/state`: the `DashboardState` JSON. Same struct the IPC returns.
  - `GET /api/events`: server-sent events. The server forwards every
    `quota:updated` emit so the remote page updates live.
  - `POST /api/refresh`: runs `refresh_all`. Optional, behind the same token.
- Authentication: one bearer token, generated on first enable and stored in the
  `settings` table. The remote page asks for the token once and keeps it in
  `localStorage`. Cloudflare Access or Tailscale ACLs can add a second layer.
- Read-only by default. Sign-in, rename, and remove stay desktop-only.

## Frontend changes

- `src/lib/desktop.ts` gets a third mode next to `native` and `preview`:
  `remote`. It reads `window.location.origin + /api/*` when the page runs
  without Tauri and finds a token.
- The remote page hides the title-bar drag regions and the sidebar traffic
  light space.
- A `Remote access` section in Settings: a switch, the port, the URL to copy,
  the token with a "Show" and "Regenerate" button, and a short guide for
  `cloudflared tunnel --url http://localhost:47321` and `tailscale serve`.

## Steps

1. Add `axum` and `tower-http` (static files) to `src-desktop/Cargo.toml`.
2. `src-desktop/src/remote.rs`: server start and stop on a Tokio task, held in
   `Core` behind a `Mutex<Option<JoinHandle>>`.
3. Settings rows in the database: `remote_enabled`, `remote_port`,
   `remote_bind`, `remote_token`.
4. Commands: `set_remote_access(enabled, port, bind)`,
   `regenerate_remote_token`.
5. Frontend `remote` mode and the Settings section.
6. Docs: `docs/remote-access.md` with the Cloudflare Tunnel and Tailscale steps.

## Open questions

- Should the remote page allow `refresh`? It costs provider API calls.
- Should the server serve on the LAN without a tunnel? A token over plain HTTP
  on a home network is a small risk; default to loopback only.
