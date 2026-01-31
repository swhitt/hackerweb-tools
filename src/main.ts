import { initCollapse } from "./features/collapse";

function main() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}

function init() {
  initCollapse();
  observeChanges();
}

function observeChanges() {
  let pending = false;

  const observer = new MutationObserver(() => {
    // Debounce: batch rapid mutations into a single initCollapse call
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      initCollapse();
      pending = false;
    });
  });

  // Watch for DOM changes - handles both SPA navigation and HW's native toggle
  observer.observe(document.body, { childList: true, subtree: true });
}

main();
