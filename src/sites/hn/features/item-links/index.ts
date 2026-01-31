import { injectStyles } from "./styles";
import { injectStoryLinks, injectCommentPageLink } from "./ui";

let stylesInitialized = false;

export function initItemLinks(): void {
  if (!stylesInitialized) {
    injectStyles();
    stylesInitialized = true;
  }

  // Inject links - these are idempotent (won't double-inject)
  injectStoryLinks();
  injectCommentPageLink();
}
