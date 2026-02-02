import { qsa, qs } from "../../../../utils/dom-helpers";
import { MapState } from "../../../../config/state";

const SEL = {
  comments: "section li",
  timeLink: 'p.metadata time a[href*="item?id="]',
  timeElement: "p.metadata time",
  header: "header .story",
  storyLink: 'header .story a[href*="item?id="]',
} as const;

const NEW_ATTR = "data-is-new";
const NEW_COUNT_CLASS = "hwt-new-count";

// Track last visit time for each story
const lastVisitState = new MapState<string, number>(
  "lastVisit",
  (v): v is number => typeof v === "number"
);

/**
 * Get the story ID from the current page
 */
function getStoryId(): string | null {
  const storyLink = qs<HTMLAnchorElement>(SEL.storyLink);
  if (!storyLink) return null;

  const href = storyLink.getAttribute("href");
  const match = href?.match(/item\?id=(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Parse a relative time string like "2 hours ago" to approximate timestamp
 */
function parseRelativeTime(timeText: string): number | null {
  const now = Date.now();
  const text = timeText.toLowerCase().trim();

  // Match patterns like "2 hours ago", "1 day ago", "30 minutes ago"
  const match =
    /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/.exec(text);
  if (!match?.[1] || !match[2]) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
  };

  const multiplier = multipliers[unit];
  if (!multiplier) return null;

  return now - value * multiplier;
}

/**
 * Get approximate post time from comment's time element
 */
function getCommentTime(li: HTMLLIElement): number | null {
  const timeEl = qs(SEL.timeElement, li);
  if (!timeEl) return null;

  const timeText = timeEl.textContent;
  if (!timeText) return null;

  return parseRelativeTime(timeText);
}

/**
 * Mark new comments based on last visit time
 */
export function markNewComments(): number {
  const storyId = getStoryId();
  if (!storyId) return 0;

  const lastVisit = lastVisitState.get(storyId);
  const now = Date.now();

  // Update last visit time
  lastVisitState.set(storyId, now);

  // If no previous visit, no comments are "new"
  if (!lastVisit) return 0;

  let newCount = 0;

  for (const li of qsa<HTMLLIElement>(SEL.comments)) {
    // Skip if already processed
    if (li.hasAttribute(NEW_ATTR)) continue;

    const commentTime = getCommentTime(li);
    if (!commentTime) continue;

    const isNew = commentTime > lastVisit;
    li.setAttribute(NEW_ATTR, String(isNew));

    if (isNew) newCount++;
  }

  return newCount;
}

/**
 * Add new comment count indicator to header
 */
export function injectNewCountBadge(count: number): void {
  if (count === 0) return;

  const header = qs(SEL.header);
  if (!header) return;

  // Remove existing badge
  qs(`.${NEW_COUNT_CLASS}`, header)?.remove();

  const badge = document.createElement("span");
  badge.className = NEW_COUNT_CLASS;
  badge.textContent = `${count} new`;
  badge.title = `${count} new comment${count === 1 ? "" : "s"} since your last visit`;

  header.appendChild(badge);
}
