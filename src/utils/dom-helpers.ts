/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters -- standard DOM helper pattern */

/** Type-safe querySelector wrapper. */
export function qs<T extends Element = Element>(
  sel: string,
  root: Element | Document = document
): T | null {
  return root.querySelector(sel);
}

/** Type-safe querySelectorAll wrapper. */
export function qsa<T extends Element = Element>(
  sel: string,
  root: Element | Document = document
): NodeListOf<T> {
  return root.querySelectorAll(sel);
}

/* eslint-enable @typescript-eslint/no-unnecessary-type-parameters */

/**
 * Safely get the Element from an event target with proper type checking.
 * Returns null if target is not an Element.
 */
export function getEventTargetElement(event: Event): Element | null {
  const target = event.target;
  return target instanceof Element ? target : null;
}
