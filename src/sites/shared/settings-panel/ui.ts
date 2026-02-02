import { getConfigStore, STORAGE_KEY } from "../../../config";
import { fullVersion } from "../../../../config";
import type { Thresholds, Display } from "../../../config/types";
import {
  FEATURE_GROUPS,
  FEATURE_LABELS,
  THRESHOLD_LABELS,
  DISPLAY_LABELS,
} from "./feature-groups";

let panelElement: HTMLDivElement | null = null;
let overlayElement: HTMLDivElement | null = null;
let isOpen = false;

// Animation duration in ms (must match CSS animation: hwt-pulse 0.4s)
const PULSE_ANIMATION_MS = 400;

// Note: These SVG strings are hardcoded constants and must never accept external input
const GEAR_ICON = `<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
</svg>`;

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M18 6L6 18M6 6l12 12"/>
</svg>`;

/**
 * Check if this is a first-time user (no config in localStorage)
 */
function isFirstTimeUser(): boolean {
  return localStorage.getItem(STORAGE_KEY) === null;
}

/**
 * Check if dark mode is enabled
 */
function isDarkMode(): boolean {
  if (document.documentElement.classList.contains("hwt-dark")) {
    return true;
  }
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

// ============================================================================
// DRY Helpers
// ============================================================================

/**
 * Create a settings section with title and content
 */
function createSection(
  title: string,
  buildContent: () => HTMLElement[]
): HTMLDivElement {
  const section = document.createElement("div");
  section.className = "hwt-settings-section";

  const titleEl = document.createElement("h3");
  titleEl.className = "hwt-settings-section-title";
  titleEl.textContent = title;
  section.appendChild(titleEl);

  for (const element of buildContent()) {
    section.appendChild(element);
  }

  return section;
}

/**
 * Create a settings group (card-like container)
 */
function createGroup(
  title: string | null,
  rows: HTMLElement[]
): HTMLDivElement {
  const group = document.createElement("div");
  group.className = "hwt-settings-group";

  if (title) {
    const groupTitle = document.createElement("h4");
    groupTitle.className = "hwt-settings-group-title";
    groupTitle.textContent = title;
    group.appendChild(groupTitle);
  }

  for (const row of rows) {
    group.appendChild(row);
  }

  return group;
}

/**
 * Rebuild the panel content with all settings sections
 */
function rebuildPanelContent(container: HTMLElement): void {
  container.innerHTML = "";
  container.appendChild(createSitesSection());
  container.appendChild(createFeaturesSection());
  container.appendChild(createThresholdsSection());
  container.appendChild(createDisplaySection());
}

// ============================================================================
// UI Components
// ============================================================================

/**
 * Create the floating gear button
 */
export function createGearButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = "hwt-settings-gear";
  button.innerHTML = GEAR_ICON;
  button.setAttribute("aria-label", "Open settings");
  button.addEventListener("click", () => togglePanel());
  document.body.appendChild(button);
  return button;
}

/**
 * Create the overlay backdrop
 */
export function createOverlay(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = "hwt-settings-overlay";
  overlay.addEventListener("click", () => togglePanel(false));
  document.body.appendChild(overlay);
  overlayElement = overlay;
  return overlay;
}

/**
 * Create a toggle switch for boolean settings
 */
function createToggle(
  checked: boolean,
  onChange: (checked: boolean) => void
): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "hwt-toggle";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;

  const track = document.createElement("span");
  track.className = "hwt-toggle-track";

  const knob = document.createElement("span");
  knob.className = "hwt-toggle-knob";
  track.appendChild(knob);

  input.addEventListener("change", () => {
    onChange(input.checked);
    label.classList.add("hwt-pulse");
    setTimeout(() => label.classList.remove("hwt-pulse"), PULSE_ANIMATION_MS);
  });

  label.appendChild(input);
  label.appendChild(track);
  return label;
}

/**
 * Create a row for a toggle setting
 */
function createToggleRow(
  label: string,
  description: string,
  checked: boolean,
  onChange: (checked: boolean) => void
): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "hwt-settings-row";

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("p");
  labelEl.className = "hwt-settings-row-label";
  labelEl.textContent = label;

  const descEl = document.createElement("p");
  descEl.className = "hwt-settings-row-description";
  descEl.textContent = description;

  info.appendChild(labelEl);
  info.appendChild(descEl);
  row.appendChild(info);
  row.appendChild(createToggle(checked, onChange));

  return row;
}

/**
 * Create a number input for numeric settings
 */
function createNumberInput(
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "number";
  input.className = "hwt-number-input";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);

  input.addEventListener("change", () => {
    const newValue = Math.min(max, Math.max(min, Number(input.value)));
    input.value = String(newValue);
    onChange(newValue);
  });

  return input;
}

/**
 * Create a row for a number setting
 */
function createNumberRow(
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void
): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "hwt-settings-row";

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("p");
  labelEl.className = "hwt-settings-row-label";
  labelEl.textContent = label;

  info.appendChild(labelEl);
  row.appendChild(info);
  row.appendChild(createNumberInput(value, min, max, step, onChange));

  return row;
}

/**
 * Create a text input for string settings
 */
function createTextInput(
  value: string,
  onChange: (value: string) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "hwt-text-input";
  input.value = value;

  input.addEventListener("change", () => {
    onChange(input.value);
  });

  return input;
}

/**
 * Create a color input for color settings
 */
function createColorInput(
  value: string,
  onChange: (value: string) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "color";
  input.className = "hwt-color-input";
  input.value = value;

  input.addEventListener("change", () => {
    onChange(input.value);
  });

  return input;
}

/**
 * Create a row for a text or color setting
 */
function createDisplayRow(
  label: string,
  value: string,
  type: "text" | "color",
  onChange: (value: string) => void
): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "hwt-settings-row";

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("p");
  labelEl.className = "hwt-settings-row-label";
  labelEl.textContent = label;

  info.appendChild(labelEl);
  row.appendChild(info);

  const input =
    type === "color"
      ? createColorInput(value, onChange)
      : createTextInput(value, onChange);
  row.appendChild(input);

  return row;
}

// ============================================================================
// Section Builders
// ============================================================================

/**
 * Create the Sites section
 */
function createSitesSection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Sites", () => {
    const hwebRow = createToggleRow(
      "HackerWeb",
      "hackerweb.app",
      configStore.get("sites", "hackerweb").enabled,
      (checked) => {
        const current = configStore.get("sites", "hackerweb");
        configStore.set("sites", "hackerweb", { ...current, enabled: checked });
      }
    );
    hwebRow.classList.add("hwt-site-toggle");

    const hnRow = createToggleRow(
      "Hacker News",
      "news.ycombinator.com",
      configStore.get("sites", "hn").enabled,
      (checked) => {
        const current = configStore.get("sites", "hn");
        configStore.set("sites", "hn", { ...current, enabled: checked });
      }
    );
    hnRow.classList.add("hwt-site-toggle");

    return [createGroup(null, [hwebRow, hnRow])];
  });
}

/**
 * Create the Features section
 */
function createFeaturesSection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Features", () => {
    const groups: HTMLElement[] = [];

    for (const groupInfo of Object.values(FEATURE_GROUPS)) {
      const rows: HTMLElement[] = [];

      for (const featureKey of groupInfo.features) {
        const featureInfo = FEATURE_LABELS[featureKey];
        rows.push(
          createToggleRow(
            featureInfo.label,
            featureInfo.description,
            configStore.get("features", featureKey),
            (checked) => {
              configStore.set("features", featureKey, checked);
            }
          )
        );
      }

      groups.push(createGroup(groupInfo.label, rows));
    }

    return groups;
  });
}

/**
 * Create the Thresholds section
 */
function createThresholdsSection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Thresholds", () => {
    const rows: HTMLElement[] = [];

    for (const [key, info] of Object.entries(THRESHOLD_LABELS)) {
      const thresholdKey = key as keyof Thresholds;
      rows.push(
        createNumberRow(
          info.label,
          configStore.get("thresholds", thresholdKey),
          info.min,
          info.max,
          info.step ?? 1,
          (value) => {
            configStore.set("thresholds", thresholdKey, value);
          }
        )
      );
    }

    return [createGroup(null, rows)];
  });
}

/**
 * Create the Display section
 */
function createDisplaySection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Display", () => {
    const rows: HTMLElement[] = [];

    for (const [key, info] of Object.entries(DISPLAY_LABELS)) {
      const displayKey = key as keyof Display;
      rows.push(
        createDisplayRow(
          info.label,
          configStore.get("display", displayKey),
          info.type,
          (value) => {
            configStore.set("display", displayKey, value);
          }
        )
      );
    }

    return [createGroup(null, rows)];
  });
}

/**
 * Create the welcome state for first-time users
 */
function createWelcome(onExplore: () => void): HTMLDivElement {
  const welcome = document.createElement("div");
  welcome.className = "hwt-welcome";

  const icon = document.createElement("div");
  icon.className = "hwt-welcome-icon";
  icon.innerHTML = GEAR_ICON;
  welcome.appendChild(icon);

  const title = document.createElement("h2");
  title.className = "hwt-welcome-title";
  title.textContent = "Welcome to HackerWeb Tools";
  welcome.appendChild(title);

  const desc = document.createElement("p");
  desc.className = "hwt-welcome-desc";
  desc.textContent =
    "Enhance your Hacker News experience with collapsible threads, keyboard navigation, and more.";
  welcome.appendChild(desc);

  const shortcuts = document.createElement("div");
  shortcuts.className = "hwt-welcome-shortcuts";

  const shortcutItems = [
    { key: "j / k", desc: "Navigate comments" },
    { key: "o", desc: "Open link" },
    { key: ",", desc: "Settings" },
  ];

  for (const item of shortcutItems) {
    const shortcut = document.createElement("div");
    shortcut.className = "hwt-welcome-shortcut";

    const key = document.createElement("span");
    key.className = "hwt-welcome-shortcut-key";
    key.textContent = item.key;

    const shortcutDesc = document.createElement("span");
    shortcutDesc.className = "hwt-welcome-shortcut-desc";
    shortcutDesc.textContent = item.desc;

    shortcut.appendChild(shortcutDesc);
    shortcut.appendChild(key);
    shortcuts.appendChild(shortcut);
  }

  welcome.appendChild(shortcuts);

  const exploreBtn = document.createElement("button");
  exploreBtn.className = "hwt-explore-btn";
  exploreBtn.textContent = "Explore Settings";
  exploreBtn.addEventListener("click", onExplore);
  welcome.appendChild(exploreBtn);

  return welcome;
}

// ============================================================================
// Panel Management
// ============================================================================

/**
 * Create the main settings panel
 */
export function createPanel(): HTMLDivElement {
  // Guard against duplicate creation
  if (panelElement) return panelElement;

  const panel = document.createElement("div");
  panel.className = "hwt-settings-panel";

  if (isDarkMode()) {
    panel.classList.add("hwt-dark");
  }

  // Header
  const header = document.createElement("div");
  header.className = "hwt-settings-header";

  const title = document.createElement("h2");
  title.className = "hwt-settings-title";
  title.textContent = "HackerWeb Tools";
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.className = "hwt-settings-close";
  closeBtn.innerHTML = CLOSE_ICON;
  closeBtn.setAttribute("aria-label", "Close settings");
  closeBtn.addEventListener("click", () => togglePanel(false));
  header.appendChild(closeBtn);

  panel.appendChild(header);

  // Content
  const content = document.createElement("div");
  content.className = "hwt-settings-content";

  if (isFirstTimeUser()) {
    const welcomeEl = createWelcome(() => {
      rebuildPanelContent(content);
    });
    content.appendChild(welcomeEl);
  } else {
    rebuildPanelContent(content);
  }

  panel.appendChild(content);

  // Footer
  const footer = document.createElement("div");
  footer.className = "hwt-settings-footer";

  const resetBtn = document.createElement("button");
  resetBtn.className = "hwt-reset-btn";
  resetBtn.textContent = "Reset All";
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all settings to defaults?")) {
      getConfigStore().resetAll();
      rebuildPanelContent(content);
    }
  });
  footer.appendChild(resetBtn);

  const version = document.createElement("span");
  version.className = "hwt-version";
  version.textContent = `v${fullVersion}`;
  footer.appendChild(version);

  panel.appendChild(footer);

  document.body.appendChild(panel);
  panelElement = panel;
  return panel;
}

/**
 * Toggle the settings panel open/closed
 */
export function togglePanel(show?: boolean): void {
  const shouldShow = show ?? !isOpen;

  if (shouldShow === isOpen) return;

  isOpen = shouldShow;

  if (panelElement) {
    panelElement.classList.toggle("hwt-visible", isOpen);
    if (isOpen && isDarkMode()) {
      panelElement.classList.add("hwt-dark");
    }
  }

  if (overlayElement) {
    overlayElement.classList.toggle("hwt-visible", isOpen);
  }

  document.body.style.overflow = isOpen ? "hidden" : "";

  if (isOpen && panelElement) {
    const closeBtn = panelElement.querySelector<HTMLButtonElement>(
      ".hwt-settings-close"
    );
    closeBtn?.focus();
  }
}

/**
 * Register keyboard shortcuts for the settings panel
 */
export function registerKeyboardShortcuts(): () => void {
  const handleKeydown = (e: KeyboardEvent) => {
    // Escape always closes panel when open, even in inputs
    if (e.key === "Escape" && isOpen) {
      e.preventDefault();
      togglePanel(false);
      return;
    }

    // Don't process other shortcuts when in input fields
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    // Comma toggles panel
    if (e.key === ",") {
      e.preventDefault();
      togglePanel();
    }
  };

  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("keydown", handleKeydown);
  };
}
