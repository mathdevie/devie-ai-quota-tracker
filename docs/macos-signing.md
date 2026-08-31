# macOS signing

The `Release Desktop App` workflow (`release-desktop.yml`) builds an Apple
silicon app and DMG, signs them with a Developer ID Application
certificate, and submits them to Apple for notarization. The nightly
workflow (`nightly-desktop.yml`) uses the same signing setup.

## GitHub environment

Add these secrets to the `Release` environment:

| Secret | Value |
| --- | --- |
| `APPLE_CERTIFICATE` | The base64 text of the exported `.p12` certificate. |
| `APPLE_CERTIFICATE_PASSWORD` | The password used during the `.p12` export. |
| `APPLE_SIGNING_IDENTITY` | The full Developer ID Application identity. |
| `APPLE_ID` | The Apple account used for notarization. |
| `APPLE_PASSWORD` | An app-specific password for that Apple account. |
| `APPLE_TEAM_ID` | The Apple Developer team identifier. |

Repository secrets cannot be read or copied through the GitHub API.
Add the values from your own Apple Developer account.

Create the certificate value with this command:

```sh
base64 -i DeveloperIDApplication.p12 | pbcopy
```

Do not commit the certificate, its password, or any Apple credentials.

## Run a signed build

Bump the version first with `bun run bump X.Y.Z` and merge it. Then
dispatch `Release Desktop App` from the repository Actions page.

The workflow reads the version from `src-desktop/tauri.conf.json` and
refuses to run when the `v<version>` tag already exists. It signs and
notarizes the build, publishes it to CrabNebula Cloud (where the in-app
updater picks it up), and tags the released commit.
