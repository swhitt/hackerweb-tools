import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createDebouncedObserver } from "./observer-factory";

describe("observer-factory", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createDebouncedObserver", () => {
    it("returns a MutationObserver instance", () => {
      const callback = vi.fn();
      const observer = createDebouncedObserver(callback);
      expect(observer).toBeInstanceOf(MutationObserver);
      observer.disconnect();
    });

    it("starts observing immediately", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);

      // Add a child to trigger mutation
      target.appendChild(document.createElement("span"));

      // Wait for MutationObserver + RAF to process
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalled();
      observer.disconnect();
    });

    it("uses default options (childList + subtree)", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);

      // Nested mutation should be observed due to subtree: true
      const child = document.createElement("div");
      target.appendChild(child);
      const grandchild = document.createElement("span");
      child.appendChild(grandchild);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalled();
      observer.disconnect();
    });

    it("accepts custom MutationObserver options", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      target.setAttribute("data-test", "initial");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target, {
        attributes: true,
      });

      target.setAttribute("data-test", "changed");

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalled();
      observer.disconnect();
    });
  });

  describe("debouncing behavior", () => {
    it("debounces multiple rapid mutations into single callback", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);

      // Trigger multiple mutations rapidly
      target.appendChild(document.createElement("span"));
      target.appendChild(document.createElement("span"));
      target.appendChild(document.createElement("span"));

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should only be called once despite multiple mutations
      expect(callback).toHaveBeenCalledTimes(1);
      observer.disconnect();
    });

    it("calls callback again after debounce period for new mutations", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);

      // First batch
      target.appendChild(document.createElement("span"));
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalledTimes(1);

      // Second batch after debounce completes
      target.appendChild(document.createElement("span"));
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalledTimes(2);

      observer.disconnect();
    });

    it("uses requestAnimationFrame for debouncing", async () => {
      const rafSpy = vi.spyOn(window, "requestAnimationFrame");
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);

      target.appendChild(document.createElement("span"));

      // Give MutationObserver time to fire
      await new Promise((resolve) => setTimeout(resolve, 10));

      // RAF should be called
      expect(rafSpy).toHaveBeenCalled();

      await new Promise((resolve) => setTimeout(resolve, 50));
      observer.disconnect();
    });
  });

  describe("observer lifecycle", () => {
    it("can be disconnected to stop observing", async () => {
      const callback = vi.fn();
      const target = document.createElement("div");
      document.body.appendChild(target);

      const observer = createDebouncedObserver(callback, target);
      observer.disconnect();

      // Mutations after disconnect should not trigger callback
      target.appendChild(document.createElement("span"));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).not.toHaveBeenCalled();
    });

    it("observes document.body by default", async () => {
      const callback = vi.fn();
      const observer = createDebouncedObserver(callback);

      document.body.appendChild(document.createElement("div"));
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(callback).toHaveBeenCalled();
      observer.disconnect();
    });
  });
});
