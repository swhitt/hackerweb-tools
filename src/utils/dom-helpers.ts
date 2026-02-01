/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters -- standard DOM helper pattern */

/** Type-safe querySelector. */
export function qs<T extends Element = Element>(
  sel: string,
  root: Element | Document = document
): T | null {
  return root.querySelector(sel);
}

/** Type-safe querySelectorAll. */
export function qsa<T extends Element = Element>(
  sel: string,
  root: Element | Document = document
): NodeListOf<T> {
  return root.querySelectorAll(sel);
}

/* eslint-enable @typescript-eslint/no-unnecessary-type-parameters */

/** Safely extract Element from event target. */
export function getEventTargetElement(event: Event): Element | null {
  return event.target instanceof Element ? event.target : null;
}

/** Set a boolean data attribute. */
export function setDataBool(
  el: HTMLElement,
  key: string,
  value: boolean
): void {
  el.dataset[key] = String(value);
}

/** Get a boolean data attribute (returns false if missing or not "true"). */
export function getDataBool(el: HTMLElement | null, key: string): boolean {
  return el?.dataset[key] === "true";
}
