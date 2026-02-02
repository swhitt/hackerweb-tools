import { qsa, qs } from "../../../../utils/dom-helpers";
import { getThreshold } from "../../../../config";

const SEL = {
  comments: "section li",
  toggle: ":scope > button.hwc-toggle",
  replies: ":scope > ul",
} as const;

const AUTO_COLLAPSED_ATTR = "data-auto-collapsed";

/**
 * Get the nesting depth of a comment (0 = top level)
 */
function getCommentDepth(li: HTMLLIElement): number {
  let depth = 0;
  let parent = li.parentElement?.closest("li");

  while (parent) {
    depth++;
    parent = parent.parentElement?.closest("li");
  }

  return depth;
}

/**
 * Auto-collapse comments at or beyond the threshold depth
 */
export function collapseByDepth(): void {
  const threshold = getThreshold("autoCollapseDepth");

  for (const li of qsa<HTMLLIElement>(SEL.comments)) {
    // Skip if already processed
    if (li.hasAttribute(AUTO_COLLAPSED_ATTR)) continue;

    const depth = getCommentDepth(li);

    // Check if at or beyond threshold
    if (depth >= threshold) {
      const toggle = qs<HTMLButtonElement>(SEL.toggle, li);
      const replies = qs(SEL.replies, li);

      // Only auto-collapse if there's a toggle button and replies
      if (toggle && replies) {
        // Check if not already collapsed (by user preference)
        const isCollapsed = toggle.dataset["collapsed"] === "true";

        if (!isCollapsed) {
          // Trigger collapse
          toggle.click();
          li.setAttribute(AUTO_COLLAPSED_ATTR, "true");
        }
      }
    }

    // Mark as processed even if not collapsed
    li.setAttribute(AUTO_COLLAPSED_ATTR, depth >= threshold ? "true" : "false");
  }
}
