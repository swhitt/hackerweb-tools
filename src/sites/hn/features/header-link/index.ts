import { injectHeaderLink } from "./ui";

let done = false;

export function initHeaderLink(): void {
  if (done) return;
  done = true;
  injectHeaderLink();
}
