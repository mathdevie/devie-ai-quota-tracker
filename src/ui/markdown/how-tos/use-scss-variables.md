# Use SCSS Variables

Devie UI tokens are CSS variables, so they can be swapped at runtime (themes, dark mode, user preferences). To make authoring SCSS less error-prone, Devie UI also re-exports each token as an SCSS variable in `src/ui/_variables.scss`.

## Why Use SCSS Variables?

- **Cleaner SCSS:** write `$devie__color__text` instead of `var(--devie__color__text)`
- **“Type-safe” (typo-safe) tokens:** misspelling an SCSS variable fails at build time, while a misspelled CSS variable usually fails silently at runtime
- **Still themeable:** these SCSS variables expand to `var(--...)`, so switching themes updates values without recompiling

## How It Works

The file `src/ui/_variables.scss` maps each design token to its CSS variable. The SCSS variable is just an alias, and the browser still resolves the value at runtime:

**src/ui/_variables.scss**

```scss
// src/ui/_devie.scss
// Each SCSS variable is just an alias to a CSS variable.
// That means the value is still resolved by the browser at runtime (and can be themed).

$devie__color__text: var(--devie__color__text);
$devie__color__background: var(--devie__color__background);
$devie__color__line: var(--devie__color__line);

$devie__spacing__x2: var(--devie__spacing__x2);
$devie__radius: var(--devie__radius);

// ... more tokens
```

## Using Tokens in a CSS Module

Import the variables once at the top of your `.module.scss` file, then use the tokens like any other SCSS variable:

**Card.module.scss**

```scss
// src/components/Card.module.scss
@use '../ui/_devie.scss' as *;

.card {
  padding: $devie__spacing__x2;
  border-radius: $devie__radius;
  border: 1px solid $devie__color__line;
  background: $devie__color__background;
  color: $devie__color__text;
}
```

## Gotchas

- **Sass color functions won't work:** these values are `var(...)` strings, so functions like `lighten()` or `darken()` can't compute a new color at build time.
- **Use CSS runtime functions instead:** prefer `color-mix()` or the helpers in `src/ui/_utils.scss` when you need hover/disabled overlays that still work across themes.

## Related Guides

- [Theming](/theming): list of tokens and how to override them
- [Implement Dark Mode](/how-to/implement-dark-mode): CSS-only dark mode via `prefers-color-scheme`

---

*Generated from [devie-ui.com/how-to/use-scss-variables](https://devie-ui.com/how-to/use-scss-variables)*