import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the site init modules before importing main
vi.mock("./sites/hackerweb", () => ({
  init: vi.fn(),
}));

vi.mock("./sites/hn", () => ({
  init: vi.fn(),
}));

describe("main", () => {
  let originalHostname: string;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    originalHostname = window.location.hostname;
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: { hostname: originalHostname },
      writable: true,
    });
  });

  it("exposes __HWT__ global with version info", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });

    await import("./main");

    const hwt = window.__HWT__;
    expect(hwt).toBeDefined();
    expect(hwt?.version).toBeDefined();
    expect(hwt?.loaded).toBeDefined();
  });

  it("initializes hackerweb on hackerweb.app", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "hackerweb.app" },
      writable: true,
    });

    await import("./main");
    const { init: initHackerweb } = await import("./sites/hackerweb");

    expect(initHackerweb).toHaveBeenCalled();
  });

  it("initializes HN on news.ycombinator.com", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "news.ycombinator.com" },
      writable: true,
    });

    await import("./main");
    const { init: initHN } = await import("./sites/hn");

    expect(initHN).toHaveBeenCalled();
  });

  it("does not initialize anything on unknown hosts", async () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "example.com" },
      writable: true,
    });

    await import("./main");
    const { init: initHackerweb } = await import("./sites/hackerweb");
    const { init: initHN } = await import("./sites/hn");

    expect(initHackerweb).not.toHaveBeenCalled();
    expect(initHN).not.toHaveBeenCalled();
  });
});

// Extend Window interface for __HWT__
declare global {
  interface Window {
    __HWT__?: {
      version: string;
      loaded: string;
    };
  }
}
