import { getConfigStore } from "../../../../config";
import { createStyleInjector } from "../../../../utils/style-injector";
import { CSS } from "./styles";

const READABILITY_CLASS = "hwt-hackerweb-readable";
const injectStyles = createStyleInjector("hwt-hackerweb-readability");
let subscribed = false;

function syncDisplaySettings(): void {
  const store = getConfigStore();
  const root = document.documentElement;

  root.style.setProperty(
    "--hwt-max-width",
    `${store.get("display", "maxContentWidth")}px`
  );
  root.style.setProperty(
    "--hwt-font-size",
    `${store.get("display", "fontSize")}px`
  );
  root.style.setProperty(
    "--hwt-line-height",
    String(store.get("display", "commentLineHeight"))
  );
}

function reconcileReadability(): void {
  const enabled = getConfigStore().get("sites", "hackerweb").enabled;
  document.documentElement.classList.toggle(READABILITY_CLASS, enabled);

  if (enabled) syncDisplaySettings();
}

export function initReadability(): void {
  injectStyles(CSS);
  reconcileReadability();

  if (subscribed) return;
  subscribed = true;

  const store = getConfigStore();
  store.subscribe("display", "maxContentWidth", reconcileReadability);
  store.subscribe("display", "fontSize", reconcileReadability);
  store.subscribe("display", "commentLineHeight", reconcileReadability);
  store.subscribe("sites", "hackerweb", reconcileReadability);
}
