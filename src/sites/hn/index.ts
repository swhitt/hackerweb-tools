import { createDebouncedObserver } from "../../utils/observer-factory";
import { getKeyboardManager } from "../../utils/keyboard-manager";
import { initHeaderLink } from "./features/header-link";
import { initItemLinks } from "./features/item-links";
import { initScoreThreshold } from "./features/score-threshold";
import { initHideRead } from "./features/hide-read";
import { initKeyboardNav } from "./features/keyboard-nav";
import { initTimeGrouping } from "./features/time-grouping";
import { initInlinePreview } from "./features/inline-preview";
import { initComfortMode } from "./features/comfort-mode";
import { initDarkMode } from "../shared/dark-mode";
import { initReadingProgress } from "../shared/reading-progress";
import { initCommentBookmarks } from "../shared/comment-bookmarks";

const SITE = "hn" as const;

/**
 * Initialize features that need re-running on DOM changes
 */
function initDynamicFeatures(): void {
  initItemLinks();
  initScoreThreshold();
  initHideRead();
  initTimeGrouping();
  initInlinePreview();
  initCommentBookmarks(SITE);
}

export function init(): void {
  // Set keyboard scope for this site
  getKeyboardManager().setScope(SITE);

  // Initialize features that only need to run once
  initHeaderLink();
  initDarkMode(SITE);
  initComfortMode();
  initReadingProgress(SITE);
  initKeyboardNav();

  // Initialize dynamic features
  initDynamicFeatures();

  // Re-run dynamic features on DOM changes
  createDebouncedObserver(initDynamicFeatures);
}
