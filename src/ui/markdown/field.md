# <Field />

A component that provides labeling and validation for form controls. The Field component extends [ Base UI's Field ](https://base-ui.com/react/components/field) . It adds a label, a description, and an error message around any input: an [Input](/components/input) by default, or [Checkbox](/components/checkbox), [Radio](/components/radio), [Switch](/components/switch), [Select](/components/select), and more. Use it inside a [Form](/components/form) to validate several fields together.

Built on [Base UI](https://base-ui.com/react/components/field).

## Installation

### field.tsx

```tsx
// https://devie-ui.com/components/field
// https://base-ui.com/react/components/field

import { Field as BaseField } from "@base-ui/react/field";
import clsx from "clsx";
import styles from "./Field.module.scss";
import Input from "./Input";

function Root({ className, ...props }: BaseField.Root.Props) {
  return <BaseField.Root className={clsx(styles.root, className)} {...props} />;
}

function Label({ className, ...props }: BaseField.Label.Props) {
  return (
    <BaseField.Label className={clsx(styles.label, className)} {...props} />
  );
}

function Control(props: BaseField.Control.Props) {
  return <Input {...props} />;
}

function Description({ className, ...props }: BaseField.Description.Props) {
  return (
    <BaseField.Description
      className={clsx(styles.description, className)}
      {...props}
    />
  );
}

function Item({ className, ...props }: BaseField.Item.Props) {
  return <BaseField.Item className={clsx(styles.item, className)} {...props} />;
}

function ErrorField({ className, ...props }: BaseField.Error.Props) {
  return (
    <BaseField.Error className={clsx(styles.error, className)} {...props} />
  );
}

const Field = {
  Root,
  Label,
  Control,
  Description,
  Item,
  Error: ErrorField,
  Validity: BaseField.Validity,
};

namespace Field {
  export namespace Root {
    export type Props = BaseField.Root.Props;
    export type State = BaseField.Root.State;
  }
  export namespace Label {
    export type Props = BaseField.Label.Props;
  }
  export namespace Control {
    export type Props = BaseField.Control.Props;
  }
  export namespace Description {
    export type Props = BaseField.Description.Props;
  }
  export namespace Item {
    export type Props = BaseField.Item.Props;
  }
  export namespace Error {
    export type Props = BaseField.Error.Props;
  }
  export namespace Validity {
    export type Props = BaseField.Validity.Props;
    export type State = BaseField.Validity.State;
  }
}

export default Field;
```

### field.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .root {
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x1;
    }

    .label {
        line-height: $devie__spacing__x3;

        &[data-invalid] {
            color: $devie__color__danger;
        }
    }

    .description {
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x3;
        color: $devie__color__text-sub;
    }

    .item {
        display: flex;
        align-items: center;
        gap: $devie__spacing__x1;

        &[data-disabled] {
            cursor: not-allowed;
        }
    }

    .error {
        font-size: $devie__font-size__small;
        line-height: $devie__spacing__x3;
        display: flex;
        align-items: center;
        gap: $devie__spacing__x05;
        color: $devie__color__danger;
    }
}
```

## Use Cases

### Simple fields

Compose `Field.Label`, `Field.Control`, `Field.Description`, and `Field.Error` inside `Field.Root`. `Field.Control` renders an [Input](/components/input), and the label is associated with it automatically.

```tsx
<Field.Root>
  <Field.Control placeholder="Placeholder" />
</Field.Root>

<Field.Root>
  <Field.Label>Label</Field.Label>
  <Field.Control placeholder="Placeholder" />
</Field.Root>

<Field.Root>
  <Field.Label>Label</Field.Label>
  <Field.Control placeholder="Placeholder" />
  <Field.Description>Description text</Field.Description>
</Field.Root>

<Field.Root invalid>
  <Field.Label>Label</Field.Label>
  <Field.Control placeholder="Placeholder" />
  <Field.Error match>Error message</Field.Error>
</Field.Root>
```

### Native HTML validation

Set `required`, `minLength`, `pattern`, or `type` on the control. Use `Field.Error` with the `match` prop to show a message for a [ ValidityState ](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) key.

```tsx
<form onSubmit={(event) => event.preventDefault()}>
  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Control type="email" required placeholder="you@example.com" />
    <Field.Error match="valueMissing">Email is required</Field.Error>
    <Field.Error match="typeMismatch">
      Enter a valid email address
    </Field.Error>
  </Field.Root>

  <Field.Root>
    <Field.Label>Username</Field.Label>
    <Field.Control
      required
      minLength={3}
      pattern="^[a-zA-Z0-9_]+$"
      placeholder="At least 3 characters"
    />
    <Field.Error match="valueMissing">Username is required</Field.Error>
    <Field.Error match="tooShort">
      Must be at least 3 characters
    </Field.Error>
    <Field.Error match="patternMismatch">
      Only letters, numbers, and underscores
    </Field.Error>
  </Field.Root>

  <Button type="submit">Trigger HTML Validation</Button>
</form>
```

### Custom validation

Pass a `validate` function to `Field.Root`. Return an error string, an array of strings, or `null`. Set `validationMode` to `onBlur` or `onChange` to validate before submit; see the [ Base UI reference ](https://base-ui.com/react/components/field#root) for the details.

### Non-text inputs

Wrap [Select](/components/select), [Combobox](/components/combobox), [Autocomplete](/components/autocomplete), [Slider](/components/slider), [NumberField](/components/number-field), [Radio](/components/radio), [CheckboxGroup](/components/checkbox-group), [Checkbox](/components/checkbox), or [Switch](/components/switch) in `Field.Root` to share the same layout and validation.

```tsx
const COUNTRIES = [
  "Canada",
  "France",
  "Germany",
  "Japan",
  "Norway",
  "United Kingdom",
  "United States",
];

const LANGUAGES = ["English", "French", "German", "Japanese", "Norwegian"];

const TIMEZONES = [
  { label: "UTC-08:00", value: "utc-8" },
  { label: "UTC-05:00", value: "utc-5" },
  { label: "UTC+01:00", value: "utc+1" },
];

<Field.Root name="country">
  <Field.Label>Country (Autocomplete)</Field.Label>
  <Autocomplete.Root defaultValue="Canada" items={COUNTRIES}>
    <Autocomplete.Input placeholder="Search countries..." />
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(item) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  </Autocomplete.Root>
  <Field.Description>
    Searchable list of countries with typeahead.
  </Field.Description>
</Field.Root>

<Field.Root name="language">
  <Field.Label>Interface language (Combobox)</Field.Label>
  <Combobox.Root items={LANGUAGES}>
    {/* Use position: relative on wrapper and position: absolute on trigger */}
    <div className={styles.inputWrapper}>
      <Combobox.Input placeholder="Search languages..." />
      <Combobox.Trigger aria-label="Open list" className={styles.triggerButton}>
        <Combobox.Icon />
      </Combobox.Trigger>
    </div>
    <Combobox.Portal>
      <Combobox.Positioner sideOffset={4}>
        <Combobox.Popup>
          <Combobox.Empty>No languages found</Combobox.Empty>
          <Combobox.List>
            {(item) => (
              <Combobox.Item key={item} value={item}>
                {item}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Portal>
  </Combobox.Root>
  <Field.Description>Used to localize UI labels.</Field.Description>
</Field.Root>

<Field.Root name="timezone">
  <Field.Label>Timezone (Select)</Field.Label>
  <Select.Root defaultValue="utc-5">
    <Select.Trigger style={{ width: "100%" }}>
      <Select.Value placeholder="Select a timezone" />
      <Select.Icon />
    </Select.Trigger>
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup>
          {TIMEZONES.map((timezone) => (
            <Select.Item key={timezone.value} value={timezone.value}>
              <Select.ItemText>{timezone.label}</Select.ItemText>
              <Select.ItemIndicator />
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>
  <Field.Description>Used to format local times.</Field.Description>
</Field.Root>

<Field.Root name="team-size">
  <Field.Label>Team size (NumberField)</Field.Label>
  <NumberField.Root defaultValue={5} min={1} max={50}>
    <NumberField.Group>
      <NumberField.Decrement />
      <NumberField.Input />
      <NumberField.Increment />
    </NumberField.Group>
  </NumberField.Root>
  <Field.Description>How many people are in your team.</Field.Description>
</Field.Root>

<Field.Root name="volume">
  <Field.Label>Notification volume (Slider)</Field.Label>
  <Slider.Root defaultValue={40}>
    <Slider.Value />
    <Slider.Control>
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
  <Field.Description>Reduce alert noise during focus time.</Field.Description>
</Field.Root>

<Field.Root name="plan">
  <Field.Label>Subscription plan (Radio)</Field.Label>
  <RadioGroup defaultValue="pro" aria-label="Subscription plan">
    <label className={styles.radioLabel}>
      <Radio.Root value="free">
        <Radio.Indicator />
      </Radio.Root>
      Free
    </label>
    <label className={styles.radioLabel}>
      <Radio.Root value="pro">
        <Radio.Indicator />
      </Radio.Root>
      Pro
    </label>
    <label className={styles.radioLabel}>
      <Radio.Root value="enterprise">
        <Radio.Indicator />
      </Radio.Root>
      Enterprise
    </label>
  </RadioGroup>
  <Field.Description>Choose your billing tier.</Field.Description>
</Field.Root>

<Field.Root name="notifications">
  <Field.Label>Notifications (CheckboxGroup)</Field.Label>
  <CheckboxGroup.Root defaultValue={["email"]}>
    <label className={styles.checkboxLabel}>
      <Checkbox.Root name="notifications" value="email">
        <Checkbox.Indicator />
      </Checkbox.Root>
      Email
    </label>
    <label className={styles.checkboxLabel}>
      <Checkbox.Root name="notifications" value="sms">
        <Checkbox.Indicator />
      </Checkbox.Root>
      SMS
    </label>
    <label className={styles.checkboxLabel}>
      <Checkbox.Root name="notifications" value="push">
        <Checkbox.Indicator />
      </Checkbox.Root>
      Push
    </label>
  </CheckboxGroup.Root>
  <Field.Description>Select how you want to be notified.</Field.Description>
</Field.Root>

<Field.Root name="terms">
  <label className={styles.checkboxLabel}>
    <Checkbox.Root name="terms" defaultChecked>
      <Checkbox.Indicator />
    </Checkbox.Root>
    I agree to the terms (Checkbox)
  </label>
  <Field.Description>Required to proceed with account creation.</Field.Description>
</Field.Root>

<Field.Root name="marketing">
  <label className={styles.switchLabel}>
    <Switch.Root name="marketing" defaultChecked>
      <Switch.Thumb />
    </Switch.Root>
    Enable marketing emails (Switch)
  </label>
  <Field.Description>Receive occasional product updates and offers.</Field.Description>
</Field.Root>
```

### Server-side validation

Use the [Form](/components/form) component to validate several fields together and to display server errors with its `errors` prop.

### Additional Examples

#### Validation Onblur

```tsx
function validateEmail(value: unknown) {
  const email = String(value).trim();
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
  return null;
}

<Field.Root validate={validateEmail} validationMode="onBlur">
  <Field.Label>Email</Field.Label>
  <Field.Control placeholder="you@example.com" />
  <Field.Error match="customError">
    <Field.Validity>{(v) => v.errors[0]}</Field.Validity>
  </Field.Error>
</Field.Root>
```

#### Validation Onchange

```tsx
function validateUsername(value: unknown) {
  const username = String(value).trim();
  if (!username) return null;
  if (username.length < 3) return "Must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers, and underscores";
  return null;
}

<Field.Root
  validate={validateUsername}
  validationMode="onChange"
  validationDebounceTime={200}
>
  <Field.Label>Username</Field.Label>
  <Field.Control placeholder="min 3 chars, alphanumeric" />
  <Field.Error match="customError">
    <Field.Validity>{(v) => v.errors[0]}</Field.Validity>
  </Field.Error>
</Field.Root>
```

#### Validation Onsubmit

```tsx
function validateAddress(value: unknown) {
  const address = String(value).trim();
  if (!address) return "Address is required";
  if (address.length < 10) return "Address must be at least 10 characters";
  return null;
}

<Form onFormSubmit={() => {}}>
  <Field.Root validate={validateAddress} validationMode="onSubmit">
    <Field.Label>Address</Field.Label>
    <Field.Control placeholder="min 10 characters" />
    <Field.Error match="customError">
      <Field.Validity>{(v) => v.errors[0]}</Field.Validity>
    </Field.Error>
  </Field.Root>
  <Button type="submit">Submit</Button>
</Form>
```

---

*Generated from [devie-ui.com/components/field](https://devie-ui.com/components/field)*