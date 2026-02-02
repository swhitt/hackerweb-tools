import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { addInlinePreviews } from "./ui";

const injectStyles = createStyleInjector("hwt-inline-preview-styles");

export function initInlinePreview(): void {
  if (!isFeatureEnabled("inlinePreview", "hn")) return;

  injectStyles(CSS);
  addInlinePreviews();
}
