import { injectStyles } from "./styles";
import { getConfigStore, isFeatureEnabled } from "../../../../config";
import { injectStoryLinks, injectCommentPageLink, removeItemLinks } from "./ui";

let ready = false;
let subscribed = false;

export function initItemLinks(): void {
  if (!ready) {
    injectStyles();
    ready = true;
  }

  if (isFeatureEnabled("hwebLinks", "hn")) {
    injectStoryLinks();
    injectCommentPageLink();
  } else {
    removeItemLinks();
  }

  if (!subscribed) {
    subscribed = true;
    getConfigStore().subscribe("features", "hwebLinks", initItemLinks);
    getConfigStore().subscribe("sites", "hn", initItemLinks);
  }
}
