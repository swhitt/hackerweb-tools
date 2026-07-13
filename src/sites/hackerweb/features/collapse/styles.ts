import { createStyleInjector } from "../../../../utils/style-injector";

const STYLES = `
/* Toggle button - base styles (override HackerWeb defaults) */
.hwc-toggle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.25em !important;
  font-size: 0.85em !important;
  font-weight: 500 !important;
  font-variant-numeric: tabular-nums !important;
  margin: 4px 0 !important;
  padding: 2px 6px !important;
  white-space: nowrap !important;
  color: #828282 !important;
  background: transparent !important;
  border: 1px solid rgba(128, 128, 128, 0.28) !important;
  border-radius: 3px !important;
  cursor: pointer !important;
  transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease !important;
}

/* Hover state */
.hwc-toggle:hover {
  color: #e07020 !important;
  background-color: rgba(255, 140, 50, 0.10) !important;
  border-color: rgba(255, 140, 50, 0.25) !important;
}

/* Active/pressed state */
.hwc-toggle:active {
  color: #ff6600 !important;
  background-color: rgba(255, 102, 0, 0.2) !important;
}

/* Focus state for keyboard users */
.hwc-toggle:focus-visible {
  outline: 2px solid #ff6600 !important;
  outline-offset: 2px !important;
}

/* Collapsed state - slightly muted */
.hwc-toggle.hwc-collapsed {
  color: #999 !important;
}

.hwc-toggle.hwc-collapsed:hover {
  color: #ff6600 !important;
}

/* Arrow indicator with rotation */
.hwc-toggle .hwc-arrow {
  display: inline-block !important;
  transition: transform 0.15s ease-out !important;
}

.hwc-toggle:not(.hwc-collapsed) .hwc-arrow {
  transform: rotate(90deg) !important;
}

/* Ancestor highlight on hover */
#view-comments section.comments li.hwc-hl {
  box-shadow: inset 2px 0 rgba(255, 102, 0, 0.65) !important;
}
`;

const inject = createStyleInjector("hwc-styles");

export function injectStyles() {
  inject(STYLES);
}
