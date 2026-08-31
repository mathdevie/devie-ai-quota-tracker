# macOS signing

The `Build signed macOS app` workflow creates these artifacts:

- An Apple silicon app ZIP and DMG.

The workflow signs each app with a Developer ID Application certificate.
Tauri submits each app to Apple for notarization.
The workflow then checks the code signature and notarization ticket.

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

Open the repository Actions page.
Select `Build signed macOS app`.
Select `Run workflow`.

The workflow also runs for tags that start with `v`.
It uploads the signed artifacts to the completed workflow run.
It does not create a GitHub release or upload to CrabNebula.
