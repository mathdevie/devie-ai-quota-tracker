# <Accordion />

The Accordion component extends the [ Base UI Accordion ](https://base-ui.com/react/components/accordion) with polished default styles and an additional `Accordion.Content` subcomponent for consistent content padding. We also replaced the default chevron icon with the Lucide icon for better visual consistency across the design system.

Built on [Base UI](https://base-ui.com/react/components/accordion).

## Installation

### accordion.tsx

```tsx
// https://devie-ui.com/components/accordion
// https://base-ui.com/react/components/accordion

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./Accordion.module.scss";

function Root({ className, ...props }: BaseAccordion.Root.Props) {
  return (
    <BaseAccordion.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Item({ className, ...props }: BaseAccordion.Item.Props) {
  return (
    <BaseAccordion.Item className={clsx(styles.item, className)} {...props} />
  );
}

function Header({ className, ...props }: BaseAccordion.Header.Props) {
  return (
    <BaseAccordion.Header
      className={clsx(styles.header, className)}
      {...props}
    />
  );
}

function Trigger({
  className,
  children,
  ...props
}: BaseAccordion.Trigger.Props) {
  return (
    <BaseAccordion.Trigger
      className={clsx(styles.trigger, className)}
      {...props}
    >
      {children}
      <ChevronDown className={styles.triggerIcon} />
    </BaseAccordion.Trigger>
  );
}

function Panel({ className, ...props }: BaseAccordion.Panel.Props) {
  return (
    <BaseAccordion.Panel className={clsx(styles.panel, className)} {...props} />
  );
}

function Content({ className, children }: Accordion.Content.Props) {
  return <div className={clsx(styles.content, className)}>{children}</div>;
}

const Accordion = {
  Root,
  Item,
  Header,
  Trigger,
  Panel,
  Content,
};

namespace Accordion {
  export namespace Root {
    export type Props = BaseAccordion.Root.Props;
    export type State = BaseAccordion.Root.State;
  }
  export namespace Item {
    export type Props = BaseAccordion.Item.Props;
    export type State = BaseAccordion.Item.State;
  }
  export namespace Header {
    export type Props = BaseAccordion.Header.Props;
  }
  export namespace Trigger {
    export type Props = BaseAccordion.Trigger.Props;
  }
  export namespace Panel {
    export type Props = BaseAccordion.Panel.Props;
    export type State = BaseAccordion.Panel.State;
  }
  export namespace Content {
    export interface Props {
      className?: string;
      children?: ReactNode;
    }
  }
}

export default Accordion;
```

### accordion.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        border: 1px solid $devie__color__line;
        border-radius: $devie__radius;
        overflow: hidden;
        background: $devie__color__background;
    }

    .item {
        &:not(:last-child) {
            border-bottom: 1px solid $devie__color__line;
        }
    }

    .header {
        margin: 0;
    }

    .trigger {
        box-sizing: border-box;
        position: relative;
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: space-between;
        padding: $devie__spacing__x2 $devie__spacing__x2;
        color: $devie__color__text;
        font-family: $devie__font-family;
        font-size: $devie__font-size__normal;
        background: $devie__color__background;
        border: none;
        outline: none;
        text-align: left;
        cursor: pointer;
        border-radius: 0;
        transition: none;

        .item:first-child & {
            border-top-left-radius: $devie__radius;
            border-top-right-radius: $devie__radius;
        }

        .item:last-child:not([data-open]) & {
            border-bottom-left-radius: $devie__radius;
            border-bottom-right-radius: $devie__radius;
        }

        @media (hover: hover) {
            &:hover {
                color: #{devie-hover-color($devie__color__text)};
                background: #{devie-hover-color($devie__color__background)};
            }
        }

        &[data-disabled] {
            cursor: not-allowed;
            color: #{devie-disabled-color($devie__color__text)};
            background: #{devie-disabled-color($devie__color__background)};
        }

        &:focus-visible {
            outline: 2px solid $devie__color__primary;
            outline-offset: -2px;
            z-index: 1;
        }
    }

    .triggerIcon {
        box-sizing: border-box;
        flex-shrink: 0;
        width: 16px;
        height: 16px;
        transition: transform 200ms ease;
        color: $devie__color__text;

        [data-panel-open]>& {
            transform: rotate(180deg);
        }

        @media (hover: hover) {
            &:hover {
                color: #{devie-hover-color($devie__color__text)};
            }
        }

        .trigger[data-disabled] & {
            color: #{devie-disabled-color($devie__color__text)};
        }
    }

    .panel {
        box-sizing: border-box;
        height: var(--accordion-panel-height);
        overflow: hidden;
        transition: height 200ms ease;

        &[data-starting-style],
        &[data-ending-style] {
            height: 0;
        }
    }

    .content {
        padding: $devie__spacing__x2;
        color: $devie__color__text-sub;
        font-size: $devie__font-size__normal;
        background: $devie__color__background;

        .item:last-child & {
            border-bottom-left-radius: $devie__radius;
            border-bottom-right-radius: $devie__radius;
        }
    }
}
```

## Use Cases

### Simple accordion

A basic accordion with expandable sections. By default, only one section can be open at a time.

```tsx
<Accordion.Root defaultValue={[0]}>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Section 1</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This is the content for section 1.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Section 2</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This is the content for section 2.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Section 3</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This is the content for section 3.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

### Allow multiple sections open

Use the `multiple` prop to allow multiple accordion items to be expanded simultaneously.

```tsx
<Accordion.Root multiple defaultValue={[0, 1]}>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>First section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        Multiple sections can be open at the same time.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Second section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This section also starts open.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Third section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This section starts collapsed.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

### Disabled accordion items

Individual accordion items can be disabled using the `disabled` prop on the `Accordion.Item` component. Disabled items cannot be expanded or collapsed.

```tsx
<Accordion.Root defaultValue={[0]}>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Available section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This section works normally.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item disabled>
    <Accordion.Header>
      <Accordion.Trigger>Disabled section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This content is not accessible.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>Another available section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <Accordion.Content>
        This section also works normally.
      </Accordion.Content>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

---

*Generated from [devie-ui.com/components/accordion](https://devie-ui.com/components/accordion)*