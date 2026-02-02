import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { addTimeGrouping } from "./ui";

const injectStyles = createStyleInjector("hwt-time-grouping-styles");

export function initTimeGrouping(): void {
  if (!isFeatureEnabled("timeGrouping", "hn")) return;

  injectStyles(CSS);
  addTimeGrouping();
}
