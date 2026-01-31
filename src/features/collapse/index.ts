import { injectStyles } from "./styles";
import { addCollapseButtons } from "./ui";

let initialized = false;

export function initCollapse() {
  if (!initialized) {
    injectStyles();
    initialized = true;
  }

  addCollapseButtons();
}
