import { createDebouncedObserver } from "../../utils/observer-factory";
import { initHeaderLink } from "./features/header-link";
import { initItemLinks } from "./features/item-links";

export function init(): void {
  initHeaderLink();
  initItemLinks();
  createDebouncedObserver(() => initItemLinks());
}
