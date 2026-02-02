/**
 * System dark mode detection and synchronization.
 */

/**
 * Check if the system prefers dark mode
 */
function prefersDarkMode(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Apply a class to the document based on dark mode preference
 */
export function syncThemeClass(
  darkClass: string,
  lightClass?: string
): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const apply = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add(darkClass);
      if (lightClass) {
        document.documentElement.classList.remove(lightClass);
      }
    } else {
      document.documentElement.classList.remove(darkClass);
      if (lightClass) {
        document.documentElement.classList.add(lightClass);
      }
    }
  };

  // Apply immediately
  apply(prefersDarkMode());

  // Subscribe to changes
  const handler = (e: MediaQueryListEvent) => apply(e.matches);
  mediaQuery.addEventListener("change", handler);

  return () => mediaQuery.removeEventListener("change", handler);
}
