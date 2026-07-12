import { beforeEach, describe, expect, it, vi } from "vitest";

describe("HackerWeb readability", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("applies scoped comment readability independently of collapse", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    store.set("features", "collapse", false);
    const { initReadability } = await import("./index");

    initReadability();

    expect(
      document.documentElement.classList.contains("hwt-hackerweb-readable")
    ).toBe(true);
    expect(document.querySelector("#hwt-hackerweb-readability")).not.toBeNull();
    expect(
      document.documentElement.style.getPropertyValue("--hwt-max-width")
    ).toBe("900px");
  });

  it("updates display variables without reinitializing", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    const { initReadability } = await import("./index");

    initReadability();
    store.set("display", "fontSize", 18);
    store.set("display", "commentLineHeight", 1.8);

    expect(
      document.documentElement.style.getPropertyValue("--hwt-font-size")
    ).toBe("18px");
    expect(
      document.documentElement.style.getPropertyValue("--hwt-line-height")
    ).toBe("1.8");
  });

  it("follows the HackerWeb site toggle", async () => {
    const config = await import("../../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    const { initReadability } = await import("./index");

    initReadability();
    const site = store.get("sites", "hackerweb");
    store.set("sites", "hackerweb", { ...site, enabled: false });
    expect(
      document.documentElement.classList.contains("hwt-hackerweb-readable")
    ).toBe(false);

    store.set("sites", "hackerweb", { ...site, enabled: true });
    expect(
      document.documentElement.classList.contains("hwt-hackerweb-readable")
    ).toBe(true);
  });
});
