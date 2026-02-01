import { injectStyles } from "./styles";
import { injectButtons, setupEventListeners } from "./ui";

let initialized = false;

export function initCollapse(): void {
  if (!initialized) {
    injectStyles();
    setupEventListeners();
    initialized = true;
  }

  injectButtons();
}
