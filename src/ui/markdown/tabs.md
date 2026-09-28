# <Tabs />

A component for toggling between related panels on the same page. The Tabs component extends [ Base UI's Tabs ](https://base-ui.com/react/components/tabs) . It adds an animated `Tabs.Indicator`, horizontal and vertical orientations, and a [segmented](#segmented) variant on `Tabs.List`.

Built on [Base UI](https://base-ui.com/react/components/tabs).

## Installation

### tabs.tsx

```tsx
// https://devie-ui.com/components/tabs
// https://base-ui.com/react/components/tabs

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import clsx from "clsx";
import styles from "./Tabs.module.scss";

const Root = BaseTabs.Root;

function List({ className, variant = "underline", ...props }: Tabs.List.Props) {
  return (
    <BaseTabs.List
      className={clsx(
        styles.list,
        variant === "segmented" && styles.listSegmented,
        className,
      )}
      {...props}
    />
  );
}

const tabStyles = styles.tab;

function Tab({ className, ...props }: BaseTabs.Tab.Props) {
  return <BaseTabs.Tab className={clsx(tabStyles, className)} {...props} />;
}

function Indicator({ className, ...props }: BaseTabs.Indicator.Props) {
  return (
    <BaseTabs.Indicator
      className={clsx(styles.indicator, className)}
      {...props}
    />
  );
}

function Panel({ className, ...props }: BaseTabs.Panel.Props) {
  return (
    <BaseTabs.Panel className={clsx(styles.panel, className)} {...props} />
  );
}

const Tabs = {
  Root,
  List,
  Tab,
  Indicator,
  Panel,
};

namespace Tabs {
  export namespace Root {
    export type Props = BaseTabs.Root.Props;
    export type ChangeEventDetails = BaseTabs.Root.ChangeEventDetails;
  }
  export namespace List {
    export type Variant = "underline" | "segmented";
    export interface Props extends BaseTabs.List.Props {
      variant?: Variant;
    }
  }
  export namespace Tab {
    export type Props = BaseTabs.Tab.Props;
    export type State = BaseTabs.Tab.State;
  }
  export namespace Indicator {
    export type Props = BaseTabs.Indicator.Props;
  }
  export namespace Panel {
    export type Props = BaseTabs.Panel.Props;
  }
}

export default Tabs;
```

### tabs.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .panel {
        &[data-hidden] {
            display: none;
            padding: 0;
        }
    }

    .list {
        display: flex;
        position: relative;
        z-index: 0;
        padding-inline: $devie__spacing__x1;
        gap: $devie__spacing__x1;
        border-bottom: 1px solid $devie__color__line;

        &[data-orientation="vertical"] {
            flex-direction: column;
            padding-block: $devie__spacing__x1;
            border-bottom: none;
            border-right: 1px solid $devie__color__line;
        }
    }

    .tab {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: $devie__spacing__x1;
        border: 0;
        margin: 0;
        outline: 0;
        background: none;
        appearance: none;
        user-select: none;
        padding: $devie__spacing__x2;
        font-family: inherit;
        font-size: $devie__font-size__normal;
        line-height: $devie__spacing__x2;
        color: $devie__color__text;
        border-radius: $devie__radius;

        &[data-active] {
            color: $devie__color__primary;
            font-weight: 600;
        }

        @media (hover: hover) {
            &:hover:not([data-active]) {
                color: $devie__color__primary;
            }
        }

        &:focus-visible {
            position: relative;

            &::before {
                content: "";
                position: absolute;
                inset: $devie__spacing__x1 0;
                border-radius: $devie__radius;
                @include devie-focus-ring(-1px);
            }
        }
    }

    .indicator {
        position: absolute;
        z-index: -1;

        &[data-orientation="horizontal"] {
            left: 0;
            translate: var(--active-tab-left) var(--active-tab-top);
            width: var(--active-tab-width);
            height: var(--active-tab-height);
            box-sizing: border-box;
            border-bottom: 2px solid $devie__color__primary;
            transition: translate 200ms ease-in-out, width 200ms ease-in-out;
        }

        &[data-orientation="vertical"] {
            top: 0;
            right: 0;
            translate: 0 var(--active-tab-top);
            height: var(--active-tab-height);
            width: auto;
            border-right: 2px solid $devie__color__primary;
            transition: translate 200ms ease-in-out, height 200ms ease-in-out;
        }
    }

    .listSegmented {
        display: inline-flex;
        padding: calc($devie__spacing__x05 - 1px);
        gap: $devie__spacing__x05;
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        background: $devie__color__background-sunken;

        &[data-orientation="vertical"] {
            padding: calc($devie__spacing__x05 - 1px);
            border: 1px solid $devie__color__line;
        }

        .tab {
            padding: $devie__spacing__x1 $devie__spacing__x2;
            color: $devie__color__text-sub;
            border-radius: calc($devie__radius - 2px);

            &[data-active] {
                color: $devie__color__text;
                font-weight: 500;
            }

            @media (hover: hover) {
                &:hover:not([data-active]) {
                    color: $devie__color__text;
                }
            }

            &:focus-visible::before {
                inset: 0;
                border-radius: calc($devie__radius - 2px);
            }
        }

        .indicator[data-orientation] {
            top: 0;
            left: 0;
            right: auto;
            translate: var(--active-tab-left) var(--active-tab-top);
            width: var(--active-tab-width);
            height: var(--active-tab-height);
            box-sizing: border-box;
            border: 1px solid $devie__color__line;
            border-radius: calc($devie__radius - 2px);
            background: $devie__color__background;
            box-shadow: 0 1px 2px rgb(9 9 11 / 8%);
            transition: translate 200ms ease-in-out, width 200ms ease-in-out, height 200ms ease-in-out;
        }
    }
}
```

## Use Cases

### Horizontal Tabs

Horizontal tabs with an animated underline indicator. Use `defaultValue` to set the initially selected tab, or use `value` and `onValueChange` for controlled mode.

```tsx
<Tabs.Root defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">
      <LayoutList size={16} />
      Overview
    </Tabs.Tab>
    <Tabs.Tab value="settings">
      <Settings size={16} />
      Settings
    </Tabs.Tab>
    <Tabs.Tab value="account">
      <User size={16} />
      Account
    </Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">Overview content</Tabs.Panel>
  <Tabs.Panel value="settings">Settings content</Tabs.Panel>
  <Tabs.Panel value="account">Account content</Tabs.Panel>
</Tabs.Root>
```

### Vertical Tabs

Set the `orientation` prop on the `Root` to `"vertical"` for a vertical tab layout. The indicator automatically displays as a vertical line on the right.

```tsx
<Tabs.Root defaultValue="overview" orientation="vertical">
  <Tabs.List>
    <Tabs.Tab value="overview">
      <LayoutList size={16} />
      Overview
    </Tabs.Tab>
    <Tabs.Tab value="settings">
      <Settings size={16} />
      Settings
    </Tabs.Tab>
    <Tabs.Tab value="account">
      <User size={16} />
      Account
    </Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">Overview content</Tabs.Panel>
  <Tabs.Panel value="settings">Settings content</Tabs.Panel>
  <Tabs.Panel value="account">Account content</Tabs.Panel>
</Tabs.Root>
```

### Segmented control

Set `variant` to `segmented` on `Tabs.List`. The indicator becomes a raised pill inside a sunken track. Works with both orientations.

```tsx
<Tabs.Root defaultValue="week">
  <Tabs.List variant="segmented" aria-label="Period">
    <Tabs.Tab value="day">Day</Tabs.Tab>
    <Tabs.Tab value="week">Week</Tabs.Tab>
    <Tabs.Tab value="month">Month</Tabs.Tab>
    <Tabs.Tab value="year">Year</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="day">Sales for today</Tabs.Panel>
  <Tabs.Panel value="week">Sales for this week</Tabs.Panel>
  <Tabs.Panel value="month">Sales for this month</Tabs.Panel>
  <Tabs.Panel value="year">Sales for this year</Tabs.Panel>
</Tabs.Root>
```

### Custom Indicator

Override the indicator styles via `className` to create custom designs like a filled background with border and radius.

```tsx
<Tabs.Root defaultValue="editor">
  <Tabs.List>
    <Tabs.Tab value="editor">
      <Edit size={16} />
      Editor
    </Tabs.Tab>
    <Tabs.Tab value="atlas">
      <Orbit size={16} />
      Atlas
    </Tabs.Tab>
    <Tabs.Indicator className="customIndicator" />
  </Tabs.List>
</Tabs.Root>
```

---

*Generated from [devie-ui.com/components/tabs](https://devie-ui.com/components/tabs)*