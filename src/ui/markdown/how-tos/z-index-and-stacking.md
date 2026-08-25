# Stack elements without z-index

A traditional design system ships a `z-index` ladder (e.g. modal at 1000, toast at 1400, tooltip at 1500, and so on) so its overlays sit above the rest of the page.

The problem: any consumer can break that ordering by writing `z-index: 9999` on one of their own components, and the library has no way to win that race short of escalating its own numbers.

Devie UI follows the same approach as Base UI itself and Radix Themes: no `z-index` scale at all. Overlays are rendered in **portals** outside your app's root, and as long as that root is an isolated [ stacking context ](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Stacking_context) , every `z-index` declared inside it is sandboxed and cannot bleed in front of the portaled overlays.

## How isolation works

When the consumer wraps their app root with `isolation: isolate` (see the [Installation](/installation) page), the runtime DOM tree looks roughly like this:

Portaled overlays are siblings of your app root, never children of it. Anything inside the root stacks *relative to itself*, never against the portals. Between portals themselves, the most recently opened one sits on top, which is exactly what users expect when a Popover opens over a Dialog or a Tooltip opens over a Popover.

## FAQ

Can I still use `z-index` in my own components?

Yes. Inside your isolated app root any value you use is sandboxed and cannot affect Devie portals. We still recommend sticking to `auto`, `0`, or `-1` in most cases, both for clarity and to avoid stacking battles inside your own UI.

My element with `z-index` appears above the Devie UI Dialog backdrop. Why?

You are likely missing the isolated app root. Without it, the Dialog (which has no `z-index`) and your avatars (at `z-index: 5`) live in the same root stacking context, and the higher value wins. Make sure you followed from [Installation step 5](/installation).

I need a Popover to appear above another Popover.

Open them in the order you want them stacked. DOM order wins. Nested overlays (a Popover triggered from inside another Popover) are appended later in the DOM and naturally land on top.

What about a sticky header that should stay above Devie overlays?

By design, Devie overlays float above page content. That is the whole point of overlays. If you really need a header that always stays visible, render it as a sibling of your isolated app root (so it shares the body-level stacking context with the portals) and give it a higher `z-index` than the Toast viewport.

Why does Toast appear above other overlays even when opened first?

`Toast.viewport` is the only Devie overlay that ships with an explicit `z-index: 1`. Toasts are often triggered by background activity and must remain visible even when a Dialog opens afterwards, so they opt out of the DOM-order rule.

Why are `Tabs.indicator`, `Popover.arrow`, etc. still using `z-index` internally?

Those values are *local*: they only order siblings inside a single component's own stacking context (the Tabs list, the Popover popup, ...). They never escape and never participate in global stacking. The only allowed local values are `-1`, `0`, and `1`.

---

*Generated from [devie-ui.com/how-to/z-index-and-stacking](https://devie-ui.com/how-to/z-index-and-stacking)*