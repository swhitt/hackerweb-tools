import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { injectDeepLinks, setupDeepLinkHandler } from "./ui";

const injectStyles = createStyleInjector("hwt-deep-link-styles");

let handlerInitialized = false;

export function initDeepLink(): void {
  if (!isFeatureEnabled("deepLink", "hackerweb")) return;

  injectStyles(CSS);
  injectDeepLinks();

  if (!handlerInitialized) {
    setupDeepLinkHandler();
    handlerInitialized = true;
  }
}
