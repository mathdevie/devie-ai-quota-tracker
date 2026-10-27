import { describe, expect, test } from "vite-plus/test";
import {
  accountLabel,
  fullName,
  isCreditStatus,
  isUnofficial,
  visibleWindows,
} from "@/features/connections/labels";
import { account, quota } from "./helpers";

describe("account identity", () => {
  test("prefers custom name, display name, provider id, then discovered label", () => {
    const connection = account({
      customLabel: "Work",
      identity: { displayName: "person@example.test", providerUserId: "remote-id" },
    });
    expect(accountLabel(connection)).toBe("Work");
    expect(accountLabel({ ...connection, customLabel: "" })).toBe("person@example.test");
    expect(
      accountLabel({
        ...connection,
        customLabel: undefined,
        identity: { providerUserId: "remote-id" },
      }),
    ).toBe("remote-id");
    expect(accountLabel(account())).toBe("Personal");
    expect(fullName(connection)).toBe("Codex Work");
  });

  test("only the unofficial provider carries the warning", () => {
    expect(isUnofficial("antigravity")).toBe(true);
    for (const provider of ["claude", "codex", "gemini-cli", "copilot", "cursor"] as const) {
      expect(isUnofficial(provider)).toBe(false);
    }
  });
});

test("hidden windows are removed without changing source data or order", () => {
  const connection = account({
    windows: [quota(), quota({ key: "weekly" })],
    hiddenWindows: ["session", "retired"],
  });
  expect(visibleWindows(connection).map((window) => window.key)).toEqual(["weekly"]);
  expect(connection.windows).toHaveLength(2);
  expect(visibleWindows(account({ hiddenWindows: [] }))).toHaveLength(1);
  expect(visibleWindows(account({ hiddenWindows: ["session"] }))).toEqual([]);
});

test.each([
  [quota({ key: "credits", paid: true }), true],
  [quota({ key: "credits", paid: true, usedPercent: 100 }), true],
  [quota({ key: "credits", paid: true, unlimited: true }), false],
  [quota({ key: "credits", paid: true, amount: { total: 0 } }), false],
  [quota({ key: "credits" }), false],
  [quota({ paid: true }), false],
])("recognizes availability-only credits: %j", (window, expected) => {
  expect(isCreditStatus(window)).toBe(expected);
});
