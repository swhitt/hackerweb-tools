declare function GM_addStyle(css: string): void;

/**
 * Creates a style injector function for a given CSS content and element ID.
 * Supports userscript environments with GM_addStyle, falls back to DOM injection.
 *
 * @param styleId - The ID to assign to the injected <style> element (used for DOM fallback)
 * @returns A function that takes CSS content and injects it once
 */
export function createStyleInjector(styleId: string): (css: string) => void {
  let injected = false;

  return (css: string): void => {
    if (injected) return;
    injected = true;

    if (typeof GM_addStyle === "function") {
      GM_addStyle(css);
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  };
}
