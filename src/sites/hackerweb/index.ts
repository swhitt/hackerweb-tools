import { createDebouncedObserver } from "../../utils/observer-factory";
import { getKeyboardManager } from "../../utils/keyboard-manager";
import { initCollapse } from "./features/collapse";
import { initOpBadge } from "./features/op-badge";
import { initDeepLink } from "./features/deep-link";
import { initNewComments } from "./features/new-comments";
import { initKeyboardNav } from "./features/keyboard-nav";
import { initCollapseDepth } from "./features/collapse-depth";
import { initDarkMode } from "../shared/dark-mode";
import { initReadingProgress } from "../shared/reading-progress";
import { initCommentBookmarks } from "../shared/comment-bookmarks";

const SITE = "hackerweb" as const;

/**
 * Initialize all features (for re-running on DOM changes)
 */
function initFeatures(): void {
  initCollapse();
  initOpBadge();
  initDeepLink();
  initNewComments();
  initCollapseDepth();
  initCommentBookmarks(SITE);
}

export function init(): void {
  // Set keyboard scope for this site
  getKeyboardManager().setScope(SITE);

  // Initialize features that only need to run once
  initDarkMode(SITE);
  initReadingProgress(SITE);
  initKeyboardNav();

  // Initialize all features
  initFeatures();

  // Re-run on DOM changes
  createDebouncedObserver(initFeatures);

  // Re-run on hash changes (SPA navigation)
  window.addEventListener("hashchange", initFeatures);
}
