import { injectHeaderLink } from "./ui";

let initialized = false;

export function initHeaderLink(): void {
  if (initialized) return;
  initialized = true;

  injectHeaderLink();
}
