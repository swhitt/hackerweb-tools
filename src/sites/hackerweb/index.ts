import { createDebouncedObserver } from "../../utils/observer-factory";
import { initCollapse } from "./features/collapse";

export function init(): void {
  initCollapse();
  createDebouncedObserver(() => initCollapse());

  window.addEventListener("hashchange", () => initCollapse());
}
