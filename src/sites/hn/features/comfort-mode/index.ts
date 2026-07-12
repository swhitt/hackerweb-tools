import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled, getConfigStore } from "../../../../config";
import { CSS } from "./styles";
import { applyComfortMode, removeComfortMode } from "./ui";

const injectStyles = createStyleInjector("hwt-comfort-mode");
let subscribed = false;

function reconcileComfortMode(): void {
  if (isFeatureEnabled("comfortMode", "hn")) {
    applyComfortMode();
  } else {
    removeComfortMode();
  }
}

export function initComfortMode(): void {
  injectStyles(CSS);
  reconcileComfortMode();

  if (subscribed) return;
  subscribed = true;

  const store = getConfigStore();
  store.subscribe("features", "comfortMode", reconcileComfortMode);
  store.subscribe("sites", "hn", reconcileComfortMode);
}
