# Remote dashboard

Devie Quota can serve its dashboard over HTTP, so that another laptop, a
phone, or a tablet can read the quotas. The app on the Mac stays the only
place that signs in, renames, removes, or configures accounts. A remote page
reads the quotas and can trigger a refresh. Nothing else.

The server is off by default.

## Turn it on

1. Open **Settings › Remote dashboard** and turn the switch on.
2. The app picks port `47321` and creates an access token.
3. Click **Copy link**. The link looks like
   `http://localhost:47321/#token=…`. The token rides in the URL fragment,
   so it never reaches a proxy or a log.
4. Open the link on another device. The page stores the token and drops it
   from the address bar.

A device without the token sees a form that asks for it. **Regenerate**
creates a new token and signs every device out.

## Reach the Mac

### Same network

Turn **Local network** on. The server then listens on every interface, and
the **Address** row shows the Mac's network address, for example
`http://192.168.1.20:47321`. The link stays plain HTTP: use this on a network
you trust.

### Cloudflare Tunnel

Leave **Local network** off. The server listens on `localhost` only, and the
tunnel is the only way in.

1. Install `cloudflared`:

   ```sh
   brew install cloudflared
   ```

2. Quick test with a temporary address:

   ```sh
   cloudflared tunnel --url http://localhost:47321
   ```

   `cloudflared` prints a `*.trycloudflare.com` address. Open it and enter the
   token, or append `#token=…` from the copied link.

3. For a stable address on your own domain, create a named tunnel and route
   a hostname to `http://localhost:47321`:

   ```sh
   cloudflared tunnel login
   cloudflared tunnel create devie-quota
   cloudflared tunnel route dns devie-quota quota.example.com
   cloudflared tunnel run --url http://localhost:47321 devie-quota
   ```

   Put [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
   in front of the hostname for a second sign-in layer, and run the tunnel as
   a service (`sudo cloudflared service install`) so it survives a reboot.

### Tailscale

Leave **Local network** off and let Tailscale forward to the port:

```sh
tailscale serve --bg 47321
```

## API

Every route except the page files needs `Authorization: Bearer <token>`.

| Route | Result |
| --- | --- |
| `GET /api/state` | The dashboard state. `mode` is `remote`; the token is not included. |
| `POST /api/refresh` | Refreshes every enabled account, then returns the state. |
| `POST /api/refresh/{connection-id}` | Refreshes one account, then returns the state. |
| `GET /api/codex-resets` | The cached codex-resets.com news. |

The page files (`/`, `/_next/...`) are the frontend the app windows use. They
are public; they hold no data.

## Notes

- The remote page reads the state every 30 seconds and when its tab comes to
  the front. The Mac keeps its own five-minute refresh timer.
- Provider tokens never leave the Mac. The API serves the same normalized
  quota values the windows show.
- Ports below `1024` are not accepted. A port in use shows an error and
  leaves the switch off.
- The setting persists: the server starts with the app.
