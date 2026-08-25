"use client";

import { Bot, Braces } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import type { Provider } from "@/lib/contracts";
import Button from "@/ui/Button";
import Dialog from "@/ui/Dialog";
import Field from "@/ui/Field";
import Select from "@/ui/Select";
import styles from "./AddProviderDialog.module.scss";

type LoginProvider = Extract<Provider, "claude" | "codex">;

interface AddProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (provider: LoginProvider, profileName: string) => Promise<void>;
}

const providers: Array<{
  value: LoginProvider;
  label: string;
  description: string;
  icon: typeof Bot;
}> = [
  {
    value: "claude",
    label: "Claude",
    description: "Claude Pro or Max",
    icon: Bot,
  },
  {
    value: "codex",
    label: "Codex",
    description: "ChatGPT subscription",
    icon: Braces,
  },
];

function errorMessage(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason);
}

export default function AddProviderDialog({
  open,
  onOpenChange,
  onConnect,
}: AddProviderDialogProps) {
  const [provider, setProvider] = useState<LoginProvider>("claude");
  const [profileName, setProfileName] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) {
      setProvider("claude");
      setProfileName("");
      setConnecting(false);
      setError(undefined);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnecting(true);
    setError(undefined);
    try {
      await onConnect(provider, profileName);
      onOpenChange(false);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Dialog.Root
      disableInteractions={connecting}
      onOpenChange={(nextOpen) => !connecting && onOpenChange(nextOpen)}
      open={open}
      size="sm"
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Header>
            <Dialog.Title>Add subscription</Dialog.Title>
          </Dialog.Header>
          <form onSubmit={handleSubmit}>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>Provider</Field.Label>
                <Select.Root
                  onValueChange={(value) =>
                    value && setProvider(value as LoginProvider)
                  }
                  value={provider}
                >
                  <Select.Trigger>
                    <Select.Value>
                      {providers.find((item) => item.value === provider)?.label}
                    </Select.Value>
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Positioner alignItemWithTrigger={false}>
                      <Select.Popup>
                        <Select.List>
                          {providers.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Select.Item key={item.value} value={item.value}>
                                <Select.ItemText>
                                  <span className={styles.providerOption}>
                                    <Icon aria-hidden size={16} />
                                    <span>
                                      <strong>{item.label}</strong>
                                      <small>{item.description}</small>
                                    </span>
                                  </span>
                                </Select.ItemText>
                                <Select.ItemIndicator />
                              </Select.Item>
                            );
                          })}
                        </Select.List>
                      </Select.Popup>
                    </Select.Positioner>
                  </Select.Portal>
                </Select.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>Profile name</Field.Label>
                <Field.Control
                  autoFocus
                  disabled={connecting}
                  maxLength={48}
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="Work"
                  required
                  value={profileName}
                />
                <Field.Description>
                  Use a different name for each account.
                </Field.Description>
              </Field.Root>

              {connecting && (
                <p className={styles.status}>
                  Complete the login in your browser.
                </p>
              )}
              {error && <p className={styles.error}>{error}</p>}
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                disabled={connecting}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="naked"
              >
                Cancel
              </Button>
              <Button isLoading={connecting} type="submit">
                Connect
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
