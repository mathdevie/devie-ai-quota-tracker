# Stack without z-index

Most design systems ship a `z-index` ladder: modal at 1000, toast at 1400, tooltip at 1500. Any consumer can break it with `z-index: 9999` on their own element, and the library can only escalate its numbers.

Devie UI has no `z-index` scale, like Base UI and Radix Themes. Overlays render in **portals** outside your app root. When that root is an isolated [ stacking context ](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context) , every `z-index` inside it is sandboxed and cannot appear above the portals.

## How isolation works

Set `isolation: isolate` on your app root (see [Installation](/installation)). The DOM then looks like this:

Portaled overlays are siblings of the app root, not children. Elements inside the root stack against each other only. Between portals, the last opened one is on top: a Popover opens over a Dialog, a Tooltip over a Popover.

## FAQ

### Can I still use z-index in my own components?

Yes. Inside the isolated app root, any value is sandboxed and cannot affect Devie portals. Prefer `auto`, `0`, or `-1` to avoid stacking battles in your own UI.

### Why does my element appear above the Dialog backdrop?

The app root is not isolated. Without isolation, the Dialog and your element share the root stacking context, and the higher `z-index` wins. Follow [Installation step 5](/installation).

### How do I stack one Popover above another?

Open them in that order. DOM order wins. A Popover opened from inside another Popover is appended later and lands on top.

### How do I keep a sticky header above Devie overlays?

Overlays float above page content by design. If the header must stay visible, render it as a sibling of the isolated app root and give it a `z-index` above 1, the Toast viewport value.

### Why does Toast appear above overlays that opened later?

The Toast viewport is the only Devie overlay with an explicit `z-index: 1`. Toasts often come from background activity and must stay visible when a Dialog opens afterwards.

### Why do some components still use z-index internally?

Values like the Tabs indicator or the Popover arrow are local. They order siblings inside one component's own stacking context and never take part in global stacking. The allowed local values are `-1`, `0`, and `1`.

---

*Generated from [devie-ui.com/how-to/z-index-and-stacking](https://devie-ui.com/how-to/z-index-and-stacking)*