import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  type CommentId,
  asCommentId,
  getCollapsedState,
  setCollapsedState,
  clearCollapsedState,
  resetCache,
} from "./state";

// Helper to create valid CommentIds for tests
function commentId(id: string): CommentId {
  const result = asCommentId(id);
  if (!result) throw new Error(`Invalid test CommentId: ${id}`);
  return result;
}

describe("asCommentId", () => {
  it("returns CommentId for valid numeric strings", () => {
    expect(asCommentId("12345")).toBe("12345");
    expect(asCommentId("1")).toBe("1");
    expect(asCommentId("999999999")).toBe("999999999");
  });

  it("returns null for non-numeric strings", () => {
    expect(asCommentId("comment-1")).toBeNull();
    expect(asCommentId("abc")).toBeNull();
    expect(asCommentId("12.34")).toBeNull();
    expect(asCommentId("")).toBeNull();
  });

  it("returns null for null/undefined", () => {
    expect(asCommentId(null)).toBeNull();
    expect(asCommentId(undefined)).toBeNull();
  });
});

describe("collapse state", () => {
  beforeEach(() => {
    clearCollapsedState();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns false for unknown comment", () => {
    expect(getCollapsedState(commentId("99999"))).toBe(false);
  });

  it("persists collapsed state", () => {
    setCollapsedState(commentId("12345"), true);
    expect(getCollapsedState(commentId("12345"))).toBe(true);
  });

  it("removes state when expanded", () => {
    setCollapsedState(commentId("12345"), true);
    setCollapsedState(commentId("12345"), false);
    expect(getCollapsedState(commentId("12345"))).toBe(false);
  });

  it("persists to localStorage", () => {
    setCollapsedState(commentId("12345"), true);

    const stored = localStorage.getItem("hwt:state:collapse");
    expect(stored).toBeDefined();
    expect(JSON.parse(stored ?? "[]")).toContain("12345");
  });

  it("handles localStorage errors gracefully", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });

    // Should not throw
    expect(() => setCollapsedState(commentId("12345"), true)).not.toThrow();
  });

  it("filters invalid data from localStorage", () => {
    // Simulate corrupted localStorage with non-numeric IDs
    localStorage.setItem("hwt:state:collapse", '["12345", "invalid", "67890"]');
    resetCache(); // Reset cache to force reload from localStorage

    // Valid IDs should be loaded
    expect(getCollapsedState(commentId("12345"))).toBe(true);
    expect(getCollapsedState(commentId("67890"))).toBe(true);
  });

  it("handles malformed JSON in localStorage", () => {
    localStorage.setItem("hwt:state:collapse", "not valid json");
    resetCache(); // Reset cache to force reload from localStorage

    // Should not throw and return false
    expect(getCollapsedState(commentId("12345"))).toBe(false);
  });

  it("handles non-array JSON in localStorage", () => {
    localStorage.setItem("hwt:state:collapse", '{"key": "value"}');
    resetCache(); // Reset cache to force reload from localStorage

    // Should treat as empty and return false
    expect(getCollapsedState(commentId("12345"))).toBe(false);
  });
});
