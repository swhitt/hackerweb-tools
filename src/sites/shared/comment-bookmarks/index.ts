import { createStyleInjector } from "../../../utils/style-injector";
import { isFeatureEnabled } from "../../../config";
import { CSS } from "./styles";
import {
  addBookmarkButtons,
  setupBookmarkHandler,
  createToggleButton,
} from "./ui";

const injectStyles = createStyleInjector("hwt-comment-bookmarks-styles");

let handlerInitialized = false;

export function initCommentBookmarks(site: "hackerweb" | "hn"): void {
  if (!isFeatureEnabled("commentBookmarks", site)) return;

  injectStyles(CSS);
  addBookmarkButtons(site);
  createToggleButton();

  if (!handlerInitialized) {
    setupBookmarkHandler(site);
    handlerInitialized = true;
  }
}
