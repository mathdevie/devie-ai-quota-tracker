# Add Dark Mode

CSS implements dark mode with the `prefers-color-scheme` media feature. Define two sets of variables based on the user's browser preference.

**globals.scss**

```scss
/* Light theme (default) */
:root {
  color-scheme: light;
  --devie__color__text: #111111;
  --devie__color__text-sub: #848385;
  --devie__color__background: #ffffff;
  --devie__color__background-sunken: #f5f5f5;
  --devie__color__line: #d7d7d7;
  --devie__color__primary: #543fd6;
  --devie__color__primary-label: #ffffff;
  /* ... other tokens */
}

/* Dark theme (automatic based on system preference) */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --devie__color__text: #f3faff;
    --devie__color__text-sub: #8fa3b0;
    --devie__color__background: #0b1118;
    --devie__color__background-sunken: #151c26;
    --devie__color__line: #2a3441;
    --devie__color__primary: #4a90e2;
    --devie__color__primary-label: #ffffff;
    /* ... other tokens */
  }
}
```

This approach is performant because the decision is made in CSS before hydration, avoiding a flash of the wrong theme and keeping runtime work at zero.

This approach has two limitations:

- No support for user-controlled theme switching
- Only two modes supported (light and dark)

For user-controlled themes, see [Manage More Themes](/how-to/manage-multiple-themes).

---

*Generated from [devie-ui.com/how-to/implement-dark-mode](https://devie-ui.com/how-to/implement-dark-mode)*