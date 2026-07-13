import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_VERSION, DEFAULT_CONFIG } from "./defaults";
import { getConfigStore, resetConfigStore, STORAGE_KEY } from "./store";
import type { Features, SiteConfig } from "./types";

describe("ConfigStore", () => {
  beforeEach(() => {
    localStorage.clear();
    resetConfigStore();
    vi.restoreAllMocks();
  });

  it("decodes and normalizes stored numeric overrides", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CONFIG_VERSION,
        config: {
          thresholds: { autoCollapseDepth: 200, gutterClickPx: -10 },
          display: { fontSize: 100, commentLineHeight: 0.25 },
        },
      })
    );

    const store = getConfigStore();

    expect(store.get("thresholds", "autoCollapseDepth")).toBe(20);
    expect(store.get("thresholds", "gutterClickPx")).toBe(5);
    expect(store.get("display", "fontSize")).toBe(24);
    expect(store.get("display", "commentLineHeight")).toBe(1);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual({
      version: CONFIG_VERSION,
      config: {
        thresholds: { autoCollapseDepth: 20, gutterClickPx: 5 },
        display: { fontSize: 24, commentLineHeight: 1 },
      },
    });
  });

  it.each([
    {
      label: "an unknown nested key",
      stored: {
        version: CONFIG_VERSION,
        config: { features: { collapse: false, surprise: true } },
      },
    },
    {
      label: "an invalid nested type",
      stored: {
        version: CONFIG_VERSION,
        config: { features: { collapse: "no" } },
      },
    },
    {
      label: "an invalid color",
      stored: {
        version: CONFIG_VERSION,
        config: { display: { newCommentColor: "hotpink" } },
      },
    },
    {
      label: "a future schema version",
      stored: { version: CONFIG_VERSION + 1, config: {} },
    },
  ])("ignores $label without overwriting stored data", ({ stored }) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const raw = JSON.stringify(stored);
    localStorage.setItem(STORAGE_KEY, raw);

    const store = getConfigStore();

    expect(store.get("features", "collapse")).toBe(
      DEFAULT_CONFIG.features.collapse
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
    expect(warn).toHaveBeenCalledWith(
      "[HWT Config]",
      expect.stringContaining("Ignoring invalid stored config")
    );
  });

  it("migrates legacy values before applying current-schema validation", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        config: {
          display: { maxContentWidth: "1200", commentLineHeight: "1.8" },
        },
      })
    );

    const store = getConfigStore();

    expect(store.get("display", "maxContentWidth")).toBe(1200);
    expect(store.get("display", "commentLineHeight")).toBe(1.8);
  });

  it("rejects invalid imports without replacing known-good config", () => {
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const store = getConfigStore();
    store.set("features", "collapse", false);
    const saved = localStorage.getItem(STORAGE_KEY);

    expect(
      store.import(JSON.stringify({ features: { collapse: true, typo: true } }))
    ).toBe(false);
    expect(store.get("features", "collapse")).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
    expect(error).toHaveBeenCalledWith(
      "[HWT Config]",
      expect.stringContaining("config.features.typo is not supported")
    );
  });

  it("accepts sparse imports and clamps their documented numeric ranges", () => {
    const store = getConfigStore();

    expect(
      store.import(
        JSON.stringify({
          thresholds: { highScoreThreshold: 900 },
          sites: { hn: { enabled: false } },
        })
      )
    ).toBe(true);
    expect(store.get("thresholds", "highScoreThreshold")).toBe(500);
    expect(store.get("sites", "hn").enabled).toBe(false);
    expect(store.get("sites", "hackerweb").enabled).toBe(true);
  });

  it("provides distinct old and new section snapshots", () => {
    const store = getConfigStore();
    const updates: [Features, Features][] = [];
    store.subscribeSection("features", (next, previous) => {
      updates.push([next, previous]);
    });

    store.set("features", "collapse", false);

    expect(updates).toHaveLength(1);
    const [next, previous] = updates[0] ?? [];
    expect(previous?.collapse).toBe(true);
    expect(next?.collapse).toBe(false);
    expect(next).not.toBe(previous);
  });

  it("isolates object values and listener snapshots from external mutation", () => {
    const store = getConfigStore();
    const received: SiteConfig[] = [];
    store.subscribe("sites", "hn", (next) => {
      received.push(next);
      next.enabled = true;
    });

    const external = store.get("sites", "hn");
    external.enabled = false;
    expect(store.get("sites", "hn").enabled).toBe(true);

    store.set("sites", "hn", { ...external, enabled: false });

    expect(received).toHaveLength(1);
    expect(store.get("sites", "hn").enabled).toBe(false);
  });

  it("reports old and new snapshots for resetAll and import", () => {
    const store = getConfigStore();
    const updates: [Features, Features][] = [];
    store.subscribeSection("features", (next, previous) => {
      updates.push([next, previous]);
    });
    store.set("features", "collapse", false);
    updates.length = 0;

    store.resetAll();
    expect(updates[0]?.[1].collapse).toBe(false);
    expect(updates[0]?.[0].collapse).toBe(true);

    updates.length = 0;
    expect(store.import('{"features":{"collapse":false}}')).toBe(true);
    expect(updates[0]?.[1].collapse).toBe(true);
    expect(updates[0]?.[0].collapse).toBe(false);
  });
});
