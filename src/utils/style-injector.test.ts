import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createStyleInjector } from "./style-injector";

describe("style-injector", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    // Ensure GM_addStyle is not defined by default
    vi.stubGlobal("GM_addStyle", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("createStyleInjector", () => {
    it("returns a function", () => {
      const injector = createStyleInjector("test-style");
      expect(typeof injector).toBe("function");
    });

    it("creates style element with correct ID", () => {
      const injector = createStyleInjector("my-style-id");
      injector(".foo { color: red; }");

      const style = document.getElementById("my-style-id");
      expect(style).toBeInstanceOf(HTMLStyleElement);
    });

    it("creates style element with correct content", () => {
      const injector = createStyleInjector("test-style");
      const css = ".bar { background: blue; }";
      injector(css);

      const style = document.getElementById("test-style") as HTMLStyleElement;
      expect(style.textContent).toBe(css);
    });

    it("appends style to document head", () => {
      const injector = createStyleInjector("head-style");
      injector(".baz { margin: 0; }");

      expect(document.head.children.length).toBe(1);
      expect(document.head.firstChild).toBe(
        document.getElementById("head-style")
      );
    });
  });

  describe("idempotent injection", () => {
    it("only injects once even when called multiple times", () => {
      const injector = createStyleInjector("single-style");

      injector(".first { color: red; }");
      injector(".second { color: blue; }");
      injector(".third { color: green; }");

      const styles = document.querySelectorAll("style");
      expect(styles.length).toBe(1);
    });

    it("keeps original CSS content on subsequent calls", () => {
      const injector = createStyleInjector("persistent-style");

      injector(".original { color: red; }");
      injector(".replacement { color: blue; }");

      const style = document.getElementById(
        "persistent-style"
      ) as HTMLStyleElement;
      expect(style.textContent).toBe(".original { color: red; }");
    });

    it("separate injectors are independent", () => {
      const injector1 = createStyleInjector("style-1");
      const injector2 = createStyleInjector("style-2");

      injector1(".one { color: red; }");
      injector2(".two { color: blue; }");

      expect(document.querySelectorAll("style").length).toBe(2);
      expect(document.getElementById("style-1")).not.toBeNull();
      expect(document.getElementById("style-2")).not.toBeNull();
    });
  });

  describe("GM_addStyle support", () => {
    it("uses GM_addStyle when available", () => {
      const mockGMAddStyle = vi.fn();
      vi.stubGlobal("GM_addStyle", mockGMAddStyle);

      const injector = createStyleInjector("gm-style");
      injector(".gm { color: red; }");

      expect(mockGMAddStyle).toHaveBeenCalledWith(".gm { color: red; }");
      expect(document.getElementById("gm-style")).toBeNull();
    });

    it("GM_addStyle respects idempotent behavior", () => {
      const mockGMAddStyle = vi.fn();
      vi.stubGlobal("GM_addStyle", mockGMAddStyle);

      const injector = createStyleInjector("gm-single");
      injector(".first { color: red; }");
      injector(".second { color: blue; }");

      expect(mockGMAddStyle).toHaveBeenCalledTimes(1);
    });
  });
});
