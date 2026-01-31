import { initCollapse } from "./features/collapse";

export function init() {
  initCollapse();
  observeChanges();

  window.addEventListener("hashchange", () => initCollapse());
}

function observeChanges() {
  let pending = false;

  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      initCollapse();
      pending = false;
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
