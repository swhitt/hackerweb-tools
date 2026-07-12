import { beforeEach, describe, expect, it, vi } from "vitest";

describe("HN comfort mode", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.className = "";
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("applies the readable layout by default", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const { initComfortMode } = await import("./index");

    initComfortMode();

    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      true
    );
    expect(document.querySelector("#hwt-comfort-mode")).not.toBeNull();
  });

  it("respects an existing opt-out and reconciles setting changes", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    store.set("features", "comfortMode", false);
    const { initComfortMode } = await import("./index");

    initComfortMode();
    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      false
    );

    store.set("features", "comfortMode", true);
    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      true
    );

    store.set("features", "comfortMode", false);
    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      false
    );
  });

  it("turns off when Hacker News enhancements are disabled", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    const { initComfortMode } = await import("./index");

    initComfortMode();
    const site = store.get("sites", "hn");
    store.set("sites", "hn", { ...site, enabled: false });

    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      false
    );

    store.set("sites", "hn", { ...site, enabled: true });
    expect(document.documentElement.classList.contains("hwt-comfort")).toBe(
      true
    );
  });
});
