import { qs, qsa } from "../../../../utils/dom-helpers";

const SEL = {
  /** Main story info section */
  storyHeader: "header .story",
  /** Link to author profile */
  authorLink: 'a[href^="/user/"]',
  /** All comments */
  comments: "section li",
  /** Comment author link */
  commentAuthor: 'p.metadata a[href^="/user/"]',
} as const;

const OP_BADGE_CLASS = "hwt-op-badge";
const OP_DATA_ATTR = "data-is-op";

/**
 * Get the username of the story's original poster
 */
function getStoryAuthor(): string | null {
  const storyHeader = qs(SEL.storyHeader);
  if (!storyHeader) return null;

  const authorLink = qs<HTMLAnchorElement>(SEL.authorLink, storyHeader);
  if (!authorLink) return null;

  // Extract username from href like "/user/username"
  const href = authorLink.getAttribute("href");
  const match = href?.match(/^\/user\/(.+)$/);
  return match?.[1] ?? null;
}

/**
 * Check if an OP badge already exists
 */
function hasBadge(comment: Element): boolean {
  return !!qs(`.${OP_BADGE_CLASS}`, comment);
}

/**
 * Add OP badge to a comment
 */
function addBadge(authorLink: HTMLAnchorElement): void {
  const badge = document.createElement("span");
  badge.className = OP_BADGE_CLASS;
  badge.textContent = "OP";
  badge.title = "Original Poster";
  authorLink.insertAdjacentElement("afterend", badge);
}

/**
 * Inject OP badges into comments by the story author
 */
export function injectOpBadges(): void {
  const storyAuthor = getStoryAuthor();
  if (!storyAuthor) return;

  for (const comment of qsa<HTMLLIElement>(SEL.comments)) {
    // Skip if already processed
    if (hasBadge(comment)) continue;

    const authorLink = qs<HTMLAnchorElement>(SEL.commentAuthor, comment);
    if (!authorLink) continue;

    // Check if this comment is by the OP
    const href = authorLink.getAttribute("href");
    const match = href?.match(/^\/user\/(.+)$/);
    const commentAuthor = match?.[1];

    if (commentAuthor === storyAuthor) {
      addBadge(authorLink);
      comment.setAttribute(OP_DATA_ATTR, "true");
    }
  }
}
