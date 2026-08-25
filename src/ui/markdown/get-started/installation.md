# Installation

## 1. Prerequisites

At the very least, you need **React**.

> Components are tested with React 19+, and include the "use client" directive when client-side JS is required. If you are on lower version of React, you can try to use Devie UI by removing the unsupported directives.

## 2. Install Dependencies

Devie UI components are based on [ Base UI ](https://base-ui.com/) primitives. **clsx** is used for constructing classNames.

```terminal
# bun
bun add @base-ui/react clsx

# npm
npm i @base-ui/react clsx

# pnpm
pnpm add @base-ui/react clsx

# yarn
yarn add @base-ui/react clsx
```

Icons used throughout the examples are from the [ Lucide ](https://lucide.dev/) icon library.

```terminal
# bun
bun add lucide-react

# npm
npm install lucide-react

# pnpm
pnpm add lucide-react

# yarn
yarn add lucide-react
```

> If you prefer to use your own icon, you can skip the installation of Lucide, and substitute any icons to the solution of your choice when adding Devie UI components in your project global styles.

Both Base UI and Lucide are tree-shakeable, so your app bundle will contain only the components that you actually use.

## 3. Create CSS Variables

All components are styled using a set of CSS Variables.

You need to define these variables in your project.

```css
@layer devie {
  :root {
    /* Color Tokens */
    --devie__color__text: #111111;
    --devie__color__text-sub: #848385;
    --devie__color__line: #d7d7d7;
    --devie__color__background: #ffffff;
    --devie__color__background-sub: #f5f5f5;
    --devie__color__primary: #5739da;
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: #df5449;
    --devie__color__danger-label: #ffffff;
    --devie__color__success: #0da841;
    --devie__color__success-label: #ffffff;
    --devie__color__warning: #ff7e28;
    --devie__color__warning-label: #ffffff;

    /* Font Tokens */
    --devie__font-family:
      -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial,
      "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
    --devie__font-size__title1: 32px;
    --devie__font-size__title2: 24px;
    --devie__font-size__title3: 20.5px;
    --devie__font-size__normal: 16px;
    --devie__font-size__small: 14px;

    /* Radius Tokens */
    --devie__radius: 8px;
    --devie__radius-strong: 16px;

    /* Shadow Tokens */
    --devie__shadow__menu:
    0px 10px 30px -16px rgba(0, 0, 0, 0.1), 0px 4px 10px -6px
    rgba(0, 0, 0, 0.25);

    /* Literal Colors Tokens */
    --devie__color__literal-gray: #6b7280;
    --devie__color__literal-brown: #a16207;
    --devie__color__literal-orange: #ea580c;
    --devie__color__literal-yellow: #d97706;
    --devie__color__literal-green: #16a34a;
    --devie__color__literal-blue: #2563eb;
    --devie__color__literal-purple: #9333ea;
    --devie__color__literal-pink: #ec4899;
    --devie__color__literal-red: #dc2626;

    /* Effect Tokens */
    --devie__effect__hover-intensity: 0.06;
    --devie__effect__disabled-intensity: 0.7;
    --devie__effect__disabled-desaturate: 0.5;
    --devie__effect__disabled-target-l: 0.9;

    /* Spacing Tokens */
    --devie__spacing__x05: 4px;
    --devie__spacing__x1: 8px;
    --devie__spacing__x2: 16px;
    --devie__spacing__x3: 24px;
    --devie__spacing__x4: 32px;
    --devie__spacing__x5: 40px;
    --devie__spacing__x6: 48px;
    --devie__spacing__x7: 56px;
    --devie__spacing__x8: 64px;
  }
}
```

Learn how to customize your theme(s) by visiting the [Theming](/theming) section.

## 4. Set Up SCSS Variable

The `_devie.scss` file re-exports CSS variables as SCSS variables for type-safety, and includes two helper functions for generating hover and disabled state colors.

```scss
@use 'sass:string';

/* Color Tokens */
$devie__color__text: var(--devie__color__text);
$devie__color__text-sub: var(--devie__color__text-sub);
$devie__color__line: var(--devie__color__line);
$devie__color__background: var(--devie__color__background);
$devie__color__background-sub: var(--devie__color__background-sub);
$devie__color__primary: var(--devie__color__primary);
$devie__color__primary-label: var(--devie__color__primary-label);
$devie__color__danger: var(--devie__color__danger);
$devie__color__danger-label: var(--devie__color__danger-label);
$devie__color__success: var(--devie__color__success);
$devie__color__success-label: var(--devie__color__success-label);
$devie__color__warning: var(--devie__color__warning);
$devie__color__warning-label: var(--devie__color__warning-label);

/* Font Tokens */
$devie__font-family: var(--devie__font-family);
$devie__font-size__title1: var(--devie__font-size__title1);
$devie__font-size__title2: var(--devie__font-size__title2);
$devie__font-size__title3: var(--devie__font-size__title3);
$devie__font-size__normal: var(--devie__font-size__normal);
$devie__font-size__small: var(--devie__font-size__small);

/* Radius Tokens */
$devie__radius: var(--devie__radius);
$devie__radius-strong: var(--devie__radius-strong);

/* Shadow Tokens */
$devie__shadow__menu: var(--devie__shadow__menu);

/* Literal Color Tokens */
$devie__color__literal-gray: var(--devie__color__literal-gray);
$devie__color__literal-brown: var(--devie__color__literal-brown);
$devie__color__literal-orange: var(--devie__color__literal-orange);
$devie__color__literal-yellow: var(--devie__color__literal-yellow);
$devie__color__literal-green: var(--devie__color__literal-green);
$devie__color__literal-blue: var(--devie__color__literal-blue);
$devie__color__literal-purple: var(--devie__color__literal-purple);
$devie__color__literal-pink: var(--devie__color__literal-pink);
$devie__color__literal-red: var(--devie__color__literal-red);

/* Spacing Tokens */
$devie__spacing__x05: var(--devie__spacing__x05);
$devie__spacing__x1: var(--devie__spacing__x1);
$devie__spacing__x2: var(--devie__spacing__x2);
$devie__spacing__x3: var(--devie__spacing__x3);
$devie__spacing__x4: var(--devie__spacing__x4);
$devie__spacing__x5: var(--devie__spacing__x5);
$devie__spacing__x6: var(--devie__spacing__x6);
$devie__spacing__x7: var(--devie__spacing__x7);
$devie__spacing__x8: var(--devie__spacing__x8);

/* Effect Transformers */
@function devie-hover-color($color) {
    @return string.unquote(
        "oklch(from #{$color} calc(l * (1 - var(--devie__effect__hover-intensity))) c h)"
    );
}

@function devie-disabled-color($color) {
    @return string.unquote(
        "oklch(from #{$color} calc(l + (var(--devie__effect__disabled-target-l) - l) * var(--devie__effect__disabled-intensity)) calc(c * var(--devie__effect__disabled-desaturate)) h)"
    );
}
```

This file serves as the shared foundation for all the component stylesheets.

## 5. (Optional) Define an Isolated Stacking Context

Devie UI (and Base UI) components do not use a list of `z-index` values. Instead, elements that visually need to be rendered above the rest of the application use portals at the end of the `<body>`. This offers the flexibility and simplicity of not having to fight against `z-index` values.

For this to work properly, your application needs to define a new [ stacking context ](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context) :

```tsx
<body>
  <div style={{ isolation: "isolate" }}>
    {children}
  </div>
</body>
```

See the [ Stack elements without z-index ](/how-to/z-index-and-stacking) guide for the full rationale and frequently asked questions.

## 6. All Set

You can now browse the Components and add the ones needed to your project.

---

*Generated from [devie-ui.com/installation](https://devie-ui.com/installation)*