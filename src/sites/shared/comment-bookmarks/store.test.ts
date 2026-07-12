import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedItem } from "./store";

function item(id: string, overrides: Partial<SavedItem> = {}): SavedItem {
  return {
    key: `hn:${id}`,
    id,
    kind: "story",
    url: `https://news.ycombinator.com/item?id=${id}`,
    title: `Story ${id}`,
    text: "Snapshot",
    author: "alice",
    source: "hn",
    savedAt: Number(id),
    ...overrides,
  };
}

describe("Saved store", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    localStorage.clear();
    Reflect.deleteProperty(globalThis, "GM_getValue");
    Reflect.deleteProperty(globalThis, "GM_setValue");
    const store = await import("./store");
    store.resetSavedStoreForTests();
  });

  it("persists one versioned document and survives a cache reset", async () => {
    const store = await import("./store");

    expect(store.saveItem(item("10"))).toBe(true);
    const raw = localStorage.getItem(store.SAVED_STORAGE_KEY);
    expect(JSON.parse(raw ?? "null")).toMatchObject({
      version: 1,
      items: [{ key: "hn:10", title: "Story 10" }],
    });

    store.resetSavedStoreForTests();
    expect(store.getSavedItems()).toHaveLength(1);
  });

  it("does not update memory when the atomic write fails", async () => {
    const store = await import("./store");
    vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });

    expect(store.saveItem(item("10"))).toBe(false);
    expect(store.getSavedItems()).toEqual([]);
  });

  it("upserts by canonical HN id without changing the original save time", async () => {
    const store = await import("./store");
    store.saveItem(item("10", { savedAt: 100, title: "Old" }));
    store.saveItem(
      item("10", {
        kind: "comment",
        source: "hackerweb",
        savedAt: 999,
        title: "Updated",
      })
    );

    expect(store.getSavedItems()).toEqual([
      expect.objectContaining({
        key: "hn:10",
        title: "Updated",
        kind: "comment",
        savedAt: 100,
      }),
    ]);
  });

  it("sorts deterministically", async () => {
    const store = await import("./store");
    store.saveItem(item("1", { title: "Zulu", savedAt: 1 }));
    store.saveItem(item("2", { title: "Alpha", savedAt: 2 }));

    expect(store.getSavedItems("newest").map(({ id }) => id)).toEqual([
      "2",
      "1",
    ]);
    expect(store.getSavedItems("oldest").map(({ id }) => id)).toEqual([
      "1",
      "2",
    ]);
    expect(store.getSavedItems("title").map(({ id }) => id)).toEqual([
      "2",
      "1",
    ]);
  });

  it("round-trips validated JSON with merge and replace modes", async () => {
    const store = await import("./store");
    store.saveItem(item("1"));
    const exported = store.exportSavedItems();
    store.removeSavedItem("hn:1");

    expect(store.importSavedItems(exported)).toBe(true);
    expect(store.hasSavedItem("hn:1")).toBe(true);
    expect(store.importSavedItems('{"version":1,"items":[{}]}')).toBe(false);
    expect(store.importSavedItems('{"version":1,"items":[]}', "replace")).toBe(
      true
    );
    expect(store.getSavedItems()).toEqual([]);
  });

  it("migrates the legacy id and rich-data keys", async () => {
    localStorage.setItem("hwt:state:bookmarks", '["42"]');
    localStorage.setItem(
      "hwt:state:bookmarkData",
      JSON.stringify({
        "42": {
          id: "42",
          url: "https://news.ycombinator.com/item?id=42",
          title: "Legacy",
          text: "Saved before v1",
          author: "bob",
          timestamp: 123,
        },
      })
    );
    const store = await import("./store");
    store.resetSavedStoreForTests();

    expect(store.getSavedItems()).toEqual([
      expect.objectContaining({ key: "hn:42", title: "Legacy", savedAt: 123 }),
    ]);
  });

  it("uses userscript storage when available for one cross-origin library", async () => {
    let shared: unknown = null;
    Object.assign(globalThis, {
      GM_getValue: (_key: string, fallback: unknown) => shared ?? fallback,
      GM_setValue: (_key: string, value: unknown) => {
        shared = value;
      },
    });
    const store = await import("./store");
    store.resetSavedStoreForTests();

    expect(store.saveItem(item("99"))).toBe(true);
    expect(shared).toContain('"key":"hn:99"');
    expect(localStorage.getItem(store.SAVED_STORAGE_KEY)).toBeNull();
  });
});
