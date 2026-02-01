import { describe, it, expect, beforeEach } from "vitest";
import { qs, qsa, getEventTargetElement } from "./dom-helpers";

describe("dom-helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("qs", () => {
    it("returns element when found", () => {
      document.body.innerHTML = '<div id="test" class="foo"></div>';
      const el = qs("#test");
      expect(el).toBeInstanceOf(Element);
      expect(el?.id).toBe("test");
    });

    it("returns null when element not found", () => {
      document.body.innerHTML = "<div></div>";
      const el = qs("#nonexistent");
      expect(el).toBeNull();
    });

    it("searches within specified root element", () => {
      document.body.innerHTML = `
        <div id="container"><span class="target">inside</span></div>
        <span class="target">outside</span>
      `;
      const container = qs<HTMLDivElement>("#container");
      expect(container).not.toBeNull();
      const el = qs(".target", container as HTMLDivElement);
      expect(el?.textContent).toBe("inside");
    });

    it("returns correct type with generic", () => {
      document.body.innerHTML = '<input type="text" id="input">';
      const el = qs<HTMLInputElement>("#input");
      expect(el?.type).toBe("text");
    });
  });

  describe("qsa", () => {
    it("returns NodeList of matching elements", () => {
      document.body.innerHTML = `
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `;
      const els = qsa(".item");
      expect(els).toBeInstanceOf(NodeList);
      expect(els.length).toBe(3);
    });

    it("returns empty NodeList when no elements found", () => {
      document.body.innerHTML = "<div></div>";
      const els = qsa(".nonexistent");
      expect(els).toBeInstanceOf(NodeList);
      expect(els.length).toBe(0);
    });

    it("searches within specified root element", () => {
      document.body.innerHTML = `
        <div id="container">
          <span class="item">inside1</span>
          <span class="item">inside2</span>
        </div>
        <span class="item">outside</span>
      `;
      const container = qs<HTMLDivElement>("#container");
      expect(container).not.toBeNull();
      const els = qsa(".item", container as HTMLDivElement);
      expect(els.length).toBe(2);
    });

    it("returns correct type with generic", () => {
      document.body.innerHTML = `
        <input type="text" class="field">
        <input type="password" class="field">
      `;
      const els = qsa<HTMLInputElement>(".field");
      expect(els).toHaveLength(2);
      expect(els[0]?.type).toBe("text");
      expect(els[1]?.type).toBe("password");
    });
  });

  describe("getEventTargetElement", () => {
    it("returns Element when target is an Element", () => {
      document.body.innerHTML = '<button id="btn">Click</button>';
      const btn = qs("#btn");
      expect(btn).not.toBeNull();
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", { value: btn });

      const result = getEventTargetElement(event);
      expect(result).toBe(btn);
    });

    it("returns null when target is not an Element", () => {
      const event = new Event("custom");
      Object.defineProperty(event, "target", { value: document });

      const result = getEventTargetElement(event);
      expect(result).toBeNull();
    });

    it("returns null when target is null", () => {
      const event = new Event("custom");
      Object.defineProperty(event, "target", { value: null });

      const result = getEventTargetElement(event);
      expect(result).toBeNull();
    });

    it("returns null when target is a text node", () => {
      const textNode = document.createTextNode("hello");
      const event = new Event("custom");
      Object.defineProperty(event, "target", { value: textNode });

      const result = getEventTargetElement(event);
      expect(result).toBeNull();
    });
  });
});
