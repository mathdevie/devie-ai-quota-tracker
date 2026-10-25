# <Avatar />

A component that shows a user image with a text fallback. The Avatar component extends [Base UI's Avatar](https://base-ui.com/react/components/avatar). It adds a squircle shape and fallback text that scales with the avatar size.

Built on [Base UI](https://base-ui.com/react/components/avatar).

## Installation

### Avatar.tsx

```tsx
// https://devie-ui.com/components/avatar
// https://base-ui.com/react/components/avatar

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

function Root({ className, ...props }: Avatar.Root.Props) {
  return (
    <BaseAvatar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Image({ className, ...props }: Avatar.Image.Props) {
  return (
    <BaseAvatar.Image className={clsx(styles.image, className)} {...props} />
  );
}

function Fallback({ className, ...props }: Avatar.Fallback.Props) {
  return (
    <BaseAvatar.Fallback
      className={clsx(styles.fallback, className)}
      {...props}
    />
  );
}

const Avatar = {
  Root,
  Image,
  Fallback,
};

namespace Avatar {
  export namespace Root {
    export type Props = Omit<BaseAvatar.Root.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Image {
    export type Props = Omit<BaseAvatar.Image.Props, "className"> & {
      className?: string;
    };
  }
  export namespace Fallback {
    export type Props = Omit<BaseAvatar.Fallback.Props, "className"> & {
      className?: string;
    };
  }
}

export default Avatar;
```

### Avatar.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        overflow: hidden;
        user-select: none;
        width: 48px;
        height: 48px;
        border-radius: 40%;
        container-type: inline-size;
        corner-shape: squircle;
    }

    .image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: $devie__color__primary;
        color: $devie__color__primary-label;
        font-size: 40cqi;
        font-weight: 600;
        line-height: $devie__spacing__x3;
        text-transform: uppercase;
    }
}
```

## Use Cases

### Simple avatar

Place `Avatar.Image` and `Avatar.Fallback` inside `Avatar.Root`. The fallback shows while the image loads or if it fails.

```tsx
<Avatar.Root>
  <Avatar.Image
    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    alt="John Doe"
  />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

### With fallback

Put the user's initials in `Avatar.Fallback`. It replaces the image when the image fails or `Avatar.Image` is omitted.

```tsx
<Avatar.Root>
  <Avatar.Image
    src="/invalid-image-url.jpg"
    alt="Jane Smith"
  />
  <Avatar.Fallback>JS</Avatar.Fallback>
</Avatar.Root>

<Avatar.Root>
  <Avatar.Fallback>AB</Avatar.Fallback>
</Avatar.Root>
```

### Custom sizes

Set `width` and `height` on `Avatar.Root` with `style` or a `className`. The default is 48px, and the fallback text scales with the avatar.

```tsx
<Avatar.Root style={{ width: 32, height: 32 }}>
  <Avatar.Image src="..." alt="John Doe" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>

<Avatar.Root>
  <Avatar.Image src="..." alt="Sarah Miller" />
  <Avatar.Fallback>SM</Avatar.Fallback>
</Avatar.Root>

<Avatar.Root style={{ width: 64, height: 64 }}>
  <Avatar.Image src="..." alt="Alex Chen" />
  <Avatar.Fallback>AC</Avatar.Fallback>
</Avatar.Root>

<Avatar.Root style={{ width: 96, height: 96 }}>
  <Avatar.Image src="..." alt="Tom Wilson" />
  <Avatar.Fallback>TW</Avatar.Fallback>
</Avatar.Root>
```

---

*Generated from [devie-ui.com/components/avatar](https://devie-ui.com/components/avatar)*