/**
 * Scroll position utilities.
 */

/**
 * Scroll to an element, optionally with an offset
 */
export function scrollToElement(
  element: Element,
  offset = 0,
  behavior: ScrollBehavior = "smooth"
): void {
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior,
  });
}

/**
 * Check if an element is in the viewport
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
