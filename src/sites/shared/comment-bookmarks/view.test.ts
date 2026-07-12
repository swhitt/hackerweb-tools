import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedItem } from "./store";

function saved(
  id: string,
  title: string,
  kind: SavedItem["kind"],
  savedAt: number
): SavedItem {
  return {
    key: `hn:${id}`,
    id,
    kind,
    url: `https://news.ycombinator.com/item?id=${id}`,
    title,
    text: `${title} preview`,
    author: "alice",
    source: "hn",
    savedAt,
  };
}

describe("Saved drawer view", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.body.innerHTML = "";
    Reflect.deleteProperty(globalThis, "GM_getValue");
    Reflect.deleteProperty(globalThis, "GM_setValue");
  });

  it("sorts, filters, and removes persisted stories and comments", async () => {
    const store = await import("./store");
    store.resetSavedStoreForTests();
    store.saveItem(saved("1", "Zulu", "story", 1));
    store.saveItem(saved("2", "Alpha", "comment", 2));
    const { createSavedView } = await import("./view");
    const view = createSavedView();
    document.body.appendChild(view);

    const titles = () =>
      Array.from(view.querySelectorAll(".hwt-saved-item-title")).map(
        (element) => element.textContent
      );
    expect(titles()).toEqual(["Alpha", "Zulu"]);

    const sort = view.querySelector<HTMLSelectElement>(".hwt-saved-sort");
    expect(sort).not.toBeNull();
    if (!sort) return;
    sort.value = "title";
    sort.dispatchEvent(new Event("change"));
    expect(titles()).toEqual(["Alpha", "Zulu"]);

    const filter = view.querySelector<HTMLSelectElement>(".hwt-saved-filter");
    expect(filter).not.toBeNull();
    if (!filter) return;
    filter.value = "story";
    filter.dispatchEvent(new Event("change"));
    expect(titles()).toEqual(["Zulu"]);

    view.querySelector<HTMLButtonElement>(".hwt-saved-remove")?.click();
    expect(store.hasSavedItem("hn:1")).toBe(false);
    expect(view.textContent).toContain("No saved items match these filters");
    expect(view.textContent).toContain("Export JSON");
    expect(view.textContent).toContain("Import JSON");
  });
});
