import { createStyleInjector } from "../../../utils/style-injector";
import { getConfigStore } from "../../../config";
import type { ThemeMode } from "../../../config";
import { syncThemeClass } from "../../../utils/theme-detector";
import { CSS_HACKERWEB, CSS_HN } from "./styles";

const DARK_CLASS = "hwt-dark";

const injectHackerwebStyles = createStyleInjector("hwt-dark-mode-hackerweb");
const injectHnStyles = createStyleInjector("hwt-dark-mode-hn");

let cleanup: (() => void) | null = null;
let activeSite: "hackerweb" | "hn" | null = null;
let subscribed = false;
let appliedMode: ThemeMode | null = null;
let appliedSite: "hackerweb" | "hn" | null = null;

function applyTheme(site: "hackerweb" | "hn", mode: ThemeMode): void {
  if (appliedSite === site && appliedMode === mode) return;

  cleanup?.();
  cleanup = null;

  if (site === "hackerweb") {
    injectHackerwebStyles(CSS_HACKERWEB);
  } else {
    injectHnStyles(CSS_HN);
  }

  if (mode === "system") {
    cleanup = syncThemeClass(DARK_CLASS);
  } else {
    document.documentElement.classList.toggle(DARK_CLASS, mode === "dark");
  }
  appliedSite = site;
  appliedMode = mode;
}

function disableDarkMode(): void {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
  document.documentElement.classList.remove(DARK_CLASS);
  appliedSite = null;
  appliedMode = null;
}

export function initDarkMode(site: "hackerweb" | "hn"): void {
  activeSite = site;
  reconcileDarkMode();

  if (subscribed) return;
  subscribed = true;

  const store = getConfigStore();
  store.subscribe("display", "themeMode", reconcileDarkMode);
  store.subscribe("sites", site, reconcileDarkMode);
}

function reconcileDarkMode(): void {
  if (!activeSite || !getConfigStore().get("sites", activeSite).enabled) {
    disableDarkMode();
    return;
  }

  applyTheme(activeSite, getConfigStore().get("display", "themeMode"));
}
