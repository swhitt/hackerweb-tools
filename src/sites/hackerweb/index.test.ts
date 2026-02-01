import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/observer-factory", () => ({
  createDebouncedObserver: vi.fn(),
}));

vi.mock("./features/collapse", () => ({
  initCollapse: vi.fn(),
}));

describe("hackerweb site init", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("calls initCollapse on init", async () => {
    const { initCollapse } = await import("./features/collapse");
    const { init } = await import("./index");

    init();

    expect(initCollapse).toHaveBeenCalled();
  });

  it("sets up debounced observer for dynamic content", async () => {
    const { createDebouncedObserver } =
      await import("../../utils/observer-factory");
    const { init } = await import("./index");

    init();

    expect(createDebouncedObserver).toHaveBeenCalled();
  });

  it("re-initializes on hashchange", async () => {
    const { initCollapse } = await import("./features/collapse");
    const { init } = await import("./index");

    init();
    vi.clearAllMocks();

    window.dispatchEvent(new HashChangeEvent("hashchange"));

    expect(initCollapse).toHaveBeenCalled();
  });
});
