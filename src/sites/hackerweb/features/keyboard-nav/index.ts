import { createStyleInjector } from "../../../../utils/style-injector";
import { isFeatureEnabled } from "../../../../config";
import { CSS } from "./styles";
import { registerKeyboardShortcuts } from "./ui";

const injectStyles = createStyleInjector("hwt-keyboard-nav-styles");

let cleanup: (() => void) | null = null;

export function initKeyboardNav(): void {
  if (!isFeatureEnabled("keyboardNav", "hackerweb")) {
    // Clean up if feature was disabled
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    return;
  }

  // Already initialized
  if (cleanup) return;

  injectStyles(CSS);
  cleanup = registerKeyboardShortcuts();
}
