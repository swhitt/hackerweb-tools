import { qsa, qs, getEventTargetElement } from "../../../utils/dom-helpers";
import { SetState, MapState } from "../../../config/state";

const BOOKMARK_BTN_CLASS = "hwt-bookmark-btn";
const PANEL_CLASS = "hwt-bookmarks-panel";
const TOGGLE_CLASS = "hwt-bookmarks-toggle";
const BOOKMARKED_ATTR = "data-bookmarked";

interface Bookmark {
  id: string;
  url: string;
  title: string;
  text: string;
  author: string;
  timestamp: number;
}

// Store bookmark IDs (kept for backward compat with existing bookmarks)
const bookmarkIds = new SetState<string>("bookmarks");

// Store full bookmark data (persisted to localStorage)
const bookmarkData = new MapState<string, Bookmark>(
  "bookmarkData",
  (v): v is Bookmark =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as Bookmark).id === "string" &&
    typeof (v as Bookmark).text === "string"
);

let panelVisible = false;
const PAGE_SIZE = 5;
let currentPage = 0;

/**
 * HackerWeb selectors
 */
const SEL_HACKERWEB = {
  comments: "section li",
  metadata: "p.metadata",
  timeLink: 'p.metadata time a[href*="item?id="]',
  content: ":scope > p:not(.metadata)",
  author: "p.metadata .user",
  pageTitle: "#view-comments header h1",
};

/**
 * HN selectors
 */
const SEL_HN = {
  comments: ".comtr",
  metadata: ".comhead",
  timeLink: '.comhead a[href*="item?id="]',
  content: ".commtext",
  author: ".hnuser",
  pageTitle: ".titleline > a",
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
 * Get comment text preview (~80 chars stored, displayed truncated by CSS)
 */
function getCommentText(comment: Element, site: "hackerweb" | "hn"): string {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;
  const content = qs(sel.content, comment);
  const text = content?.textContent ?? "";
  const trimmed = text.slice(0, 80).trim();
  return trimmed + (text.trim().length > 80 ? "\u2026" : "");
}

/**
 * Get comment author
 */
function getCommentAuthor(comment: Element, site: "hackerweb" | "hn"): string {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;
  const author = qs(sel.author, comment);
  return author?.textContent.trim() ?? "";
}

/**
 * Get the current page/post title
 */
function getPageTitle(site: "hackerweb" | "hn"): string {
  const sel = site === "hackerweb" ? SEL_HACKERWEB : SEL_HN;
  return qs(sel.pageTitle)?.textContent.trim() ?? "";
}

/**
 * Format relative time
 */
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * Refresh panel if it's currently open
 */
function refreshPanel(): void {
  if (!panelVisible) return;
  const panel = qs(`.${PANEL_CLASS}`);
  if (panel) updatePanelContent(panel);
}

/**
 * Create bookmark button
 */
function createBookmarkButton(isBookmarked: boolean): HTMLSpanElement {
  const btn = document.createElement("span");
  btn.className = BOOKMARK_BTN_CLASS;
  if (isBookmarked) btn.classList.add("bookmarked");
  btn.textContent = isBookmarked ? "\u2605" : "\u2606";
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
    btn.textContent = isBookmarked ? "\u2605" : "\u2606";
    btn.title = isBookmarked ? "Remove bookmark" : "Bookmark this comment";
  }

  // Update data attribute
  comment.setAttribute(BOOKMARKED_ATTR, String(isBookmarked));

  // Store or remove bookmark data
  if (isBookmarked) {
    bookmarkData.set(id, {
      id,
      url: `https://news.ycombinator.com/item?id=${id}`,
      title: getPageTitle(site),
      text: getCommentText(comment, site),
      author: getCommentAuthor(comment, site),
      timestamp: Date.now(),
    });
  } else {
    bookmarkData.delete(id);
  }

  // Update toggle button count and refresh open panel
  currentPage = 0;
  updateToggleCount();
  refreshPanel();
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

      // Backfill rich data for legacy bookmarks visible on this page
      if (!bookmarkData.has(id)) {
        bookmarkData.set(id, {
          id,
          url: `https://news.ycombinator.com/item?id=${id}`,
          title: getPageTitle(site),
          text: getCommentText(comment, site),
          author: getCommentAuthor(comment, site),
          timestamp: Date.now(),
        });
      }
    }

    // Insert after the username so it stays on the same flex line
    const userEl = qs(sel.author, metadata);
    if (userEl) {
      userEl.after(btn);
    } else {
      metadata.appendChild(btn);
    }
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

    // Check for pagination
    if (target.classList.contains("hwt-bookmarks-nav-btn")) {
      e.preventDefault();
      const dir = target.getAttribute("data-dir");
      if (dir === "prev") currentPage--;
      if (dir === "next") currentPage++;
      refreshPanel();
    }

    // Check for bookmark removal from panel
    if (target.classList.contains("hwt-bookmark-item-remove")) {
      e.preventDefault();
      e.stopPropagation();
      const id = target.getAttribute("data-id");
      if (!id) return;

      bookmarkIds.delete(id);
      bookmarkData.delete(id);
      updateToggleCount();
      refreshPanel();

      // Update on-page button if comment is visible
      for (const comment of qsa(sel.comments)) {
        if (getCommentId(comment, site) === id) {
          const btn = qs<HTMLSpanElement>(`.${BOOKMARK_BTN_CLASS}`, comment);
          if (btn) {
            btn.classList.remove("bookmarked");
            btn.textContent = "\u2606";
            btn.title = "Bookmark this comment";
          }
          comment.removeAttribute(BOOKMARKED_ATTR);
          break;
        }
      }
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

  const header = document.createElement("div");
  header.className = "hwt-bookmarks-panel-header";

  const title = document.createElement("span");
  title.textContent = "Bookmarks";
  header.appendChild(title);

  const closeBtn = document.createElement("span");
  closeBtn.className = "hwt-bookmarks-panel-close";
  closeBtn.textContent = "\u00d7";
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "hwt-bookmarks-panel-body";

  panel.appendChild(header);
  panel.appendChild(body);
  return panel;
}

/**
 * Get sorted bookmarks list
 */
function getSortedBookmarks(): { id: string; data: Bookmark | undefined }[] {
  return bookmarkIds
    .getAll()
    .map((id) => ({ id, data: bookmarkData.get(id) }))
    .sort((a, b) => (b.data?.timestamp ?? 0) - (a.data?.timestamp ?? 0));
}

/**
 * Update panel content with current bookmarks (paginated)
 */
function updatePanelContent(panel: Element): void {
  const body = qs(".hwt-bookmarks-panel-body", panel);
  if (!body) return;

  const sorted = getSortedBookmarks();
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  // Clamp page to valid range
  if (currentPage >= totalPages) currentPage = totalPages - 1;
  if (currentPage < 0) currentPage = 0;

  body.innerHTML = "";

  if (sorted.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hwt-bookmarks-empty";
    empty.textContent =
      "No bookmarks yet. Click \u2606 on a comment to save it.";
    body.appendChild(empty);
    return;
  }

  // Render current page
  const start = currentPage * PAGE_SIZE;
  const page = sorted.slice(start, start + PAGE_SIZE);

  for (const { id, data } of page) {
    const item = document.createElement("div");
    item.className = "hwt-bookmark-item";

    const link = document.createElement("a");
    link.className = "hwt-bookmark-item-content";
    link.href = `https://news.ycombinator.com/item?id=${id}`;
    link.target = "_blank";

    // Post title
    const titleDiv = document.createElement("div");
    titleDiv.className = "hwt-bookmark-item-title";
    titleDiv.textContent = data?.title ?? `Comment #${id}`;
    link.appendChild(titleDiv);

    // Author · time ago
    const metaDiv = document.createElement("div");
    metaDiv.className = "hwt-bookmark-item-meta";
    const parts: string[] = [];
    if (data?.author) parts.push(data.author);
    if (data?.timestamp) parts.push(timeAgo(data.timestamp));
    metaDiv.textContent = parts.join(" \u00b7 ");
    link.appendChild(metaDiv);

    // Comment text preview
    if (data?.text) {
      const textDiv = document.createElement("div");
      textDiv.className = "hwt-bookmark-item-text";
      textDiv.textContent = data.text;
      link.appendChild(textDiv);
    }

    item.appendChild(link);

    const removeBtn = document.createElement("button");
    removeBtn.className = "hwt-bookmark-item-remove";
    removeBtn.setAttribute("data-id", id);
    removeBtn.textContent = "\u00d7";
    removeBtn.title = "Remove bookmark";
    item.appendChild(removeBtn);

    body.appendChild(item);
  }

  // Pagination footer (only if more than one page)
  if (totalPages > 1) {
    const nav = document.createElement("div");
    nav.className = "hwt-bookmarks-nav";

    const prevBtn = document.createElement("button");
    prevBtn.className = "hwt-bookmarks-nav-btn";
    prevBtn.textContent = "\u2039";
    prevBtn.disabled = currentPage === 0;
    prevBtn.setAttribute("data-dir", "prev");
    nav.appendChild(prevBtn);

    const indicator = document.createElement("span");
    indicator.className = "hwt-bookmarks-nav-indicator";
    indicator.textContent = `${currentPage + 1} / ${totalPages}`;
    nav.appendChild(indicator);

    const nextBtn = document.createElement("button");
    nextBtn.className = "hwt-bookmarks-nav-btn";
    nextBtn.textContent = "\u203a";
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.setAttribute("data-dir", "next");
    nav.appendChild(nextBtn);

    body.appendChild(nav);
  }
}

/**
 * Create the toggle button
 */
export function createToggleButton(): void {
  if (qs(`.${TOGGLE_CLASS}`)) return;

  const toggle = document.createElement("button");
  toggle.className = TOGGLE_CLASS;
  toggle.innerHTML = "\u2606";
  toggle.title = "View bookmarks";

  document.body.appendChild(toggle);
  updateToggleCount();
}
