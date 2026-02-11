import { createStyleInjector } from "../../../utils/style-injector";
import { isFeatureEnabled, getConfigStore } from "../../../config";
import { syncThemeClass } from "../../../utils/theme-detector";
import { CSS_HACKERWEB, CSS_HN } from "./styles";

const DARK_CLASS = "hwt-dark";

const injectHackerwebStyles = createStyleInjector("hwt-dark-mode-hackerweb");
const injectHnStyles = createStyleInjector("hwt-dark-mode-hn");

let cleanup: (() => void) | null = null;

function enableDarkMode(site: "hackerweb" | "hn"): void {
  if (cleanup) return;

  if (site === "hackerweb") {
    injectHackerwebStyles(CSS_HACKERWEB);
  } else {
    injectHnStyles(CSS_HN);
  }

  cleanup = syncThemeClass(DARK_CLASS);
}

function disableDarkMode(): void {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  document.documentElement.classList.remove(DARK_CLASS);
}

export function initDarkMode(site: "hackerweb" | "hn"): void {
  if (isFeatureEnabled("darkModeSync", site)) {
    enableDarkMode(site);
  }

  // React to config changes for live toggle
  getConfigStore().subscribe("features", "darkModeSync", (enabled) => {
    if (enabled) {
      enableDarkMode(site);
    } else {
      disableDarkMode();
    }
  });
}
