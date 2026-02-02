import { createStyleInjector } from "../../../utils/style-injector";
import { isFeatureEnabled } from "../../../config";
import { syncThemeClass } from "../../../utils/theme-detector";
import { CSS_HACKERWEB, CSS_HN } from "./styles";

const DARK_CLASS = "hwt-dark";

const injectHackerwebStyles = createStyleInjector("hwt-dark-mode-hackerweb");
const injectHnStyles = createStyleInjector("hwt-dark-mode-hn");

let cleanup: (() => void) | null = null;

export function initDarkMode(site: "hackerweb" | "hn"): void {
  if (!isFeatureEnabled("darkModeSync", site)) {
    // Clean up if feature was disabled
    if (cleanup) {
      cleanup();
      cleanup = null;
      document.documentElement.classList.remove(DARK_CLASS);
    }
    return;
  }

  // Already initialized
  if (cleanup) return;

  // Inject site-specific styles
  if (site === "hackerweb") {
    injectHackerwebStyles(CSS_HACKERWEB);
  } else {
    injectHnStyles(CSS_HN);
  }

  // Sync with system preference
  cleanup = syncThemeClass(DARK_CLASS);
}
