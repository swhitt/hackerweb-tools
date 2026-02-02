import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { collapseByDepth } from "./ui";

const injectStyles = createStyleInjector("hwt-collapse-depth-styles");

export function initCollapseDepth(): void {
  if (!isFeatureEnabled("collapseByDepth", "hackerweb")) return;

  injectStyles(CSS);
  collapseByDepth();
}
