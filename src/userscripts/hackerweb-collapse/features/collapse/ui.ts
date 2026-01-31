import {
  getCollapsedState,
  setCollapsedState,
  setDataBool,
  getDataBool,
} from "./state";

const SELECTORS = {
  commentLi: "section li",
  repliesUl: ":scope > ul",
  childCommentLi: ":scope > li",
  ourToggle: ":scope > button.hwc-toggle",
  originalToggle: ":scope > button.comments-toggle:not(.hwc-toggle)",
  anyOurToggle: "button.hwc-toggle",
} as const;

const qs = <T extends Element>(
  sel: string,
  root: Element | Document = document
): T | null => root.querySelector(sel);

const qsa = <T extends Element>(
  sel: string,
  root: Element | Document = document
): NodeListOf<T> => root.querySelectorAll(sel);

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
  let current: HTMLLIElement = li;
  while (true) {
    const parentLi = current.parentElement?.closest("li") as HTMLLIElement | null;
    if (!parentLi) return current;
    current = parentLi;
  }
}

function getCommentId(li: HTMLLIElement): string | null {
  const timeLink = li.querySelector('p.metadata time a[href*="item?id="]');
  if (timeLink) {
    const href = timeLink.getAttribute("href");
    const match = href?.match(/item\?id=(\d+)/);
    if (match) return match[1];
  }
  return li.dataset.id || li.id || null;
}

// Collapse/expand logic
function setCollapsed(li: HTMLLIElement, collapsed: boolean) {
  const ul = getRepliesUl(li);
  const btn = qs<HTMLButtonElement>(SELECTORS.ourToggle, li);
  if (!ul || !btn) return;

  ul.style.display = collapsed ? "none" : "";
  setDataBool(btn, "collapsed", collapsed);

  const count = btn.dataset.count ?? "0";
  btn.textContent = collapsed ? `+ ${count}` : count;
  btn.classList.toggle("hwc-collapsed", collapsed);
  btn.setAttribute("aria-expanded", String(!collapsed));

  // Persist to localStorage
  const commentId = getCommentId(li);
  if (commentId) {
    setCollapsedState(commentId, collapsed);
  }
}

function collapseWholeThread(rootLi: HTMLLIElement) {
  for (const btn of qsa<HTMLButtonElement>(SELECTORS.anyOurToggle, rootLi)) {
    if (getDataBool(btn, "collapsed")) continue;
    const li = btn.closest("li") as HTMLLIElement | null;
    if (li) setCollapsed(li, true);
  }
}

function createToggleButton(repliesUl: HTMLUListElement): HTMLButtonElement | null {
  if (!repliesUl?.children?.length) return null;

  const count = countDescendantReplies(repliesUl);
  const collapsed = getComputedStyle(repliesUl).display === "none";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `comments-toggle hwc-toggle${collapsed ? " hwc-collapsed" : ""}`;
  btn.textContent = collapsed ? `+ ${count}` : String(count);
  btn.dataset.count = String(count);
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.setAttribute(
    "aria-label",
    collapsed ? `Expand ${count} replies` : `Collapse ${count} replies`
  );
  setDataBool(btn, "collapsed", collapsed);

  return btn;
}

export function injectButtons() {
  for (const li of qsa<HTMLLIElement>(SELECTORS.commentLi)) {
    const repliesUl = getRepliesUl(li);
    if (!repliesUl?.children?.length) continue;

    // Don't double-inject
    if (qs(SELECTORS.ourToggle, li)) continue;

    // Remove HackerWeb's original toggle so there's only one control
    qs(SELECTORS.originalToggle, li)?.remove();

    const btn = createToggleButton(repliesUl);
    if (btn) li.insertBefore(btn, repliesUl);

    // Restore persisted collapsed state
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

function highlightAncestors(li: HTMLLIElement | null) {
  clearHighlights();
  while (li) {
    li.classList.add("hwc-hl");
    li = li.parentElement?.closest("li") as HTMLLIElement | null;
  }
}

// Event handlers
function handleToggleClick(event: MouseEvent, btn: HTMLButtonElement) {
  event.stopPropagation();
  event.preventDefault();

  const li = btn.closest("li") as HTMLLIElement | null;
  if (!li) return;

  // Shift+click collapses the entire thread from root
  if (event.shiftKey) {
    collapseWholeThread(findThreadRoot(li));
    return;
  }

  setCollapsed(li, !getDataBool(btn, "collapsed"));
}

function handleLeftGutterClick(event: MouseEvent, li: HTMLLIElement) {
  // Treat clicks within 15px of left edge as toggle
  const rect = li.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  if (clickX > 15) return;

  const btn = qs<HTMLButtonElement>(SELECTORS.ourToggle, li);
  if (!btn) return;

  event.preventDefault();
  setCollapsed(li, !getDataBool(btn, "collapsed"));
}

export function setupEventListeners() {
  // Hover highlighting
  document.addEventListener("mouseover", (event) => {
    const li = (event.target as Element).closest(
      SELECTORS.commentLi
    ) as HTMLLIElement | null;
    if (li) highlightAncestors(li);
  });

  // Click handling for toggles and left-gutter
  document.addEventListener("click", (event) => {
    const btn = (event.target as Element).closest(
      "button.hwc-toggle"
    ) as HTMLButtonElement | null;
    if (btn) {
      handleToggleClick(event, btn);
      return;
    }

    const li = (event.target as Element).closest(
      SELECTORS.commentLi
    ) as HTMLLIElement | null;
    if (li) handleLeftGutterClick(event, li);
  });
}
