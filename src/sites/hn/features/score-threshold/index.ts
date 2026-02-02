import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { applyScoreThresholds } from "./ui";

const injectStyles = createStyleInjector("hwt-score-threshold-styles");

export function initScoreThreshold(): void {
  if (!isFeatureEnabled("scoreThreshold", "hn")) return;

  injectStyles(CSS);
  applyScoreThresholds();
}
