# Notices

Devie AI Quota Tracker is released under the MIT License (see [LICENSE](../LICENSE)).
This file lists third-party material bundled in the repository and the
terms that apply to it.

## Devie UI (`src/ui`)

`src/ui` is a vendored subset of [Devie UI](https://www.devie-ui.com/)
(components, tokens, and themes), copyright the Devie AI Quota Tracker author, and
is covered by this repository's MIT license.

## Provider icons (`public/providers`)

The images in `public/providers` are the logos of the AI products the
app tracks. Each logo is the property of its respective owner and is
used here solely to identify that provider. The MIT license of this
repository does not apply to these images and grants no rights to them.

## OAuth client identifiers

The app signs in through the public OAuth clients of the official
provider tools, so it can read quota data for the signed-in user:

- **Claude** (`src-desktop/src/oauth/claude.rs`): the public OAuth
  client ID used by Anthropic's Claude Code CLI.
- **Codex** (`src-desktop/src/oauth/codex.rs`): the public OAuth client
  ID used by OpenAI's Codex CLI.
- **Gemini** (`src-desktop/src/oauth/gemini.rs`): the public
  installed-application OAuth client (ID and non-confidential secret)
  shipped in Google's
  [Gemini CLI](https://github.com/google-gemini/gemini-cli)
  (`packages/core/src/code_assist/oauth2.ts`, Apache License 2.0).
- **GitHub Copilot** (`src-desktop/src/oauth/copilot.rs`): the public
  OAuth client ID used by GitHub's Copilot IDE plugins.

These identifiers are published in the corresponding open-source tools
or are otherwise public. They are not credentials of this project.

## Trademarks

"Claude" and "Anthropic" (Anthropic PBC), "Codex", "ChatGPT", and
"OpenAI" (OpenAI), "Gemini" and "Google" (Google LLC), and "GitHub
Copilot" (GitHub, Inc.) are trademarks of their respective owners.
Devie AI Quota Tracker is an independent project and is not affiliated with or
endorsed by any of them.
