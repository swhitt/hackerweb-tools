import { describe, it, expect, beforeEach } from "vitest";
import { injectStoryLinks, injectCommentPageLink } from "./ui";

describe("injectStoryLinks", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function createStoryRow(itemId: string): void {
    const storyRow = document.createElement("tr");
    storyRow.className = "athing";
    storyRow.id = itemId;

    const subtextRow = document.createElement("tr");
    const subtextTd = document.createElement("td");
    subtextTd.className = "subtext";
    subtextTd.innerHTML = `<span class="score">100 points</span> | <a href="item?id=${itemId}">50 comments</a>`;
    subtextRow.appendChild(subtextTd);

    const table = document.createElement("table");
    table.appendChild(storyRow);
    table.appendChild(subtextRow);
    document.body.appendChild(table);
  }

  it("adds [hweb] link to story subtext rows", () => {
    createStoryRow("12345");

    injectStoryLinks();

    const link = document.querySelector(".hn-links-hweb");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("[hweb]");
  });

  it("links to correct HackerWeb URL with item ID", () => {
    createStoryRow("99999");

    injectStoryLinks();

    const link = document.querySelector<HTMLAnchorElement>(".hn-links-hweb");
    expect(link?.href).toBe("https://hackerweb.app/#/item/99999");
  });

  it("doesn't double-inject", () => {
    createStoryRow("12345");

    injectStoryLinks();
    injectStoryLinks();

    const links = document.querySelectorAll(".hn-links-hweb");
    expect(links.length).toBe(1);
  });

  it("handles multiple story rows", () => {
    createStoryRow("111");
    createStoryRow("222");
    createStoryRow("333");

    injectStoryLinks();

    const links = document.querySelectorAll(".hn-links-hweb");
    expect(links.length).toBe(3);
  });

  it("skips rows without subtext", () => {
    const storyRow = document.createElement("tr");
    storyRow.className = "athing";
    storyRow.id = "12345";
    document.body.appendChild(storyRow);

    injectStoryLinks();

    const links = document.querySelectorAll(".hn-links-hweb");
    expect(links.length).toBe(0);
  });
});

describe("injectCommentPageLink", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function createCommentPage(itemId: string): void {
    // Mock URL with ?id= param
    Object.defineProperty(window, "location", {
      value: {
        search: `?id=${itemId}`,
        href: `https://news.ycombinator.com/item?id=${itemId}`,
      },
      writable: true,
    });

    const storyRow = document.createElement("tr");
    storyRow.className = "athing";
    storyRow.id = itemId;

    const subtextRow = document.createElement("tr");
    const subtextTd = document.createElement("td");
    subtextTd.className = "subtext";
    subtextTd.innerHTML = `<span class="score">100 points</span>`;
    subtextRow.appendChild(subtextTd);

    const table = document.createElement("table");
    table.appendChild(storyRow);
    table.appendChild(subtextRow);
    document.body.appendChild(table);
  }

  it("adds link on comment pages when URL has ?id=", () => {
    createCommentPage("54321");

    injectCommentPageLink();

    const link = document.querySelector(".hn-links-hweb");
    expect(link).not.toBeNull();
    expect(link?.textContent).toBe("[hweb]");
  });

  it("extracts ID from URL correctly", () => {
    createCommentPage("98765");

    injectCommentPageLink();

    const link = document.querySelector<HTMLAnchorElement>(".hn-links-hweb");
    expect(link?.href).toBe("https://hackerweb.app/#/item/98765");
  });

  it("doesn't inject when no id param in URL", () => {
    Object.defineProperty(window, "location", {
      value: { search: "", href: "https://news.ycombinator.com/" },
      writable: true,
    });

    const storyRow = document.createElement("tr");
    storyRow.className = "athing";
    storyRow.id = "12345";
    const subtextRow = document.createElement("tr");
    const subtextTd = document.createElement("td");
    subtextTd.className = "subtext";
    subtextRow.appendChild(subtextTd);
    document.body.appendChild(storyRow);
    document.body.appendChild(subtextRow);

    injectCommentPageLink();

    const link = document.querySelector(".hn-links-hweb");
    expect(link).toBeNull();
  });

  it("doesn't double-inject", () => {
    createCommentPage("12345");

    injectCommentPageLink();
    injectCommentPageLink();

    const links = document.querySelectorAll(".hn-links-hweb");
    expect(links.length).toBe(1);
  });
});
