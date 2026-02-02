/**
 * Creates a debounced MutationObserver that batches DOM changes.
 * Uses requestAnimationFrame to coalesce multiple mutations.
 *
 * @param callback - Function to call when mutations are detected (after debounce)
 * @param target - The DOM node to observe (defaults to document.body)
 * @param options - MutationObserver options (defaults to childList + subtree)
 * @returns The created MutationObserver instance
 */
export function createDebouncedObserver(
  callback: () => void,
  target: Node = document.body,
  options: MutationObserverInit = { childList: true, subtree: true }
): MutationObserver {
  let pending = false;

  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      try {
        callback();
      } catch (error) {
        console.error("[HWT Observer] Error in mutation callback:", error);
      }
      pending = false;
    });
  });

  observer.observe(target, options);

  return observer;
}
