import { beforeEach, describe, expect, it, vi } from "vitest";

describe("shared theme controller", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.className = "";
    document.head.innerHTML = "";
  });

  it("follows system changes when System is selected", async () => {
    const listeners: ((event: MediaQueryListEvent) => void)[] = [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addEventListener: (
          _type: string,
          callback: (event: MediaQueryListEvent) => void
        ) => {
          listeners.push(callback);
        },
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
    const config = await import("../../../config");
    config.resetConfigStore();
    config.getConfigStore().set("display", "themeMode", "system");
    const { initDarkMode } = await import("./index");

    initDarkMode("hn");
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(false);

    listeners[0]?.({ matches: true } as MediaQueryListEvent);
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(true);
  });

  it("uses dark as the remembered default", async () => {
    const config = await import("../../../config");
    config.resetConfigStore();
    const { initDarkMode } = await import("./index");

    initDarkMode("hn");

    expect(document.documentElement.classList.contains("hwt-dark")).toBe(true);
    expect(document.querySelector("#hwt-dark-mode-hn")).not.toBeNull();
  });

  it("applies and remembers an explicit light override", async () => {
    const config = await import("../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    store.set("display", "themeMode", "light");
    const { initDarkMode } = await import("./index");

    initDarkMode("hackerweb");
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(false);

    store.set("display", "themeMode", "dark");
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(true);
  });

  it("removes the theme when the current site is disabled", async () => {
    const config = await import("../../../config");
    config.resetConfigStore();
    const store = config.getConfigStore();
    const { initDarkMode } = await import("./index");
    initDarkMode("hn");

    const site = store.get("sites", "hn");
    store.set("sites", "hn", { ...site, enabled: false });
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(false);

    store.set("sites", "hn", { ...site, enabled: true });
    expect(document.documentElement.classList.contains("hwt-dark")).toBe(true);
  });
});
