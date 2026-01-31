import { initHeaderLink } from "./features/header-link";
import { initItemLinks } from "./features/item-links";

function main() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

function init() {
  initHeaderLink();
  initItemLinks();
  observeChanges();
}

function observeChanges() {
  let pending = false;

  const observer = new MutationObserver(() => {
    // Debounce: batch rapid mutations into a single init call
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      initItemLinks();
      pending = false;
    });
  });

  // Watch for DOM changes - handles infinite scroll and dynamic loading
  observer.observe(document.body, { childList: true, subtree: true });
}

main();
