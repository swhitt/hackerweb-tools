import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import { injectButtons, setupEventListeners } from "./ui";
import {
  type CommentId,
  asCommentId,
  clearCollapsedState,
  setCollapsedState,
} from "./state";

/** Helper to create valid CommentIds for tests */
function commentId(id: string): CommentId {
  const result = asCommentId(id);
  if (!result) throw new Error(`Invalid test CommentId: ${id}`);
  return result;
}

// Track if event listeners have been set up (they persist across tests in jsdom)
let eventListenersInitialized = false;

/** Assert element exists and return as HTMLButtonElement */
function getToggleButton(container: Element): HTMLButtonElement {
  const btn = container.querySelector("button.hwc-toggle");
  if (!(btn instanceof HTMLButtonElement)) {
    throw new Error("Toggle button not found");
  }
  return btn;
}

// Helper to create minimal DOM fixtures
function createCommentLi(options: {
  id?: string;
  hasReplies?: boolean;
  replyCount?: number;
  hasOurToggle?: boolean;
  hasOriginalToggle?: boolean;
  repliesHidden?: boolean;
}): HTMLLIElement {
  const {
    id = "12345",
    hasReplies = true,
    replyCount = 2,
    hasOurToggle = false,
    hasOriginalToggle = false,
    repliesHidden = false,
  } = options;

  const li = document.createElement("li");

  // Add metadata with item link for comment ID extraction
  const metadata = document.createElement("p");
  metadata.className = "metadata";
  const time = document.createElement("time");
  const link = document.createElement("a");
  link.href = `https://news.ycombinator.com/item?id=${id}`;
  link.textContent = "1 hour ago";
  time.appendChild(link);
  metadata.appendChild(time);
  li.appendChild(metadata);

  // Add original toggle if requested
  if (hasOriginalToggle) {
    const originalBtn = document.createElement("button");
    originalBtn.className = "comments-toggle";
    li.appendChild(originalBtn);
  }

  // Add our toggle if requested
  if (hasOurToggle) {
    const ourBtn = document.createElement("button");
    ourBtn.className = "comments-toggle hwc-toggle";
    ourBtn.dataset["count"] = String(replyCount);
    ourBtn.dataset["collapsed"] = "false";
    ourBtn.setAttribute("aria-expanded", "true");
    li.appendChild(ourBtn);
  }

  // Add replies UL if requested
  if (hasReplies) {
    const ul = document.createElement("ul");
    if (repliesHidden) {
      ul.style.display = "none";
    }
    for (let i = 0; i < replyCount; i++) {
      const replyLi = document.createElement("li");
      replyLi.innerHTML = `<p class="metadata"><time><a href="item?id=${Number(id) + i + 1}">reply</a></time></p>`;
      ul.appendChild(replyLi);
    }
    li.appendChild(ul);
  }

  return li;
}

function createSection(): HTMLElement {
  const section = document.createElement("section");
  return section;
}

describe("createToggleButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  it("creates button with correct class names", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 3 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    expect(btn).not.toBeNull();
    expect(btn?.classList.contains("comments-toggle")).toBe(true);
    expect(btn?.classList.contains("hwc-toggle")).toBe(true);
  });

  it("creates button with correct text content (chevron + count)", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 3 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    // Should show expanded chevron and count
    expect(btn?.textContent).toBe("▶ 3");
  });

  it("creates button with collapsed chevron when replies are hidden", () => {
    const section = createSection();
    const li = createCommentLi({
      hasReplies: true,
      replyCount: 2,
      repliesHidden: true,
    });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    expect(btn?.textContent).toBe("▶ 2");
    expect(btn?.classList.contains("hwc-collapsed")).toBe(true);
  });

  it("creates button with correct ARIA attributes when expanded", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 5 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    expect(btn?.getAttribute("aria-expanded")).toBe("true");
    expect(btn?.getAttribute("aria-label")).toBe("Collapse 5 replies");
  });

  it("creates button with correct ARIA attributes when collapsed", () => {
    const section = createSection();
    const li = createCommentLi({
      hasReplies: true,
      replyCount: 3,
      repliesHidden: true,
    });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    expect(btn?.getAttribute("aria-expanded")).toBe("false");
    expect(btn?.getAttribute("aria-label")).toBe("Expand 3 replies");
  });

  it("creates button with correct data attributes", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 4 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = getToggleButton(li);
    expect(btn.dataset["count"]).toBe("4");
    expect(btn.dataset["collapsed"]).toBe("false");
  });

  it("sets button type to button", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = getToggleButton(li);
    expect(btn.type).toBe("button");
  });

  it("includes shift+click hint in tooltip", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = getToggleButton(li);
    expect(btn.title).toContain("Shift+click");
  });
});

describe("injectButtons", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  it("injects buttons into comment LIs with replies", () => {
    const section = createSection();
    const li1 = createCommentLi({ id: "1", hasReplies: true });
    const li2 = createCommentLi({ id: "2", hasReplies: true });
    section.appendChild(li1);
    section.appendChild(li2);
    document.body.appendChild(section);

    injectButtons();

    expect(li1.querySelector("button.hwc-toggle")).not.toBeNull();
    expect(li2.querySelector("button.hwc-toggle")).not.toBeNull();
  });

  it("does not inject buttons into LIs without replies", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: false });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    expect(li.querySelector("button.hwc-toggle")).toBeNull();
  });

  it("does not double-inject buttons", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, hasOurToggle: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();
    injectButtons(); // Call twice

    const buttons = li.querySelectorAll("button.hwc-toggle");
    expect(buttons.length).toBe(1);
  });

  it("removes original HackerWeb toggles", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, hasOriginalToggle: true });
    section.appendChild(li);
    document.body.appendChild(section);

    // Verify original toggle exists before injection
    expect(
      li.querySelector("button.comments-toggle:not(.hwc-toggle)")
    ).not.toBeNull();

    injectButtons();

    // Original toggle should be removed
    expect(
      li.querySelector("button.comments-toggle:not(.hwc-toggle)")
    ).toBeNull();
    // Our toggle should exist
    expect(li.querySelector("button.hwc-toggle")).not.toBeNull();
  });

  it("restores persisted collapsed state", () => {
    const section = createSection();
    const li = createCommentLi({
      id: "99999",
      hasReplies: true,
      replyCount: 2,
    });
    section.appendChild(li);
    document.body.appendChild(section);

    // Set collapsed state before injection
    setCollapsedState(commentId("99999"), true);

    injectButtons();

    const btn = getToggleButton(li);
    const ul = li.querySelector("ul");

    expect(btn.dataset["collapsed"]).toBe("true");
    expect(btn.classList.contains("hwc-collapsed")).toBe(true);
    expect(ul?.style.display).toBe("none");
  });

  it("places button before the replies UL", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle");
    const ul = li.querySelector("ul");
    expect(btn?.nextElementSibling).toBe(ul);
  });
});

describe("setCollapsed (via button click)", () => {
  beforeAll(() => {
    // Set up event listeners once for all tests in this describe block
    // They persist in jsdom, so we only do this once
    if (!eventListenersInitialized) {
      setupEventListeners();
      eventListenersInitialized = true;
    }
  });

  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  it("hides replies UL when collapsed", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 2 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;
    const ul = li.querySelector("ul") as HTMLUListElement;

    // Initially expanded
    expect(ul.style.display).toBe("");

    // Simulate click to collapse
    btn.click();

    expect(ul.style.display).toBe("none");
  });

  it("shows replies UL when expanded", () => {
    const section = createSection();
    const li = createCommentLi({
      hasReplies: true,
      replyCount: 2,
      repliesHidden: true,
    });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;
    const ul = li.querySelector("ul") as HTMLUListElement;

    // Initially collapsed
    expect(ul.style.display).toBe("none");

    // Simulate click to expand
    btn.click();

    expect(ul.style.display).toBe("");
  });

  it("updates button text when collapsed", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 3 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    // Initially expanded
    expect(btn.textContent).toBe("▶ 3");

    btn.click();

    expect(btn.textContent).toBe("▶ 3");
  });

  it("updates button text when expanded", () => {
    const section = createSection();
    const li = createCommentLi({
      hasReplies: true,
      replyCount: 4,
      repliesHidden: true,
    });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    // Initially collapsed
    expect(btn.textContent).toBe("▶ 4");

    btn.click();

    expect(btn.textContent).toBe("▶ 4");
  });

  it("toggles hwc-collapsed class on button", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    expect(btn.classList.contains("hwc-collapsed")).toBe(false);

    btn.click();
    expect(btn.classList.contains("hwc-collapsed")).toBe(true);

    btn.click();
    expect(btn.classList.contains("hwc-collapsed")).toBe(false);
  });

  it("updates aria-expanded attribute when collapsed", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    expect(btn.getAttribute("aria-expanded")).toBe("true");

    btn.click();

    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });

  it("updates aria-expanded attribute when expanded", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, repliesHidden: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    expect(btn.getAttribute("aria-expanded")).toBe("false");

    btn.click();

    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });

  it("persists collapsed state to localStorage", () => {
    const section = createSection();
    const li = createCommentLi({ id: "77777", hasReplies: true });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const btn = li.querySelector("button.hwc-toggle") as HTMLButtonElement;

    btn.click(); // Collapse

    const stored = localStorage.getItem("hwc-collapsed");
    expect(stored).toBeDefined();
    expect(JSON.parse(stored ?? "[]")).toContain("77777");
  });
});

describe("left gutter click", () => {
  beforeAll(() => {
    if (!eventListenersInitialized) {
      setupEventListeners();
      eventListenersInitialized = true;
    }
  });

  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  it("collapses when clicking within threshold of left edge", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 2 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const ul = li.querySelector("ul") as HTMLUListElement;
    expect(ul.style.display).toBe("");

    // Mock getBoundingClientRect to return predictable values
    vi.spyOn(li, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 0,
      right: 500,
      bottom: 100,
      width: 400,
      height: 100,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    // Click within 15px of left edge (threshold is 15px)
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      clientX: 105, // 5px from left edge (100 + 5 = 105)
    });
    li.dispatchEvent(clickEvent);

    expect(ul.style.display).toBe("none");
  });

  it("does not collapse when clicking beyond threshold", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: true, replyCount: 2 });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    const ul = li.querySelector("ul") as HTMLUListElement;
    expect(ul.style.display).toBe("");

    // Mock getBoundingClientRect
    vi.spyOn(li, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 0,
      right: 500,
      bottom: 100,
      width: 400,
      height: 100,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    // Click beyond threshold (16px from left edge)
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      clientX: 120, // 20px from left edge
    });
    li.dispatchEvent(clickEvent);

    // Should NOT collapse
    expect(ul.style.display).toBe("");
  });

  it("does nothing when comment has no toggle button", () => {
    const section = createSection();
    const li = createCommentLi({ hasReplies: false });
    section.appendChild(li);
    document.body.appendChild(section);

    injectButtons();

    // Mock getBoundingClientRect
    vi.spyOn(li, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 0,
      right: 500,
      bottom: 100,
      width: 400,
      height: 100,
      x: 100,
      y: 0,
      toJSON: () => ({}),
    });

    // Click within threshold - should not throw
    const clickEvent = new MouseEvent("click", {
      bubbles: true,
      clientX: 105,
    });
    expect(() => li.dispatchEvent(clickEvent)).not.toThrow();
  });
});

describe("shift+click whole thread collapse", () => {
  beforeAll(() => {
    if (!eventListenersInitialized) {
      setupEventListeners();
      eventListenersInitialized = true;
    }
  });

  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  /** Create a nested comment tree structure */
  function createNestedCommentTree(): {
    section: HTMLElement;
    root: HTMLLIElement;
    child: HTMLLIElement;
    grandchild: HTMLLIElement;
  } {
    const section = createSection();

    // Root comment with a child
    const root = document.createElement("li");
    root.innerHTML = `<p class="metadata"><time><a href="item?id=100">root</a></time></p>`;

    const rootUl = document.createElement("ul");

    // Child comment with a grandchild
    const child = document.createElement("li");
    child.innerHTML = `<p class="metadata"><time><a href="item?id=101">child</a></time></p>`;

    const childUl = document.createElement("ul");

    // Grandchild comment (no replies)
    const grandchild = document.createElement("li");
    grandchild.innerHTML = `<p class="metadata"><time><a href="item?id=102">grandchild</a></time></p>`;

    // Build the tree
    childUl.appendChild(grandchild);
    child.appendChild(childUl);
    rootUl.appendChild(child);
    root.appendChild(rootUl);
    section.appendChild(root);

    return { section, root, child, grandchild };
  }

  it("collapses all nested comments from root when shift+clicking any button", () => {
    const { section, root, child } = createNestedCommentTree();
    document.body.appendChild(section);

    injectButtons();

    // Get buttons
    const rootBtn = root.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;
    const childBtn = child.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;

    // Initially all expanded
    expect(rootBtn.dataset["collapsed"]).toBe("false");
    expect(childBtn.dataset["collapsed"]).toBe("false");

    // Shift+click on the child button
    const shiftClickEvent = new MouseEvent("click", {
      bubbles: true,
      shiftKey: true,
    });
    childBtn.dispatchEvent(shiftClickEvent);

    // Both should now be collapsed
    expect(rootBtn.dataset["collapsed"]).toBe("true");
    expect(childBtn.dataset["collapsed"]).toBe("true");
  });

  it("collapses entire thread when shift+clicking root button", () => {
    const { section, root, child } = createNestedCommentTree();
    document.body.appendChild(section);

    injectButtons();

    const rootBtn = root.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;
    const childBtn = child.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;

    // Shift+click on the root button
    const shiftClickEvent = new MouseEvent("click", {
      bubbles: true,
      shiftKey: true,
    });
    rootBtn.dispatchEvent(shiftClickEvent);

    // Both should be collapsed
    expect(rootBtn.dataset["collapsed"]).toBe("true");
    expect(childBtn.dataset["collapsed"]).toBe("true");
  });

  it("skips already collapsed comments", () => {
    const { section, root, child } = createNestedCommentTree();
    document.body.appendChild(section);

    injectButtons();

    const rootBtn = root.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;
    const childBtn = child.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;

    // First, manually collapse the child
    childBtn.click();
    expect(childBtn.dataset["collapsed"]).toBe("true");

    // Now shift+click the root - child should remain collapsed (not toggled)
    const shiftClickEvent = new MouseEvent("click", {
      bubbles: true,
      shiftKey: true,
    });
    rootBtn.dispatchEvent(shiftClickEvent);

    // Both collapsed
    expect(rootBtn.dataset["collapsed"]).toBe("true");
    expect(childBtn.dataset["collapsed"]).toBe("true");
  });

  it("normal click does not collapse whole thread", () => {
    const { section, root, child } = createNestedCommentTree();
    document.body.appendChild(section);

    injectButtons();

    const rootBtn = root.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;
    const childBtn = child.querySelector(
      ":scope > button.hwc-toggle"
    ) as HTMLButtonElement;

    // Normal click on child button (no shift)
    childBtn.click();

    // Only child should be collapsed, not root
    expect(rootBtn.dataset["collapsed"]).toBe("false");
    expect(childBtn.dataset["collapsed"]).toBe("true");
  });
});

describe("hover highlighting", () => {
  beforeAll(() => {
    if (!eventListenersInitialized) {
      setupEventListeners();
      eventListenersInitialized = true;
    }
  });

  beforeEach(() => {
    document.body.innerHTML = "";
    clearCollapsedState();
    localStorage.clear();
  });

  it("adds hwc-hl class to hovered comment and ancestors", () => {
    const section = createSection();

    // Create parent > child structure
    const parent = document.createElement("li");
    parent.innerHTML = `<p class="metadata"><time><a href="item?id=1">parent</a></time></p>`;
    const parentUl = document.createElement("ul");

    const child = document.createElement("li");
    child.innerHTML = `<p class="metadata"><time><a href="item?id=2">child</a></time></p>`;

    parentUl.appendChild(child);
    parent.appendChild(parentUl);
    section.appendChild(parent);
    document.body.appendChild(section);

    // Hover over child
    const hoverEvent = new MouseEvent("mouseover", { bubbles: true });
    child.dispatchEvent(hoverEvent);

    // Both child and parent should have highlight class
    expect(child.classList.contains("hwc-hl")).toBe(true);
    expect(parent.classList.contains("hwc-hl")).toBe(true);
  });

  it("clears highlights when hovering different comment", () => {
    const section = createSection();

    const comment1 = createCommentLi({ id: "1", hasReplies: false });
    const comment2 = createCommentLi({ id: "2", hasReplies: false });
    section.appendChild(comment1);
    section.appendChild(comment2);
    document.body.appendChild(section);

    // Hover over comment1
    comment1.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(comment1.classList.contains("hwc-hl")).toBe(true);

    // Hover over comment2
    comment2.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    // comment1 should no longer be highlighted
    expect(comment1.classList.contains("hwc-hl")).toBe(false);
    expect(comment2.classList.contains("hwc-hl")).toBe(true);
  });
});
