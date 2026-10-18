# Design for desktop

The flexibility of Devie UI's theming approach makes it easy to design apps with a desktop native feel.

```scss
@layer devie {
  :root {
    --devie__color__text: light-dark(rgba(0, 0, 0, 0.85), rgba(255, 255, 255, 0.85));
    --devie__color__text-sub: light-dark(rgba(0, 0, 0, 0.5), rgba(255, 255, 255, 0.55));
    --devie__color__line: light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
    --devie__color__background: light-dark(#ffffff, #1e1e1e);
    --devie__color__background-sunken: light-dark(#f0f0f0, #171717);
    --devie__color__background-raised: light-dark(#ffffff, #2a2a2a);
    --devie__color__primary: light-dark(#0071e3, #0a84ff);
    --devie__color__primary-label: #ffffff;
    --devie__color__danger: light-dark(#d70015, #ff453a);
    --devie__color__danger-label: #ffffff;
    --devie__color__success: light-dark(#34c759, #32d74b);
    --devie__color__success-label: #ffffff;
    --devie__color__warning: light-dark(#ff9500, #ff9f0a);
    --devie__color__warning-label: #ffffff;
    --devie__color__literal-gray: light-dark(#8e8e93, #98989d);
    --devie__color__literal-brown: light-dark(#a2845e, #ac8e68);
    --devie__color__literal-orange: light-dark(#ff9500, #ff9f0a);
    --devie__color__literal-yellow: light-dark(#ffcc00, #ffd60a);
    --devie__color__literal-green: light-dark(#34c759, #32d74b);
    --devie__color__literal-blue: light-dark(#007aff, #0a84ff);
    --devie__color__literal-purple: light-dark(#af52de, #bf5af2);
    --devie__color__literal-pink: light-dark(#ff2d55, #ff375f);
    --devie__color__literal-red: light-dark(#ff3b30, #ff453a);

    --devie__font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
      system-ui, "Segoe UI", "Helvetica Neue", Helvetica, Arial,
      "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
    --devie__font-size__title1: 26px;
    --devie__font-size__title2: 20px;
    --devie__font-size__title3: 16px;
    --devie__font-size__normal: 13px;
    --devie__font-size__small: 11.5px;
    --devie__radius: 8px;
    --devie__radius-strong: 14px;

    --devie__shadow__menu:
      0px 10px 30px -16px light-dark(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)),
      0px 4px 10px -6px light-dark(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.6));
  }
}
```

## Follow the system preference

Set `color-scheme: light dark` on `:root` to follow the operating system. Use `light` or `dark` to keep one appearance.

---

*Generated from [devie-ui.com/how-to/design-for-desktop-native](https://devie-ui.com/how-to/design-for-desktop-native)*