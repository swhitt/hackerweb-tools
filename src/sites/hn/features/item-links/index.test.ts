import { beforeEach, describe, expect, it, vi } from "vitest";

function createStoryRow(itemId: string): void {
  const table = document.createElement("table");
  const story = document.createElement("tr");
  story.className = "athing";
  story.id = itemId;

  const metadata = document.createElement("tr");
  const subtext = document.createElement("td");
  subtext.className = "subtext";
  metadata.appendChild(subtext);

  table.append(story, metadata);
  document.body.appendChild(table);
}

describe("HackerWeb story links feature", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("reconciles links immediately when its setting changes", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const { initItemLinks } = await import("./index");
    const store = config.getConfigStore();
    createStoryRow("12345");

    initItemLinks();
    expect(document.querySelector(".hn-links-hweb")).not.toBeNull();

    store.set("features", "hwebLinks", false);
    expect(document.querySelector(".hn-links-hweb")).toBeNull();

    store.set("features", "hwebLinks", true);
    expect(document.querySelector(".hn-links-hweb")).not.toBeNull();

    const site = store.get("sites", "hn");
    store.set("sites", "hn", { ...site, enabled: false });
    expect(document.querySelector(".hn-links-hweb")).toBeNull();

    store.set("sites", "hn", { ...site, enabled: true });
    expect(document.querySelector(".hn-links-hweb")).not.toBeNull();
  });
});
