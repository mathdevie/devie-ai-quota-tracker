# Security policy

## Reporting a vulnerability

Report vulnerabilities in private. Do not open a public issue.

- Use GitHub private vulnerability reporting on this repository
  (**Security → Report a vulnerability**), or
- email `hi@math.dev`.

You will get an answer within a week.

## Token storage model

Devie AI Quota Tracker handles OAuth tokens for provider accounts. The model:

- Tokens live in one private JSON file per connection, with `0600`
  permissions, under
  `~/Library/Application Support/com.devie.quota/credentials/`.
- Tokens never enter the React webview; the Rust core owns every provider
  request. SQLite stores neither tokens nor complete provider responses.
- The app owns its tokens and never reads or changes the CLI logins on the
  Mac.
- Removing an account deletes its token file.

## Supported versions

Only the latest release receives security fixes. Update through the in-app
updater or the
[CrabNebula Cloud releases page](https://web.crabnebula.cloud/mathdev/devie-quota/releases).
