import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled, getConfigStore } from "../../../../config";
import { CSS } from "./styles";
import { applyComfortMode, removeComfortMode } from "./ui";

const injectStyles = createStyleInjector("hwt-comfort-mode");

export function initComfortMode(): void {
  injectStyles(CSS);

  if (isFeatureEnabled("comfortMode", "hn")) {
    applyComfortMode();
  }

  // React to config changes
  getConfigStore().subscribe("features", "comfortMode", (enabled) => {
    if (enabled) {
      applyComfortMode();
    } else {
      removeComfortMode();
    }
  });
}
