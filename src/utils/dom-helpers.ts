/**
 * Type-safe querySelector wrapper.
 */
export const qs = <T extends Element>(
  sel: string,
  root: Element | Document = document
): T | null => root.querySelector(sel);

/**
 * Type-safe querySelectorAll wrapper.
 */
export const qsa = <T extends Element>(
  sel: string,
  root: Element | Document = document
): NodeListOf<T> => root.querySelectorAll(sel);

/**
 * Safely get the Element from an event target with proper type checking.
 * Returns null if target is not an Element.
 */
export function getEventTargetElement(event: Event): Element | null {
  const target = event.target;
  return target instanceof Element ? target : null;
}
