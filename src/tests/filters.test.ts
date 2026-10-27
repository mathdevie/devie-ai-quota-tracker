import { describe, expect, test, vi } from "vite-plus/test";
import { applyFilters, DEFAULT_FILTERS, readFilters, writeFilters } from "@/lib/filters";
import { account, quota } from "./helpers";

describe("quota filtering and sorting", () => {
  test("includes enabled matching accounts, including stale readings, without mutating input", () => {
    const connections = [
      account({ id: "stale", status: "stale" }),
      account({ id: "disabled", enabled: false }),
      account({ id: "other", provider: "claude" }),
      account({ id: "ready" }),
    ];
    const original = structuredClone(connections);
    expect(
      applyFilters(connections, { provider: "codex", sort: "name" }).map(
        (connection) => connection.id,
      ),
    ).toEqual(["stale", "ready"]);
    expect(applyFilters(connections, DEFAULT_FILTERS)).toHaveLength(3);
    expect(connections).toEqual(original);
  });

  test("sorts by soonest visible reset, placing invalid and missing dates last", () => {
    const connections = [
      account({ id: "missing", windows: [quota({ resetsAt: "invalid" })] }),
      account({
        id: "later",
        windows: [
          quota({ resetsAt: "2026-10-28T12:00:00Z" }),
          quota({ key: "hidden", resetsAt: "2026-10-27T00:00:00Z" }),
        ],
        hiddenWindows: ["hidden"],
      }),
      account({
        id: "first",
        windows: [
          quota({ resetsAt: "2026-10-29T12:00:00Z" }),
          quota({ key: "weekly", resetsAt: "2026-10-27T12:00:00Z" }),
        ],
      }),
      account({ id: "empty", windows: [] }),
    ];
    expect(applyFilters(connections, DEFAULT_FILTERS).map((connection) => connection.id)).toEqual([
      "first",
      "later",
      "missing",
      "empty",
    ]);
  });

  test.each([
    ["least-left", ["low", "high", "unavailable"]],
    ["most-left", ["unavailable", "high", "low"]],
  ] as const)("%s ignores hidden, paid, and unlimited allowances", (sort, expected) => {
    const connections = [
      account({
        id: "high",
        windows: [
          quota({ usedPercent: 10 }),
          quota({ key: "paid", paid: true, usedPercent: 100 }),
          quota({ key: "hidden", usedPercent: 100 }),
          quota({ key: "unlimited", unlimited: true, usedPercent: 100 }),
        ],
        hiddenWindows: ["hidden"],
      }),
      account({ id: "unavailable", windows: [quota({ paid: true })] }),
      account({
        id: "low",
        windows: [quota({ usedPercent: 30 }), quota({ key: "weekly", usedPercent: 90 })],
      }),
    ];
    expect(
      applyFilters(connections, { provider: "all", sort }).map((connection) => connection.id),
    ).toEqual(expected);
  });

  test("sorts by provider then the displayed account name", () => {
    const connections = [
      account({ id: "z", customLabel: "Zulu" }),
      account({ id: "a", identity: { displayName: "Alpha" } }),
      account({ id: "claude", provider: "claude" }),
    ];
    expect(
      applyFilters(connections, { provider: "all", sort: "name" }).map(
        (connection) => connection.id,
      ),
    ).toEqual(["claude", "a", "z"]);
  });
});

describe("persisted filters", () => {
  test("uses defaults without storage or a browser", () => {
    expect(readFilters("main")).toEqual(DEFAULT_FILTERS);
    vi.stubGlobal("window", undefined);
    expect(readFilters("popover")).toEqual(DEFAULT_FILTERS);
  });

  test("inherits old main preferences until the popover has its own", () => {
    writeFilters("main", { provider: "codex", sort: "name" });
    expect(readFilters("popover")).toEqual({ provider: "codex", sort: "name" });
    writeFilters("popover", { provider: "claude", sort: "least-left" });
    expect(readFilters("main")).toEqual({ provider: "codex", sort: "name" });
    expect(readFilters("popover")).toEqual({ provider: "claude", sort: "least-left" });
  });

  test.each([
    "{",
    "null",
    "[]",
    '"codex"',
    '{"provider":"removed","sort":"unknown"}',
    '{"provider":null,"sort":4}',
  ])("ignores malformed or unsupported preferences: %s", (saved) => {
    localStorage.setItem("devie-quota-filters:v1", saved);
    expect(readFilters("main")).toEqual(DEFAULT_FILTERS);
  });

  test("preserves valid fields while replacing invalid fields and dropping unknown ones", () => {
    localStorage.setItem(
      "devie-quota-filters:v1",
      '{"provider":"codex","sort":"old-sort","extra":true}',
    );
    expect(readFilters("main")).toEqual({ provider: "codex", sort: "expiring" });
    localStorage.setItem("devie-quota-filters:v1", '{"sort":"name"}');
    expect(readFilters("main")).toEqual({ provider: "all", sort: "name" });
  });

  test("degrades gracefully when storage reads and writes are denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(readFilters("main")).toEqual(DEFAULT_FILTERS);
    expect(() => writeFilters("main", DEFAULT_FILTERS)).not.toThrow();
  });
});
