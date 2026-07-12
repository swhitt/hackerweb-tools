import { qs, qsa } from "../../../../utils/dom-helpers";

const SEL = {
  /** Main story info section */
  storyHeader: "header .story",
  /** Link to author profile */
  authorLink: 'a[href^="/user/"]',
  /** All comments */
  comments: "#view-comments section.comments li",
  /** Comment author link */
  commentAuthor: 'p.metadata a[href^="/user/"]',
  /** HackerWeb's native original-poster marker */
  nativeOp: "#view-comments section.comments li p.metadata .user.op",
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
function addBadge(authorElement: Element): void {
  const badge = document.createElement("span");
  badge.className = OP_BADGE_CLASS;
  badge.textContent = "OP";
  badge.title = "Original Poster";
  authorElement.insertAdjacentElement("afterend", badge);
}

/**
 * Inject OP badges into comments by the story author
 */
export function injectOpBadges(): void {
  // Current HackerWeb already identifies OP authors with `.user.op`. Enhance
  // that canonical marker instead of adding a duplicate badge.
  for (const nativeOp of qsa<HTMLElement>(SEL.nativeOp)) {
    const comment = nativeOp.closest("li");
    if (!comment) continue;

    comment.setAttribute(OP_DATA_ATTR, "true");
  }

  // Keep support for older HackerWeb markup that used /user/:name links.
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
