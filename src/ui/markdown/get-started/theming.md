# Theming

All Devie UI components share a unified set of design tokens defined in global CSS variables. This minimalist approach meets two requirements:

- The components stay visually consistent.
- One central place edits the theme to match your style.

The [Installation guide](/installation) defines the default variables in your project. For a desktop window, add the global overrides for the system font, compact text, and smaller corners. See [Design for desktop](/how-to/design-for-desktop-native).

## Customizing Theme

Edit the default values directly, or keep the defaults and overwrite only the values you need. Each theme below shows its overwrites.

**Default**

This site uses the default theme defined in the installation, with no overrides.

**Dark**

```css
@layer devie {
  :root {
    color-scheme: dark;
    --devie__color__text: #d2d4d7;
    --devie__color__text-sub: #717070;
    --devie__color__line: #303030;
    --devie__color__background: #131313;
    --devie__color__background-sunken: #1c1c1c;
    --devie__color__background-raised: #1e1e1e;
    --devie__color__primary: #d1d1d1;
    --devie__color__primary-label: #131313;
    --devie__color__danger: #ef4444;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #22c55e;
    --devie__color__success-label: #131313;
    --devie__color__warning: #f59e0b;
    --devie__color__warning-label: #131313;
    --devie__effect__hover-intensity: 0.4;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.3;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Midnight Ink**

```css
@layer devie {
  :root {
    color-scheme: dark;
    --devie__color__text: #e6e8f0;
    --devie__color__text-sub: #9ca3af;
    --devie__color__line: #9c9c9c;
    --devie__color__background: #131419;
    --devie__color__background-sunken: #252730;
    --devie__color__background-raised: #1f2128;
    --devie__color__primary: #8372b5;
    --devie__color__primary-label: #fff;
    --devie__color__danger: #ef4444;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #10b981;
    --devie__color__success-label: #ffffff;
    --devie__color__warning: #f59e0b;
    --devie__color__warning-label: #000000;
    --devie__effect__hover-intensity: 0.4;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.3;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Copper Sunset**

```css
@layer devie {
  :root {
    color-scheme: light;
    --devie__color__text: #412a21;
    --devie__color__text-sub: #8a7162;
    --devie__color__line: #d0b191;
    --devie__color__background: #fff6eb;
    --devie__color__background-sunken: #faf0e2;
    --devie__color__background-raised: #fffaf3;
    --devie__color__primary: #d87833;
    --devie__color__primary-label: #fff;
    --devie__color__danger: #b22222;
    --devie__color__danger-label: #fff;
    --devie__color__success: #228b22;
    --devie__color__success-label: #fff;
    --devie__color__warning: #ff8c00;
    --devie__color__warning-label: #fff;
    --devie__effect__hover-intensity: 0.025;
    --devie__effect__disabled-intensity: 0.3;
    --devie__effect__disabled-desaturate: 0.5;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Aurora Green**

```css
@layer devie {
  :root {
    color-scheme: dark;
    --devie__color__text: #f0fdfa;
    --devie__color__text-sub: #94a3b8;
    --devie__color__line: #334155;
    --devie__color__background: #0f172a;
    --devie__color__background-sunken: #1e293b;
    --devie__color__background-raised: #1a2540;
    --devie__color__primary: #2dd4bf;
    --devie__color__primary-label: #0f172a;
    --devie__color__danger: #fb7185;
    --devie__color__danger-label: #0f172a;
    --devie__color__success: #4ade80;
    --devie__color__success-label: #0f172a;
    --devie__color__warning: #fbbf24;
    --devie__color__warning-label: #0f172a;
    --devie__effect__hover-intensity: 0.4;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.3;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Sharingan**

```css
@layer devie {
  :root {
    color-scheme: dark;
    --devie__color__text: #fafafa;
    --devie__color__text-sub: #a1a1aa;
    --devie__color__line: #27272a;
    --devie__color__background: #09090b;
    --devie__color__background-sunken: #18181b;
    --devie__color__background-raised: #1c1c20;
    --devie__color__primary: #dc2626;
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: #ef4444;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #22c55e;
    --devie__color__success-label: #000000;
    --devie__color__warning: #eab308;
    --devie__color__warning-label: #000000;
    --devie__effect__hover-intensity: 0.4;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.3;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Alpine Snow**

```css
@layer devie {
  :root {
    color-scheme: light;
    --devie__color__text: #0f172a;
    --devie__color__text-sub: #475569;
    --devie__color__line: #cbd5e1;
    --devie__color__background: #ffffff;
    --devie__color__background-sunken: #f1f5f9;
    --devie__color__background-raised: #ffffff;
    --devie__color__primary: #0284c7;
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: #dc2626;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #16a34a;
    --devie__color__success-label: #ffffff;
    --devie__color__warning: #d97706;
    --devie__color__warning-label: #ffffff;
  }
}
```

**Command Prompt**

```css
@layer devie {
  :root {
    color-scheme: dark;
    --devie__color__text: #00ff00;
    --devie__color__text-sub: #00cc00;
    --devie__color__line: #003300;
    --devie__color__background: #000000;
    --devie__color__background-sunken: #111111;
    --devie__color__background-raised: #121212;
    --devie__color__primary: #00ff00;
    --devie__color__primary-label: #000000;
    --devie__color__danger: #ff0000;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #00ff00;
    --devie__color__success-label: #000000;
    --devie__color__warning: #ffff00;
    --devie__color__warning-label: #000000;
    --devie__effect__hover-intensity: 0.4;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.3;
    --devie__effect__disabled-target-l: 0.5;
  }
}
```

**Totoro**

```css
@layer devie {
  :root {
    color-scheme: light;
    --devie__color__text: #4a4036;
    --devie__color__text-sub: #948c85;
    --devie__color__line: #dcd6cc;
    --devie__color__background: #fdfbf7;
    --devie__color__background-sunken: #f2efe9;
    --devie__color__background-raised: #ffffff;
    --devie__color__primary: #8a7967;
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: #d98279;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #7fa676;
    --devie__color__success-label: #ffffff;
    --devie__color__warning: #e6b655;
    --devie__color__warning-label: #ffffff;
  }
}
```

**Catppuccin Latte**

```css
@layer devie {
  :root {
    color-scheme: light;
    --devie__color__text: #4c4f69;
    --devie__color__text-sub: #5c5f77;
    --devie__color__line: #acb0be;
    --devie__color__background: #eff1f5;
    --devie__color__background-sunken: #e6e9ef;
    --devie__color__background-raised: #f6f7fa;
    --devie__color__primary: #8839ef;
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: #e64553;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #40a02b;
    --devie__color__success-label: #ffffff;
    --devie__color__warning: #fe640b;
    --devie__color__warning-label: #ffffff;
  }
}
```

Use the same approach to [implement dark mode](/how-to/implement-dark-mode), or even [manage multiple themes](/how-to/manage-multiple-themes).

> **Can I edit a specific component without modifying the theme?** Yes. The code is yours. Each component has its own stylesheet, so any property can point to another variable, a hardcoded value, or a new variable of your own.

## List of All Variables

We prefer variables with a functional role, such as "color-text", over the hue values found in other libraries, such as "blue-500".

Backgrounds form three levels. `background-sunken` sits below the page, `background` is the page, and `background-raised` floats above it. A component picks its level by how far it sits above the page, not by what it is.

### Color Tokens

| Token | Description |
|-------|-------------|
| `--devie__color__text` | Main text color. |
| `--devie__color__text-sub` | Sub-text color. |
| `--devie__color__background` | The page. The default surface level. |
| `--devie__color__background-sunken` | A recessed area below the page: a well, a track, a shell. |
| `--devie__color__background-raised` | A layer above the page. It pairs with the menu shadow. |
| `--devie__color__line` | Color for borders and dividers. |
| `--devie__color__primary` | Primary brand color for buttons and interactive elements. |
| `--devie__color__primary-label` | Text color compatible with primary color. |
| `--devie__color__success` | Color for success states and confirmations. |
| `--devie__color__success-label` | Text color compatible with success color. |
| `--devie__color__warning` | Color for warning states and cautionary actions. |
| `--devie__color__warning-label` | Text color compatible with warning color. |
| `--devie__color__danger` | Color for error states and destructive actions. |
| `--devie__color__danger-label` | Text color compatible with danger color. |

### Font Tokens

| Token | Description |
|-------|-------------|
| `--devie__font-size__normal` | Standard font size. |
| `--devie__font-size__small` | Font size for small text elements like captions. |
| `--devie__font-size__title1` | Font size for primary headings. |
| `--devie__font-size__title2` | Font size for secondary headings. |
| `--devie__font-size__title3` | Font size for tertiary headings. |
| `--devie__font-family` | System font stack by default. To use a web font, load it and list it first. |

> Pair each font size with a line height that matches a spacing unit. This site does so to keep text blocks on multiples of 8px.

### Radius Tokens

| Token | Description |
|-------|-------------|
| `--devie__radius` | Default border radius for elements. |
| `--devie__radius-strong` | Larger border radius for emphasis. |

### Shadow Tokens

| Token | Description |
|-------|-------------|
| `--devie__shadow__menu` | Default shadow for menus. |

### Spacing Tokens

Use spacing tokens for padding, gaps, margins, and line heights, so every element lands on the 8px grid.

| Token | Description |
|-------|-------------|
| `--devie__spacing__x05` | Half step of the 8px grid. |
| `--devie__spacing__x1` | One spacing unit, the base of the 8px grid. |
| `--devie__spacing__x2` | Two spacing units. |
| `--devie__spacing__x3` | Three spacing units. |
| `--devie__spacing__x4` | Four spacing units. |
| `--devie__spacing__x5` | Five spacing units. |
| `--devie__spacing__x6` | Six spacing units. |
| `--devie__spacing__x7` | Seven spacing units. |
| `--devie__spacing__x8` | Eight spacing units. |

### Interface Tokens

The zoom scales the interface; see [Scale the interface](/how-to/scale-the-interface).

| Token | Description |
|-------|-------------|
| `--devie__zoom` | The interface zoom factor, 1 at native scale. Applied to the app root and to the popups. |

### Literal Color Tokens

Use literal color tokens for charts, tags, folders, and other elements that need a specific color identity. The user expects the named color, regardless of the theme.

| Token | Description |
|-------|-------------|
| `--devie__color__literal-gray` | Literal Gray color. |
| `--devie__color__literal-brown` | Literal Brown color. |
| `--devie__color__literal-orange` | Literal Orange color. |
| `--devie__color__literal-yellow` | Literal Yellow color. |
| `--devie__color__literal-green` | Literal Green color. |
| `--devie__color__literal-blue` | Literal Blue color. |
| `--devie__color__literal-purple` | Literal Purple color. |
| `--devie__color__literal-pink` | Literal Pink color. |
| `--devie__color__literal-red` | Literal Red color. |

### Effect Tokens

Devie UI derives hover and disabled state colors with the `devie-hover-color()` and `devie-disabled-color()` helper functions.

The hover function darkens colors slightly. The disabled function blends colors towards a target lightness and reduces saturation, making both dark text and bright backgrounds appear appropriately muted.

| Token | Description |
|-------|-------------|
| `--devie__effect__hover-intensity` | Hover darkening intensity. |
| `--devie__effect__disabled-intensity` | Blend intensity towards the disabled target lightness. |
| `--devie__effect__disabled-desaturate` | Disabled saturation multiplier. |
| `--devie__effect__disabled-target-l` | Target lightness (OKLCH L value) for disabled state blending. |

To set your own hover and disabled states, change these functions in your components.

---

*Generated from [devie-ui.com/theming](https://devie-ui.com/theming)*