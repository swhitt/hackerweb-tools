import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/observer-factory", () => ({
  createDebouncedObserver: vi.fn(),
}));

vi.mock("./features/header-link", () => ({
  initHeaderLink: vi.fn(),
}));

vi.mock("./features/item-links", () => ({
  initItemLinks: vi.fn(),
}));

describe("hn site init", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("calls initHeaderLink on init", async () => {
    const { initHeaderLink } = await import("./features/header-link");
    const { init } = await import("./index");

    init();

    expect(initHeaderLink).toHaveBeenCalled();
  });

  it("calls initItemLinks on init", async () => {
    const { initItemLinks } = await import("./features/item-links");
    const { init } = await import("./index");

    init();

    expect(initItemLinks).toHaveBeenCalled();
  });

  it("sets up debounced observer for dynamic content", async () => {
    const { createDebouncedObserver } =
      await import("../../utils/observer-factory");
    const { init } = await import("./index");

    init();

    expect(createDebouncedObserver).toHaveBeenCalled();
  });
});
