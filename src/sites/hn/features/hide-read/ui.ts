import { qsa, qs, getEventTargetElement } from "../../../../utils/dom-helpers";
import { hasVisited, recordVisit } from "../../../../utils/visit-tracker";

const SEL = {
  storyRow: "tr.athing",
  titleLink: ".titleline > a",
  commentsLink: 'a[href^="item?id="]',
  subtextRow: "tr.athing + tr",
  pagetop: "#hnmain td.pagetop",
} as const;

const VISITED_ATTR = "data-visited";
const TOGGLE_CLASS = "hwt-hide-read-toggle";
const HIDE_CLASS = "hwt-hide-read";

let hideEnabled = false;

/**
 * Get the item ID from a story row
 */
function getStoryId(row: HTMLTableRowElement): string | null {
  return row.id || null;
}

/**
 * Mark visited stories
 */
export function markVisitedStories(): void {
  for (const row of qsa<HTMLTableRowElement>(SEL.storyRow)) {
    const id = getStoryId(row);
    if (!id) continue;

    if (hasVisited(id)) {
      row.setAttribute(VISITED_ATTR, "true");
    }
  }
}

/**
 * Track when user clicks on a story
 */
function handleStoryClick(id: string): void {
  recordVisit(id);

  // Mark as visited immediately
  const row = document.getElementById(id);
  if (row) {
    row.setAttribute(VISITED_ATTR, "true");
  }
}

/**
 * Set up click tracking for stories
 */
export function setupClickTracking(): void {
  document.addEventListener("click", (e) => {
    const target = getEventTargetElement(e);
    if (!target) return;

    // Check if clicking a story title link
    const titleLink = target.closest(SEL.titleLink);
    if (titleLink) {
      const row = titleLink.closest<HTMLTableRowElement>("tr.athing");
      const id = row ? getStoryId(row) : null;
      if (id) handleStoryClick(id);
      return;
    }

    // Check if clicking a comments link
    const commentsLink = target.closest(SEL.commentsLink);
    if (commentsLink) {
      const subtextRow = commentsLink.closest("tr");
      const storyRow = subtextRow?.previousElementSibling;
      if (storyRow instanceof HTMLTableRowElement) {
        const id = getStoryId(storyRow);
        if (id) handleStoryClick(id);
      }
    }
  });
}

/**
 * Toggle hiding of read stories
 */
function toggleHideRead(): void {
  hideEnabled = !hideEnabled;
  document.body.classList.toggle(HIDE_CLASS, hideEnabled);

  const toggle = qs(`.${TOGGLE_CLASS}`);
  if (toggle) {
    toggle.classList.toggle("active", hideEnabled);
    toggle.textContent = hideEnabled ? "show read" : "hide read";
  }
}

/**
 * Add toggle button to the page header
 */
export function injectToggleButton(): void {
  const pagetop = qs(SEL.pagetop);
  if (!pagetop) return;

  // Check if already injected
  if (qs(`.${TOGGLE_CLASS}`, pagetop)) return;

  const toggle = document.createElement("span");
  toggle.className = TOGGLE_CLASS;
  toggle.textContent = "hide read";
  toggle.title = "Toggle hiding of read stories";
  toggle.addEventListener("click", toggleHideRead);

  pagetop.appendChild(toggle);
}
