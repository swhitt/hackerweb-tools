import { createStyleInjector } from "../../../utils/style-injector";
import { isFeatureEnabled } from "../../../config";
import { CSS } from "./styles";
import { addSavedButtons, setupSavedHandler } from "./ui";

const injectStyles = createStyleInjector("hwt-comment-bookmarks-styles");

let handlerInitialized = false;

export function initCommentBookmarks(site: "hackerweb" | "hn"): void {
  if (!isFeatureEnabled("commentBookmarks", site)) return;

  injectStyles(CSS);
  addSavedButtons(site);

  if (!handlerInitialized) {
    setupSavedHandler(site);
    handlerInitialized = true;
  }
}

export { createSavedView, getSavedCount } from "./ui";
export { SAVED_CHANGE_EVENT } from "./store";
