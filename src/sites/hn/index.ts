import { initHeaderLink } from "./features/header-link";
import { initItemLinks } from "./features/item-links";

export function init() {
  initHeaderLink();
  initItemLinks();
  observeChanges();
}

function observeChanges() {
  let pending = false;

  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      initItemLinks();
      pending = false;
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
