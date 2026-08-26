# <Avatar />

The Avatar component extends [ Base UI's Avatar ](https://base-ui.com/react/components/avatar) . It's a simple component displaying an image, and a fallback to text if the image is not present. We use the new squircle shape property to have something a bit more original.

Built on [Base UI](https://base-ui.com/react/components/avatar).

## Installation

### avatar.tsx

```tsx
// https://devie-ui.com/components/avatar
// https://base-ui.com/react/components/avatar

import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import clsx from "clsx";
import styles from "./Avatar.module.scss";

function Root({ className, ...props }: BaseAvatar.Root.Props) {
  return (
    <BaseAvatar.Root className={clsx(styles.root, className)} {...props} />
  );
}

function Image({ className, ...props }: BaseAvatar.Image.Props) {
  return (
    <BaseAvatar.Image className={clsx(styles.image, className)} {...props} />
  );
}

function Fallback({ className, ...props }: BaseAvatar.Fallback.Props) {
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
    export type Props = BaseAvatar.Root.Props;
  }
  export namespace Image {
    export type Props = BaseAvatar.Image.Props;
  }
  export namespace Fallback {
    export type Props = BaseAvatar.Fallback.Props;
  }
}

export default Avatar;
```

### avatar.module.scss

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
        text-transform: uppercase;
    }
}
```

## Use Cases

### Simple avatar with image

The basic usage shows an avatar with an image. The `Avatar.Image` component handles loading the image, while `Avatar.Fallback` is displayed while the image loads or if it fails.

```tsx
<Avatar.Root>
  <Avatar.Image
    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    alt="John Doe"
  />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar.Root>
```

### Avatar with fallback

When the image fails to load or isn't provided, the fallback content is displayed. This is typically used to show user initials.

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

The default avatar size is 48×48px. You can customize the size by passing inline styles or a custom className to the `Avatar.Root` component. The fallback text automatically scales thanks to CSS container queries.

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