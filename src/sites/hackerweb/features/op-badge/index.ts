import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { injectOpBadges } from "./ui";

const injectStyles = createStyleInjector("hwt-op-badge-styles");

export function initOpBadge(): void {
  if (!isFeatureEnabled("opBadge", "hackerweb")) return;

  injectStyles(CSS);
  injectOpBadges();
}
