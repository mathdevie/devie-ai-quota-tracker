# <Form />

A form with consolidated error handling. The Form component extends [ Base UI's Form ](https://base-ui.com/react/components/form) . It validates every [Field](/components/field), [Checkbox](/components/checkbox), and [CheckboxGroup](/components/checkbox-group) before it calls `onFormSubmit`, and it displays server errors with the `errors` prop.

Built on [Base UI](https://base-ui.com/react/components/form).

## Installation

### form.tsx

```tsx
// https://devie-ui.com/components/form
// https://base-ui.com/react/components/form

import { Form as BaseForm } from "@base-ui/react/form";
import clsx from "clsx";
import styles from "./Form.module.scss";

function Form({ className, ...props }: BaseForm.Props) {
  return <BaseForm className={clsx(styles.form, className)} {...props} />;
}

namespace Form {
  export type Props = BaseForm.Props;
  export type State = BaseForm.State;
  export type Values = BaseForm.Values;
  export type SubmitEventDetails = BaseForm.SubmitEventDetails;
}

export default Form;
```

### form.module.scss

```scss
@use './_devie.scss' as *;

@layer devie {
    .form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: $devie__spacing__x2;
    }
}
```

## Use Cases

### Client-side validation

Pass a `validate` function to `Field.Root`. Set `validationMode` to `onBlur` or `onChange` to validate before submit.

```tsx
function validateEmail(value: unknown) {
  const email = String(value).trim();
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address";
  }
  return null;
}

function validatePassword(value: unknown) {
  const password = String(value);
  if (!password) return "Password is required";
  if (password.length < 8) return "Must be at least 8 characters";
  return null;
}

const [isLoading, setIsLoading] = useState(false);

async function handleSubmit(formValues: Form.Values) {
  setIsLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  setIsLoading(false);
}

<Form onFormSubmit={handleSubmit}>
  <Field.Root name="email" validate={validateEmail} validationMode="onBlur">
    <Field.Label>Email</Field.Label>
    <Field.Control type="email" placeholder="you@example.com" />
    <Field.Error match="customError">
      <Field.Validity>{(v) => v.errors[0]}</Field.Validity>
    </Field.Error>
  </Field.Root>

  <Field.Root name="password" validate={validatePassword} validationMode="onBlur">
    <Field.Label>Password</Field.Label>
    <Field.Control type="password" placeholder="At least 8 characters" />
    <Field.Error match="customError">
      <Field.Validity>{(v) => v.errors[0]}</Field.Validity>
    </Field.Error>
  </Field.Root>

  <Field.Root name="remember">
    <Field.Item>
      <Checkbox.Root name="remember" defaultChecked>
        <Checkbox.Indicator />
      </Checkbox.Root>
      <Field.Label>Remember me</Field.Label>
    </Field.Item>
  </Field.Root>

  <Button type="submit" variant="primary" isLoading={isLoading}>
    Sign in
  </Button>
</Form>
```

### Server errors

Pass an object to the `errors` prop on `Form`. Keys are field `name`s, values are messages. `Field.Error` displays server errors together with client errors.

Wrap Select, Combobox, and Autocomplete in a Field. Otherwise the Form cannot validate them. See [non-text inputs](/components/field#non-text-inputs).

```tsx
function validateCode(value: unknown) {
  const code = String(value).trim();
  if (!code) return "Code is required";
  if (!/^\d+$/.test(code)) {
    return "Code must contain only digits";
  }
  return null;
}

type FormErrors = Record<string, string | string[]>;

const [isLoading, setIsLoading] = useState(false);
const [errors, setErrors] = useState<FormErrors>({});

async function handleSubmit(formValues: Form.Values) {
  setIsLoading(true);
  setErrors({});

  const code = formValues.code;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const isValid = false;

  if (!isValid) {
    setErrors({ code: "Invalid code" });
  }

  setIsLoading(false);
}

<Form errors={errors} onFormSubmit={handleSubmit}>
  <Field.Root name="code" validate={validateCode} validationMode="onBlur">
    <Field.Label>One time code</Field.Label>
    <Field.Control onChange={() => setErrors({})} />
    <Field.Error />
  </Field.Root>

  <Button type="submit" variant="primary" isLoading={isLoading}>
    Verify
  </Button>
</Form>
```

### With Zod

Define the [ Zod ](https://zod.dev) schema with custom messages. Call `safeParse`, then `error.flatten()` to build the `errors` object.

```tsx
const ProjectSchema = z.object({
  projectName: z
    .string()
    .transform((name) => name.trim())
    .pipe(
      z
        .string()
        .min(1, "Project name is required")
        .max(30, "Project name cannot exceed 30 characters"),
    ),
});

type FormErrors = Record<string, string | string[]>;

const [errors, setErrors] = useState<FormErrors>({});

async function handleSubmit(formValues: Form.Values) {
  const result = ProjectSchema.safeParse(formValues);

  if (!result.success) {
    setErrors(result.error.flatten().fieldErrors);
    return;
  }

  setErrors({});
}

<Form errors={errors} onFormSubmit={handleSubmit}>
  <Field.Root name="projectName">
    <Field.Label>Project name</Field.Label>
    <Field.Control onChange={() => setErrors({})} />
    <Field.Error />
  </Field.Root>

  <Button type="submit" variant="primary">
    Create project
  </Button>
</Form>
```

### Other form libraries

Base UI also documents [ TanStack Form ](https://base-ui.com/react/handbook/forms#tanstack-form) and [ React Hook Form ](https://base-ui.com/react/handbook/forms#react-hook-form) .

### Additional Examples

#### Simple

```tsx
<Form onSubmit={(event) => event.preventDefault()}>
  <Field.Root>
    <Field.Label>Name</Field.Label>
    <Field.Control placeholder="Enter your name" />
  </Field.Root>
  <Field.Root>
    <Field.Label>Email</Field.Label>
    <Field.Control type="email" placeholder="you@example.com" />
  </Field.Root>
  <Field.Root>
    <Field.Label>Message</Field.Label>
    <Field.Control render={<textarea rows={3} />} placeholder="Your message..." />
  </Field.Root>
  <button type="submit">Send</button>
</Form>
```

---

*Generated from [devie-ui.com/components/form](https://devie-ui.com/components/form)*