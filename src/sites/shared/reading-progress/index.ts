import { createStyleInjector } from "../../../utils/style-injector";
import { isFeatureEnabled } from "../../../config";
import { CSS } from "./styles";
import {
  createProgressBar,
  setupScrollListener,
  removeProgressBar,
} from "./ui";

const injectStyles = createStyleInjector("hwt-reading-progress-styles");

let cleanup: (() => void) | null = null;

export function initReadingProgress(site: "hackerweb" | "hn"): void {
  if (!isFeatureEnabled("readingProgress", site)) {
    // Clean up if feature was disabled
    if (cleanup) {
      cleanup();
      cleanup = null;
      removeProgressBar();
    }
    return;
  }

  // Already initialized
  if (cleanup) return;

  injectStyles(CSS);
  createProgressBar();
  cleanup = setupScrollListener();
}
