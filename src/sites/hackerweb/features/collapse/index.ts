import { injectStyles } from "./styles";
import { injectButtons, setupEventListeners } from "./ui";

let ready = false;

export function initCollapse(): void {
  if (!ready) {
    injectStyles();
    setupEventListeners();
    ready = true;
  }
  injectButtons();
}
