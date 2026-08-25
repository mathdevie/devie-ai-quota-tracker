# Theming

Styling for all Devie UI components utilizes a unified set of design tokens defined in global CSS variables. This is a minimalist approach that meets the following requirements:

- It ensures design consistency across the components.
- It provides a centralized way to edit the theme to match your style.

Following the [Installation guide](/installation), you should have already defined the default variables in your project.

## Customizing Theme

Once the default theme is set up, you can modify values based on your preferences.

You can edit the values directly, or keep the defaults and overwrite only the values you need.

This approach to theming can be leveraged to [implement dark mode](/how-to/implement-dark-mode), or even [manage multiple themes](/how-to/manage-multiple-themes).

> **Can I edit a specific component without modifying the theme?** Of course. The code is yours. Each component has its own stylesheet, allowing you to change any CSS property definition to a different variable, a hardcoded value, or even create new variables of your own.

## List of All Variables

We prefer variables to serve a functional role as design tokens (e.g. "color-text") rather than hue values typically used in other libraries (e.g. "blue-500").

### Color Tokens

| Token | Description |
|-------|-------------|
| `--devie__color__text` | Main text color. |
| `--devie__color__text-sub` | Sub-text color. |
| `--devie__color__background` | Main background color. |
| `--devie__color__background-sub` | Secondary background color for contrast areas. |
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
| `--devie__font-family` | Default font family with fallbacks. Make sure you have the font imported. |

> Tip: If you can, combine font-size with line-height values that lets you match a spacing unit. This is what this site does to have the text blocks match multipliers of 8px.

### Radius Tokens

| Token | Description |
|-------|-------------|
| `--devie__radius` | Default border radius for elements. |
| `--devie__radius-strong` | Larger border radius for emphasis. |

### Shadow Tokens

| Token | Description |
|-------|-------------|
| `--devie__shadow__menu` | Default shadow for menus. |

### Literal Color Tokens

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

Literal color tokens are used for charts, tags, folders, and other UI elements that require a specific color identity. This means the color is explicitly named and expected by the user, regardless of the theme.

### Effect Tokens

| Token | Description |
|-------|-------------|
| `--devie__effect__hover-intensity` | Hover darkening intensity. |
| `--devie__effect__disabled-intensity` | Blend intensity towards the disabled target lightness. |
| `--devie__effect__disabled-desaturate` | Disabled saturation multiplier. |
| `--devie__effect__disabled-target-l` | Target lightness (OKLCH L value) for disabled state blending. |

For simplicity, the Devie UI design determines appropriate hover and disabled state colors using helper functions (`devie-hover-color()` and `devie-disabled-color()`).

The hover function darkens colors slightly. The disabled function blends colors towards a target lightness and reduces saturation, making both dark text and bright backgrounds appear appropriately muted.

If needed, you can also modify this behavior in your components to set your own hover and disabled states. These serve as good defaults.

---

*Generated from [devie-ui.com/theming](https://devie-ui.com/theming)*