import { qs, qsa, getEventTargetElement } from "../../../../utils/dom-helpers";
import {
  type CommentId,
  asCommentId,
  getCollapsedState,
  setCollapsedState,
  setDataBool,
  getDataBool,
} from "./state";

/** CSS selectors for HackerWeb's nested comment structure. Uses `:scope >` for direct children only. */
const SELECTORS = {
  commentLi: "section li",
  repliesUl: ":scope > ul",
  childCommentLi: ":scope > li",
  ourToggle: ":scope > button.hwc-toggle",
  originalToggle: ":scope > button.comments-toggle:not(.hwc-toggle)",
  anyOurToggle: "button.hwc-toggle",
} as const;

/** Clicks within this many pixels of left edge trigger collapse */
const LEFT_GUTTER_THRESHOLD_PX = 15;

// Comment tree helpers
function getRepliesUl(li: Element): HTMLUListElement | null {
  return qs<HTMLUListElement>(SELECTORS.repliesUl, li);
}

function countDescendantReplies(ul: HTMLUListElement | null): number {
  if (!ul) return 0;

  let count = 0;
  for (const childLi of qsa<HTMLLIElement>(SELECTORS.childCommentLi, ul)) {
    count += 1;
    count += countDescendantReplies(getRepliesUl(childLi));
  }
  return count;
}

function findThreadRoot(li: HTMLLIElement): HTMLLIElement {
  let current = li;
  let parentLi = current.parentElement?.closest("li");
  while (parentLi instanceof HTMLLIElement) {
    current = parentLi;
    parentLi = current.parentElement?.closest("li");
  }
  return current;
}

function getCommentId(li: HTMLLIElement): CommentId | null {
  const timeLink = li.querySelector('p.metadata time a[href*="item?id="]');
  if (timeLink) {
    const href = timeLink.getAttribute("href");
    const match = href?.match(/item\?id=(\d+)/);
    if (match?.[1]) return asCommentId(match[1]);
  }
  return asCommentId(li.dataset["id"]) ?? asCommentId(li.id);
}

// Collapse/expand logic
function setCollapsed(li: HTMLLIElement, collapsed: boolean) {
  const ul = getRepliesUl(li);
  const btn = qs<HTMLButtonElement>(SELECTORS.ourToggle, li);
  if (!ul || !btn) return;

  ul.style.display = collapsed ? "none" : "";
  setDataBool(btn, "collapsed", collapsed);
  btn.classList.toggle("hwc-collapsed", collapsed);

  const count = btn.dataset["count"] ?? "0";
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.setAttribute(
    "aria-label",
    collapsed ? `Expand ${count} replies` : `Collapse ${count} replies`
  );

  const commentId = getCommentId(li);
  if (commentId) {
    setCollapsedState(commentId, collapsed);
  }
}

function collapseWholeThread(rootLi: HTMLLIElement) {
  for (const btn of qsa<HTMLButtonElement>(SELECTORS.anyOurToggle, rootLi)) {
    if (getDataBool(btn, "collapsed")) continue;
    const li = btn.closest("li");
    if (li instanceof HTMLLIElement) setCollapsed(li, true);
  }
}

function createToggleButton(
  repliesUl: HTMLUListElement
): HTMLButtonElement | null {
  if (!repliesUl.children.length) return null;

  const count = countDescendantReplies(repliesUl);
  const collapsed = getComputedStyle(repliesUl).display === "none";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `comments-toggle hwc-toggle${collapsed ? " hwc-collapsed" : ""}`;
  btn.innerHTML = `<span class="hwc-arrow">▶</span> ${count}`;
  btn.dataset["count"] = String(count);
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.setAttribute(
    "aria-label",
    collapsed ? `Expand ${count} replies` : `Collapse ${count} replies`
  );
  btn.title = "Click to toggle, Shift+click to collapse entire thread";
  setDataBool(btn, "collapsed", collapsed);

  return btn;
}

export function injectButtons() {
  for (const li of qsa<HTMLLIElement>(SELECTORS.commentLi)) {
    const repliesUl = getRepliesUl(li);
    if (!repliesUl?.children.length) continue;

    // Don't double-inject
    if (qs(SELECTORS.ourToggle, li)) continue;

    // Remove HackerWeb's original toggle so there's only one control
    qs(SELECTORS.originalToggle, li)?.remove();

    const btn = createToggleButton(repliesUl);
    if (btn) li.insertBefore(btn, repliesUl);

    const commentId = getCommentId(li);
    if (commentId && getCollapsedState(commentId)) {
      setCollapsed(li, true);
    }
  }
}

// Highlight ancestor chain on hover
function clearHighlights() {
  for (const el of qsa(".hwc-hl")) {
    el.classList.remove("hwc-hl");
  }
}

function highlightAncestors(startLi: HTMLLIElement | null) {
  clearHighlights();
  let li: Element | null = startLi;
  while (li instanceof HTMLLIElement) {
    li.classList.add("hwc-hl");
    li = li.parentElement?.closest("li") ?? null;
  }
}

// Event handlers
function handleToggleClick(event: MouseEvent, btn: HTMLButtonElement) {
  event.stopPropagation();
  event.preventDefault();

  const li = btn.closest("li");
  if (!(li instanceof HTMLLIElement)) return;

  // Shift+click collapses the entire thread from root
  if (event.shiftKey) {
    collapseWholeThread(findThreadRoot(li));
    return;
  }

  setCollapsed(li, !getDataBool(btn, "collapsed"));
}

function handleLeftGutterClick(event: MouseEvent, li: HTMLLIElement) {
  // Treat clicks within threshold of left edge as toggle
  const rect = li.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  if (clickX > LEFT_GUTTER_THRESHOLD_PX) return;

  const btn = qs<HTMLButtonElement>(SELECTORS.ourToggle, li);
  if (!btn) return;

  event.preventDefault();
  setCollapsed(li, !getDataBool(btn, "collapsed"));
}

export function setupEventListeners() {
  // Hover highlighting
  document.addEventListener("mouseover", (event) => {
    const target = getEventTargetElement(event);
    if (!target) return;

    const li = target.closest(SELECTORS.commentLi);
    if (li instanceof HTMLLIElement) highlightAncestors(li);
  });

  // Click handling for toggles and left-gutter
  document.addEventListener("click", (event) => {
    const target = getEventTargetElement(event);
    if (!target) return;

    const btn = target.closest("button.hwc-toggle");
    if (btn instanceof HTMLButtonElement) {
      handleToggleClick(event, btn);
      return;
    }

    const li = target.closest(SELECTORS.commentLi);
    if (li instanceof HTMLLIElement) handleLeftGutterClick(event, li);
  });
}
