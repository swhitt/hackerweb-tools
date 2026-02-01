import { injectStyles } from "./styles";
import { injectStoryLinks, injectCommentPageLink } from "./ui";

let ready = false;

export function initItemLinks(): void {
  if (!ready) {
    injectStyles();
    ready = true;
  }
  injectStoryLinks();
  injectCommentPageLink();
}
