import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import {
  markVisitedStories,
  setupClickTracking,
  injectToggleButton,
} from "./ui";

const injectStyles = createStyleInjector("hwt-hide-read-styles");

let trackingInitialized = false;

export function initHideRead(): void {
  if (!isFeatureEnabled("hideReadStories", "hn")) return;

  injectStyles(CSS);
  markVisitedStories();
  injectToggleButton();

  if (!trackingInitialized) {
    setupClickTracking();
    trackingInitialized = true;
  }
}
