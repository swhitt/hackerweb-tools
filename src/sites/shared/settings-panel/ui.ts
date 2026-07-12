import { getConfigStore } from "../../../config";
import { fullVersion } from "../../../../config";
import type { Thresholds, Display, Features } from "../../../config/types";
import {
  FEATURE_GROUPS,
  FEATURE_LABELS,
  THRESHOLD_LABELS,
  DISPLAY_LABELS,
  type DisplayLabelInfo,
} from "./feature-groups";

let panelElement: HTMLDivElement | null = null;
let overlayElement: HTMLDivElement | null = null;
let gearElement: HTMLButtonElement | null = null;
let searchElement: HTMLInputElement | null = null;
let activeCountElement: HTMLSpanElement | null = null;
let searchStatusElement: HTMLSpanElement | null = null;
let liveRegionElement: HTMLDivElement | null = null;
let reloadNoticeElement: HTMLDivElement | null = null;
let previouslyFocusedElement: HTMLElement | null = null;
let previousBodyOverflow = "";
let isOpen = false;
let controlId = 0;

// Animation duration in ms (must match CSS animation: hwt-pulse 0.4s)
const PULSE_ANIMATION_MS = 400;
const PANEL_ID = "hwt-settings-panel";
const PANEL_TITLE_ID = "hwt-settings-title";

// Note: These SVG strings are hardcoded constants and must never accept external input
const GEAR_ICON = `<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
</svg>`;

const CLOSE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M18 6L6 18M6 6l12 12"/>
</svg>`;

const SEARCH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="11" r="7"/>
  <path d="m20 20-3.5-3.5"/>
</svg>`;

/**
 * Check if dark mode is active (only when the feature has applied it)
 */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains("hwt-dark");
}

function getSiteName(): "hackerweb" | "hn" {
  return location.hostname === "hackerweb.app" ? "hackerweb" : "hn";
}

/**
 * Observe dark mode class on documentElement and sync to panel
 */
function observeDarkMode(panel: HTMLElement): void {
  const sync = () => {
    panel.classList.toggle("hwt-dark", isDarkMode());
  };

  // Watch for class changes on <html> (dark-mode feature toggles hwt-dark there)
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
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
  section.dataset["hwtSearch"] = title.toLowerCase();

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
  rows: HTMLElement[],
  description?: string,
  scope?: string
): HTMLDivElement {
  const group = document.createElement("div");
  group.className = "hwt-settings-group";
  group.dataset["hwtSearch"] = [title, description, scope]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (title) {
    const groupHeader = document.createElement("div");
    groupHeader.className = "hwt-settings-group-header";

    const groupHeading = document.createElement("div");
    groupHeading.className = "hwt-settings-group-heading";

    const groupTitle = document.createElement("h4");
    groupTitle.className = "hwt-settings-group-title";
    groupTitle.textContent = title;
    groupHeading.appendChild(groupTitle);

    if (description) {
      const groupDescription = document.createElement("p");
      groupDescription.className = "hwt-settings-group-description";
      groupDescription.textContent = description;
      groupHeading.appendChild(groupDescription);
    }

    groupHeader.appendChild(groupHeading);

    if (scope) {
      const scopeBadge = document.createElement("span");
      scopeBadge.className = "hwt-settings-scope";
      scopeBadge.textContent = scope;
      groupHeader.appendChild(scopeBadge);
    }

    group.appendChild(groupHeader);
  }

  for (const row of rows) {
    group.appendChild(row);
  }

  return group;
}

function getCurrentFeatureKeys(): (keyof Features)[] {
  const shared = FEATURE_GROUPS["shared"]?.features ?? [];
  const current = FEATURE_GROUPS[getSiteName()]?.features ?? [];
  return [...shared, ...current];
}

function getFeatureCount(): { active: number; total: number } {
  const store = getConfigStore();
  const keys = getCurrentFeatureKeys();
  return {
    active: keys.filter((key) => store.get("features", key)).length,
    total: keys.length,
  };
}

function updateActiveCount(): void {
  const { active, total } = getFeatureCount();
  const text = `${active} / ${total} enabled`;
  if (activeCountElement) activeCountElement.textContent = text;
}

function announce(message: string): void {
  if (!liveRegionElement) return;
  liveRegionElement.textContent = "";
  requestAnimationFrame(() => {
    if (liveRegionElement) liveRegionElement.textContent = message;
  });
}

function markReloadRequired(settingName: string): void {
  if (reloadNoticeElement) reloadNoticeElement.hidden = false;
  announce(`${settingName} saved. Reload to fully apply this change.`);
}

function createNoResults(): HTMLDivElement {
  const empty = document.createElement("div");
  empty.className = "hwt-settings-empty";
  empty.hidden = true;

  const title = document.createElement("p");
  title.className = "hwt-settings-empty-title";
  title.textContent = "No settings found";
  empty.appendChild(title);

  const description = document.createElement("p");
  description.className = "hwt-settings-empty-description";
  description.textContent = "Try a feature, site, or display term.";
  empty.appendChild(description);
  return empty;
}

function filterPanelContent(container: HTMLElement, query: string): void {
  const term = query.trim().toLowerCase();
  let visibleRows = 0;

  for (const section of container.querySelectorAll<HTMLElement>(
    ".hwt-settings-section"
  )) {
    const sectionMatches =
      section.dataset["hwtSearch"]?.includes(term) ?? false;
    let sectionHasMatch = false;

    for (const group of section.querySelectorAll<HTMLElement>(
      ".hwt-settings-group"
    )) {
      const groupMatches = group.dataset["hwtSearch"]?.includes(term) ?? false;
      let groupHasMatch = false;

      for (const row of group.querySelectorAll<HTMLElement>(
        ".hwt-settings-row"
      )) {
        const rowMatches = row.dataset["hwtSearch"]?.includes(term) ?? false;
        const matches =
          term.length === 0 || sectionMatches || groupMatches || rowMatches;
        row.hidden = !matches;
        if (matches) {
          visibleRows++;
          groupHasMatch = true;
        }
      }

      group.hidden = !groupHasMatch;
      sectionHasMatch ||= groupHasMatch;
    }

    section.hidden = !sectionHasMatch;
  }

  const empty = container.querySelector<HTMLElement>(".hwt-settings-empty");
  if (empty) empty.hidden = term.length === 0 || visibleRows > 0;

  if (searchStatusElement) {
    searchStatusElement.textContent =
      term.length === 0
        ? ""
        : `${visibleRows} ${visibleRows === 1 ? "match" : "matches"}`;
  }
}

/**
 * Rebuild the panel content with all settings sections
 */
function rebuildPanelContent(container: HTMLElement): void {
  container.innerHTML = "";
  container.appendChild(createFeaturesSection());
  if (getSiteName() === "hackerweb") {
    container.appendChild(createDisplaySection());
  }
  container.appendChild(createThresholdsSection());
  container.appendChild(createSitesSection());
  container.appendChild(createNoResults());
  updateActiveCount();
  filterPanelContent(container, searchElement?.value ?? "");
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
  button.dataset["hwtSite"] = getSiteName();
  button.type = "button";
  button.innerHTML = `<span class="hwt-settings-gear-icon">${GEAR_ICON}</span><span class="hwt-settings-gear-label">Tools</span><kbd>,</kbd>`;
  button.setAttribute("aria-label", "Open settings");
  button.setAttribute("aria-controls", PANEL_ID);
  button.setAttribute("aria-expanded", "false");
  button.title = "Open HackerWeb Tools (,)";
  button.addEventListener("click", () => togglePanel());
  document.body.appendChild(button);
  gearElement = button;
  return button;
}

/**
 * Create the overlay backdrop
 */
export function createOverlay(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.className = "hwt-settings-overlay";
  overlay.dataset["hwtSite"] = getSiteName();
  overlay.setAttribute("aria-hidden", "true");
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
  inputId: string,
  labelledBy: string,
  describedBy: string | undefined,
  onChange: (checked: boolean) => void
): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "hwt-toggle";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = inputId;
  input.checked = checked;
  input.setAttribute("role", "switch");
  input.setAttribute("aria-labelledby", labelledBy);
  if (describedBy) input.setAttribute("aria-describedby", describedBy);

  const track = document.createElement("span");
  track.className = "hwt-toggle-track";

  const knob = document.createElement("span");
  knob.className = "hwt-toggle-knob";
  track.appendChild(knob);

  input.addEventListener("change", () => {
    onChange(input.checked);
    const settingName = document.getElementById(labelledBy)?.textContent;
    if (settingName) markReloadRequired(settingName);
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
  row.dataset["hwtSearch"] = `${label} ${description}`.toLowerCase();

  const id = `hwt-setting-${++controlId}`;
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("label");
  labelEl.className = "hwt-settings-row-label";
  labelEl.id = labelId;
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  const descEl = document.createElement("p");
  descEl.className = "hwt-settings-row-description";
  descEl.id = descriptionId;
  descEl.textContent = description;

  info.appendChild(labelEl);
  info.appendChild(descEl);
  row.appendChild(info);
  row.appendChild(createToggle(checked, id, labelId, descriptionId, onChange));

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
  inputId: string,
  settingName: string,
  onChange: (value: number) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "number";
  input.id = inputId;
  input.className = "hwt-number-input";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);

  input.addEventListener("change", () => {
    const newValue = Math.min(max, Math.max(min, Number(input.value)));
    input.value = String(newValue);
    onChange(newValue);
    markReloadRequired(settingName);
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
  row.dataset["hwtSearch"] = label.toLowerCase();

  const id = `hwt-setting-${++controlId}`;

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("label");
  labelEl.className = "hwt-settings-row-label";
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  info.appendChild(labelEl);
  row.appendChild(info);
  row.appendChild(
    createNumberInput(value, min, max, step, id, label, onChange)
  );

  return row;
}

/**
 * Create a text input for string settings
 */
function createTextInput(
  value: string,
  inputId: string,
  settingName: string,
  onChange: (value: string) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "text";
  input.id = inputId;
  input.className = "hwt-text-input";
  input.value = value;

  input.addEventListener("change", () => {
    onChange(input.value);
    markReloadRequired(settingName);
  });

  return input;
}

/**
 * Create a color input for color settings
 */
function createColorInput(
  value: string,
  inputId: string,
  settingName: string,
  onChange: (value: string) => void
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "color";
  input.id = inputId;
  input.className = "hwt-color-input";
  input.value = value;

  input.addEventListener("change", () => {
    onChange(input.value);
    markReloadRequired(settingName);
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
  row.dataset["hwtSearch"] = label.toLowerCase();

  const id = `hwt-setting-${++controlId}`;

  const info = document.createElement("div");
  info.className = "hwt-settings-row-info";

  const labelEl = document.createElement("label");
  labelEl.className = "hwt-settings-row-label";
  labelEl.htmlFor = id;
  labelEl.textContent = label;

  info.appendChild(labelEl);
  row.appendChild(info);

  const input =
    type === "color"
      ? createColorInput(value, id, label, onChange)
      : createTextInput(value, id, label, onChange);
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

  return createSection("This site", () => {
    const site = getSiteName();
    const siteLabel = site === "hackerweb" ? "HackerWeb" : "Hacker News";
    const siteHost =
      site === "hackerweb" ? "hackerweb.app" : "news.ycombinator.com";
    const row = createToggleRow(
      `${siteLabel} enhancements`,
      `Apply configured tools on ${siteHost}`,
      configStore.get("sites", site).enabled,
      (checked) => {
        const current = configStore.get("sites", site);
        configStore.set("sites", site, { ...current, enabled: checked });
      }
    );
    row.classList.add("hwt-site-toggle");

    return [createGroup(null, [row])];
  });
}

/**
 * Create the Features section
 */
function createFeaturesSection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Features", () => {
    const groups: HTMLElement[] = [];

    const groupKeys = ["shared", getSiteName()];
    for (const groupKey of groupKeys) {
      const groupInfo = FEATURE_GROUPS[groupKey];
      if (!groupInfo) continue;
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

      groups.push(
        createGroup(
          groupInfo.label,
          rows,
          groupInfo.description,
          groupInfo.scope
        )
      );
    }

    return groups;
  });
}

/**
 * Create the Thresholds section
 */
function createThresholdsSection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Tuning", () => {
    const threadRows: HTMLElement[] = [];
    const scoreRows: HTMLElement[] = [];
    const keys: (keyof Thresholds)[] = [
      "autoCollapseDepth",
      "gutterClickPx",
      "highScoreThreshold",
      "lowScoreThreshold",
    ];

    for (const thresholdKey of keys) {
      const info = THRESHOLD_LABELS[thresholdKey];
      const row = createNumberRow(
        info.label,
        configStore.get("thresholds", thresholdKey),
        info.min,
        info.max,
        info.step ?? 1,
        (value) => {
          configStore.set("thresholds", thresholdKey, value);
        }
      );

      if (
        thresholdKey === "autoCollapseDepth" ||
        thresholdKey === "gutterClickPx"
      ) {
        threadRows.push(row);
      } else {
        scoreRows.push(row);
      }
    }

    return getSiteName() === "hackerweb"
      ? [
          createGroup(
            "Thread controls",
            threadRows,
            "Fine-tune collapsing behavior.",
            "HackerWeb"
          ),
        ]
      : [
          createGroup(
            "Score signals",
            scoreRows,
            "Choose which story scores stand out or fade back.",
            "Hacker News"
          ),
        ];
  });
}

/**
 * Create the Display section
 */
function createDisplaySection(): HTMLDivElement {
  const configStore = getConfigStore();

  return createSection("Appearance", () => {
    const rows: HTMLElement[] = [];
    const keys: (keyof Display)[] = [
      "maxContentWidth",
      "fontSize",
      "commentLineHeight",
    ];

    for (const key of keys) {
      const info: DisplayLabelInfo = DISPLAY_LABELS[key];
      if (info.type === "number") {
        rows.push(
          createNumberRow(
            info.label,
            configStore.get("display", key) as number,
            info.min,
            info.max,
            info.step ?? 1,
            (value) => {
              configStore.set("display", key, value as Display[typeof key]);
            }
          )
        );
      } else {
        rows.push(
          createDisplayRow(
            info.label,
            configStore.get("display", key) as string,
            info.type,
            (value) => {
              configStore.set("display", key, value as Display[typeof key]);
            }
          )
        );
      }
    }

    return [
      createGroup(
        "Reading layout",
        rows,
        "Adjust the HackerWeb discussion column.",
        "HackerWeb"
      ),
    ];
  });
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
  panel.dataset["hwtSite"] = getSiteName();
  panel.id = PANEL_ID;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-labelledby", PANEL_TITLE_ID);
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;

  if (isDarkMode()) {
    panel.classList.add("hwt-dark");
  }

  // Keep dark mode in sync with document
  observeDarkMode(panel);

  // Header
  const header = document.createElement("div");
  header.className = "hwt-settings-header";

  const brand = document.createElement("div");
  brand.className = "hwt-settings-brand";

  const brandMark = document.createElement("span");
  brandMark.className = "hwt-settings-brand-mark";
  brandMark.textContent = "HWT";
  brandMark.setAttribute("aria-hidden", "true");
  brand.appendChild(brandMark);

  const titleGroup = document.createElement("div");
  titleGroup.className = "hwt-settings-title-group";

  const title = document.createElement("h2");
  title.className = "hwt-settings-title";
  title.id = PANEL_TITLE_ID;
  title.textContent = "HackerWeb Tools";
  titleGroup.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "hwt-settings-subtitle";

  activeCountElement = document.createElement("span");
  activeCountElement.className = "hwt-settings-active-count";
  subtitle.appendChild(activeCountElement);
  subtitle.append(` · ${location.hostname}`);
  titleGroup.appendChild(subtitle);

  brand.appendChild(titleGroup);
  header.appendChild(brand);

  const closeBtn = document.createElement("button");
  closeBtn.className = "hwt-settings-close";
  closeBtn.type = "button";
  closeBtn.innerHTML = CLOSE_ICON;
  closeBtn.setAttribute("aria-label", "Close settings");
  closeBtn.addEventListener("click", () => togglePanel(false));
  header.appendChild(closeBtn);

  panel.appendChild(header);

  // Search
  const searchBar = document.createElement("div");
  searchBar.className = "hwt-settings-search-bar";

  const searchLabel = document.createElement("label");
  searchLabel.className = "hwt-sr-only";
  searchLabel.htmlFor = "hwt-settings-search";
  searchLabel.textContent = "Search settings";
  searchBar.appendChild(searchLabel);

  const searchShell = document.createElement("div");
  searchShell.className = "hwt-settings-search";

  const searchIcon = document.createElement("span");
  searchIcon.className = "hwt-settings-search-icon";
  searchIcon.innerHTML = SEARCH_ICON;
  searchShell.appendChild(searchIcon);

  const search = document.createElement("input");
  search.type = "search";
  search.id = "hwt-settings-search";
  search.placeholder = "Search features and controls";
  search.autocomplete = "off";
  search.setAttribute("aria-describedby", "hwt-settings-search-status");
  searchShell.appendChild(search);

  const searchKey = document.createElement("kbd");
  searchKey.textContent = "/";
  searchShell.appendChild(searchKey);
  searchBar.appendChild(searchShell);

  searchStatusElement = document.createElement("span");
  searchStatusElement.className = "hwt-settings-search-status";
  searchStatusElement.id = "hwt-settings-search-status";
  searchStatusElement.setAttribute("aria-live", "polite");
  searchBar.appendChild(searchStatusElement);
  panel.appendChild(searchBar);

  // Some features inject page-level DOM/listeners and need a reload to fully
  // reconcile when disabled. Keep that state explicit instead of implying an
  // immediate unmount.
  const reloadNotice = document.createElement("div");
  reloadNotice.className = "hwt-settings-reload";
  reloadNotice.hidden = true;

  const reloadCopy = document.createElement("span");
  reloadCopy.textContent = "Saved. Reload to fully apply page changes.";
  reloadNotice.appendChild(reloadCopy);

  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.textContent = "Reload";
  reloadButton.addEventListener("click", () => location.reload());
  reloadNotice.appendChild(reloadButton);
  panel.appendChild(reloadNotice);
  reloadNoticeElement = reloadNotice;

  // Content
  const content = document.createElement("div");
  content.className = "hwt-settings-content";
  searchElement = search;
  search.addEventListener("input", () => {
    filterPanelContent(content, search.value);
  });
  rebuildPanelContent(content);
  panel.appendChild(content);

  // Footer
  const footer = document.createElement("div");
  footer.className = "hwt-settings-footer";

  const resetBtn = document.createElement("button");
  resetBtn.className = "hwt-reset-btn";
  resetBtn.type = "button";
  resetBtn.textContent = "Reset defaults";
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset all settings to defaults?")) {
      getConfigStore().resetAll();
      rebuildPanelContent(content);
      markReloadRequired("Defaults");
    }
  });
  footer.appendChild(resetBtn);

  const version = document.createElement("span");
  version.className = "hwt-version";
  version.textContent = `HWT v${fullVersion}`;
  footer.appendChild(version);

  panel.appendChild(footer);

  liveRegionElement = document.createElement("div");
  liveRegionElement.className = "hwt-sr-only";
  liveRegionElement.setAttribute("role", "status");
  liveRegionElement.setAttribute("aria-live", "polite");
  panel.appendChild(liveRegionElement);

  document.body.appendChild(panel);
  panelElement = panel;
  getConfigStore().subscribeSection("features", updateActiveCount);
  updateActiveCount();
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
    panelElement.inert = !isOpen;
    panelElement.setAttribute("aria-hidden", String(!isOpen));
  }

  if (overlayElement) {
    overlayElement.classList.toggle("hwt-visible", isOpen);
    overlayElement.setAttribute("aria-hidden", String(!isOpen));
  }

  gearElement?.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    previouslyFocusedElement =
      activeElement && activeElement !== document.body
        ? activeElement
        : gearElement;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    searchElement?.focus();
    searchElement?.select();
  } else {
    document.body.style.overflow = previousBodyOverflow;
    const focusTarget =
      previouslyFocusedElement?.isConnected === true
        ? previouslyFocusedElement
        : gearElement;
    focusTarget?.focus();
    previouslyFocusedElement = null;
  }
}

function getFocusableElements(): HTMLElement[] {
  if (!panelElement) return [];
  const selector = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return Array.from(
    panelElement.querySelectorAll<HTMLElement>(selector)
  ).filter((element) => !element.closest("[hidden]"));
}

function trapFocus(event: KeyboardEvent): void {
  const focusable = getFocusableElements();
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!panelElement?.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement || target.isContentEditable) {
    return true;
  }
  if (target instanceof HTMLSelectElement) return true;
  if (!(target instanceof HTMLInputElement)) return false;

  return ["text", "search", "email", "url", "tel", "password"].includes(
    target.type
  );
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

    if (e.key === "Tab" && isOpen) {
      trapFocus(e);
      return;
    }

    // Don't process other shortcuts when in input fields
    const target = e.target;
    if (isTextEntryTarget(target)) return;

    // Slash jumps to search while the panel is open
    if (e.key === "/" && isOpen) {
      e.preventDefault();
      searchElement?.focus();
      return;
    }

    // Comma toggles panel
    if (e.key === "," && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      togglePanel();
    }
  };

  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("keydown", handleKeydown);
  };
}
