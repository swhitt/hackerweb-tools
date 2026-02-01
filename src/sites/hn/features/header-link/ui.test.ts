import { describe, it, expect, beforeEach } from "vitest";
import { injectHeaderLink } from "./ui";

describe("injectHeaderLink", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function createHNHeader(): void {
    const header = document.createElement("span");
    header.className = "pagetop";
    header.innerHTML = `<a href="news">Hacker News</a> | <a href="newest">new</a> | <a href="front">past</a>`;
    document.body.appendChild(header);
  }

  it("adds hckrnews link to .pagetop", () => {
    createHNHeader();

    injectHeaderLink();

    const link = document.querySelector<HTMLAnchorElement>(".hn-links-header");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("hckrnews");
    expect(link?.href).toBe("https://hckrnews.com/");
  });

  it("doesn't double-inject", () => {
    createHNHeader();

    injectHeaderLink();
    injectHeaderLink();

    const links = document.querySelectorAll(".hn-links-header");
    expect(links.length).toBe(1);
  });

  it("adds separator before link", () => {
    createHNHeader();

    injectHeaderLink();

    const pagetop = document.querySelector(".pagetop");
    expect(pagetop?.textContent).toContain(" | hckrnews");
  });

  it("does nothing when no .pagetop element", () => {
    injectHeaderLink();

    const link = document.querySelector(".hn-links-header");
    expect(link).toBeNull();
  });
});
