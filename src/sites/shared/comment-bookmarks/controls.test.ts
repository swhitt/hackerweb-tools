import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Saved page controls", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.body.innerHTML = "";
    Reflect.deleteProperty(globalThis, "GM_getValue");
    Reflect.deleteProperty(globalThis, "GM_setValue");
  });

  it("adds accessible HN story and comment controls and persists toggles", async () => {
    document.body.innerHTML = `
      <table><tbody>
        <tr class="athing" id="123"><td class="titleline"><a href="https://example.com/post">Story</a></td></tr>
        <tr><td class="subtext">10 points by <a class="hnuser">alice</a></td></tr>
      </tbody></table>
      <table class="fatitem"><tr><td class="titleline"><a>Story</a></td></tr></table>
      <table><tbody><tr class="comtr"><td>
        <span class="comhead"><a class="hnuser">bob</a><a href="item?id=456">now</a></span>
        <div class="commtext">Comment text</div>
      </td></tr></tbody></table>`;

    const store = await import("./store");
    store.resetSavedStoreForTests();
    const controls = await import("./controls");
    controls.addSavedButtons("hn");
    controls.addSavedButtons("hn");
    const cleanup = controls.setupSavedHandler("hn");

    const storyButton =
      document.querySelector<HTMLButtonElement>(".hwt-save-story");
    const commentButton =
      document.querySelector<HTMLButtonElement>(".hwt-save-comment");
    expect(storyButton?.tagName).toBe("BUTTON");
    expect(storyButton?.getAttribute("aria-pressed")).toBe("false");
    expect(commentButton?.getAttribute("aria-label")).toBe("Save comment");
    expect(document.querySelectorAll(".hwt-save-story")).toHaveLength(1);
    expect(document.querySelectorAll(".hwt-save-comment")).toHaveLength(1);

    storyButton?.click();
    expect(store.hasSavedItem("hn:123")).toBe(true);
    expect(storyButton?.getAttribute("aria-pressed")).toBe("true");
    expect(store.getSavedItems()[0]?.text).not.toContain("☆");

    storyButton?.click();
    expect(store.hasSavedItem("hn:123")).toBe(false);
    cleanup();
  });
});
