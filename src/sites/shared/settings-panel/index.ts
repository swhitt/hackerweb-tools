import { createStyleInjector } from "../../../utils/style-injector";
import { CSS } from "./styles";
import {
  createGearButton,
  createOverlay,
  createPanel,
  registerKeyboardShortcuts,
} from "./ui";

const injectStyles = createStyleInjector("hwt-settings-panel-styles");

let initialized = false;

/**
 * Initialize the settings panel.
 * This should be called once on page load.
 */
export function initSettingsPanel(): void {
  if (initialized) return;
  initialized = true;

  injectStyles(CSS);
  createGearButton();
  createOverlay();
  createPanel();
  registerKeyboardShortcuts();
}
