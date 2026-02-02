import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { markNewComments, injectNewCountBadge } from "./ui";

const injectStyles = createStyleInjector("hwt-new-comments-styles");

export function initNewComments(): void {
  if (!isFeatureEnabled("newCommentHighlight", "hackerweb")) return;

  injectStyles(CSS);
  const newCount = markNewComments();
  injectNewCountBadge(newCount);
}
