import { qsa, qs, getEventTargetElement } from "../../../utils/dom-helpers";
import { SetState } from "../../../config/state";

const BOOKMARK_BTN_CLASS = "hwt-bookmark-btn";
const PANEL_CLASS = "hwt-bookmarks-panel";
const TOGGLE_CLASS = "hwt-bookmarks-toggle";
const BOOKMARKED_ATTR = "data-bookmarked";

interface Bookmark {
  id: string;
  url: string;
  text: string;
  timestamp: number;
}

// Store bookmark IDs
const bookmarkIds = new SetState<string>("bookmarks");

// Store full bookmark data
const bookmarkStorage = new Map<string, Bookmark>();

let panelVisible = false;

/**
 * HackerWeb selectors
 */
const SEL_HACKERWEB = {
  comments: "section li",
  metadata: "p.metadata",
  timeLink: 'p.metadata time a[href*="item?id="]',
  content: ":scope > p:not(.metadata)",
};

/**
 * HN selectors
 */
const SEL_HN = {
  comments: ".comtr",
  metadata: ".comhead",
  timeLink: '.comhead a[href*="item?id="]',
  content: ".commtext",
};

/**
 * Get comment ID from element
 */
function getCommentId(
  comment: Element,
  site: "hackerweb" | "hn"
): string | null {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;
  const timeLink = qs<HTMLAnchorElement>(sel.timeLink, comment);
  if (!timeLink) return null;

  const href = timeLink.getAttribute("href");
  const match = href?.match(/item\?id=(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Get comment text preview
 */
function getCommentText(comment: Element, site: "hackerweb" | "hn"): string {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;
  const content = qs(sel.content, comment);
  const text = content?.textContent ?? "";
  return text.slice(0, 100).trim() + (text.length > 100 ? "..." : "");
}

/**
 * Create bookmark button
 */
function createBookmarkButton(isBookmarked: boolean): HTMLSpanElement {
  const btn = document.createElement("span");
  btn.className = BOOKMARK_BTN_CLASS;
  if (isBookmarked) btn.classList.add("bookmarked");
  btn.textContent = isBookmarked ? "★" : "☆";
  btn.title = isBookmarked ? "Remove bookmark" : "Bookmark this comment";
  return btn;
}

/**
 * Toggle bookmark on a comment
 */
function toggleBookmark(
  comment: Element,
  id: string,
  site: "hackerweb" | "hn"
): void {
  const isBookmarked = bookmarkIds.toggle(id);

  // Update button
  const btn = qs<HTMLSpanElement>(`.${BOOKMARK_BTN_CLASS}`, comment);
  if (btn) {
    btn.classList.toggle("bookmarked", isBookmarked);
    btn.textContent = isBookmarked ? "★" : "☆";
    btn.title = isBookmarked ? "Remove bookmark" : "Bookmark this comment";
  }

  // Update data attribute
  comment.setAttribute(BOOKMARKED_ATTR, String(isBookmarked));

  // Store bookmark data
  if (isBookmarked) {
    bookmarkStorage.set(id, {
      id,
      url: `https://news.ycombinator.com/item?id=${id}`,
      text: getCommentText(comment, site),
      timestamp: Date.now(),
    });
  } else {
    bookmarkStorage.delete(id);
  }

  // Update toggle button count
  updateToggleCount();
}

/**
 * Add bookmark buttons to comments
 */
export function addBookmarkButtons(site: "hackerweb" | "hn"): void {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;

  for (const comment of qsa(sel.comments)) {
    const metadata = qs(sel.metadata, comment);
    if (!metadata) continue;

    // Skip if already has button
    if (qs(`.${BOOKMARK_BTN_CLASS}`, metadata)) continue;

    const id = getCommentId(comment, site);
    if (!id) continue;

    const isBookmarked = bookmarkIds.has(id);
    const btn = createBookmarkButton(isBookmarked);

    if (isBookmarked) {
      comment.setAttribute(BOOKMARKED_ATTR, "true");
    }

    metadata.appendChild(btn);
  }
}

/**
 * Set up click handler for bookmark buttons
 */
export function setupBookmarkHandler(site: "hackerweb" | "hn"): void {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;

  document.addEventListener("click", (e) => {
    const target = getEventTargetElement(e);
    if (!target) return;

    // Check for bookmark button click
    if (target.classList.contains(BOOKMARK_BTN_CLASS)) {
      e.preventDefault();
      e.stopPropagation();

      const comment = target.closest(sel.comments);
      if (!comment) return;

      const id = getCommentId(comment, site);
      if (id) toggleBookmark(comment, id, site);
    }

    // Check for toggle button click
    if (target.classList.contains(TOGGLE_CLASS)) {
      e.preventDefault();
      togglePanel();
    }

    // Check for panel close click
    if (target.classList.contains("hwt-bookmarks-panel-close")) {
      e.preventDefault();
      togglePanel(false);
    }
  });
}

/**
 * Update the toggle button count badge
 */
function updateToggleCount(): void {
  const toggle = qs(`.${TOGGLE_CLASS}`);
  if (!toggle) return;

  const count = bookmarkIds.getAll().length;
  let badge = qs(".hwt-bookmarks-toggle-count", toggle);

  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "hwt-bookmarks-toggle-count";
      toggle.appendChild(badge);
    }
    badge.textContent = String(count);
  } else {
    badge?.remove();
  }
}

/**
 * Toggle the bookmarks panel
 */
function togglePanel(show?: boolean): void {
  panelVisible = show ?? !panelVisible;

  let panel = qs(`.${PANEL_CLASS}`);

  if (panelVisible) {
    if (!panel) {
      panel = createPanel();
      document.body.appendChild(panel);
    }
    updatePanelContent(panel);
    panel.classList.add("visible");
  } else {
    panel?.classList.remove("visible");
  }
}

/**
 * Create the bookmarks panel
 */
function createPanel(): HTMLDivElement {
  const panel = document.createElement("div");
  panel.className = PANEL_CLASS;
  panel.innerHTML = `
    <div class="hwt-bookmarks-panel-header">
      <span>Bookmarks</span>
      <span class="hwt-bookmarks-panel-close">×</span>
    </div>
    <div class="hwt-bookmarks-panel-body"></div>
  `;
  return panel;
}

/**
 * Update panel content with current bookmarks
 */
function updatePanelContent(panel: Element): void {
  const body = qs(".hwt-bookmarks-panel-body", panel);
  if (!body) return;

  const bookmarks = bookmarkIds.getAll();

  if (bookmarks.length === 0) {
    body.innerHTML = '<div class="hwt-bookmark-item">No bookmarks yet</div>';
    return;
  }

  // Build items safely to prevent XSS from comment content
  body.innerHTML = "";
  for (const id of bookmarks) {
    const bookmark = bookmarkStorage.get(id);
    const text = bookmark?.text ?? `Comment #${id}`;

    const item = document.createElement("div");
    item.className = "hwt-bookmark-item";
    item.setAttribute("data-id", id);

    const textDiv = document.createElement("div");
    textDiv.className = "hwt-bookmark-item-text";
    textDiv.textContent = text; // Safe: textContent escapes HTML

    const metaDiv = document.createElement("div");
    metaDiv.className = "hwt-bookmark-item-meta";

    const link = document.createElement("a");
    link.href = `https://news.ycombinator.com/item?id=${id}`;
    link.target = "_blank";
    link.textContent = "View on HN →";

    metaDiv.appendChild(link);
    item.appendChild(textDiv);
    item.appendChild(metaDiv);
    body.appendChild(item);
  }
}

/**
 * Create the toggle button
 */
export function createToggleButton(): void {
  if (qs(`.${TOGGLE_CLASS}`)) return;

  const toggle = document.createElement("button");
  toggle.className = TOGGLE_CLASS;
  toggle.innerHTML = "☆";
  toggle.title = "View bookmarks";

  document.body.appendChild(toggle);
  updateToggleCount();
}
