import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCollapsedState,
  setCollapsedState,
  clearCollapsedState,
} from "./state";

describe("collapse state", () => {
  beforeEach(() => {
    clearCollapsedState();
    localStorage.clear();
  });

  it("returns false for unknown comment", () => {
    expect(getCollapsedState("unknown-id")).toBe(false);
  });

  it("persists collapsed state", () => {
    setCollapsedState("comment-1", true);
    expect(getCollapsedState("comment-1")).toBe(true);
  });

  it("removes state when expanded", () => {
    setCollapsedState("comment-1", true);
    setCollapsedState("comment-1", false);
    expect(getCollapsedState("comment-1")).toBe(false);
  });

  it("persists to localStorage", () => {
    setCollapsedState("comment-1", true);

    const stored = localStorage.getItem("hwc-collapsed");
    expect(stored).toBeDefined();
    expect(JSON.parse(stored ?? "[]")).toContain("comment-1");
  });

  it("handles localStorage errors gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });

    // Should not throw
    expect(() => setCollapsedState("comment-1", true)).not.toThrow();
  });
});
