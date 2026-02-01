import { createStyleInjector } from "../../../../utils/style-injector";

const STYLES = `
/* Wider main column */
body > section {
  max-width: 900px !important;
}

/* Better readability */
.comment-content,
section li > p {
  line-height: 1.6 !important;
}

/* More breathing room between comments */
section li {
  margin-bottom: 12px !important;
}

/* Toggle button - base styles */
.hwc-toggle.comments-toggle {
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.25em !important;
  font-size: 0.75em !important;
  font-weight: 600 !important;
  font-variant-numeric: tabular-nums !important;
  margin: 2px 0 !important;
  padding: 4px 8px !important;
  white-space: nowrap !important;
  color: #828282 !important;
  background: transparent !important;
  border: none !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  transition: color 0.15s ease, background-color 0.15s ease, transform 0.1s ease !important;
}

/* Hover state */
.hwc-toggle.comments-toggle:hover {
  color: #ff6600 !important;
  background: rgba(255, 102, 0, 0.08) !important;
}

/* Active/pressed state */
.hwc-toggle.comments-toggle:active {
  transform: scale(0.96) !important;
}

/* Focus state for keyboard users */
.hwc-toggle.comments-toggle:focus-visible {
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
  transition: transform 0.2s cubic-bezier(0.34, 1.3, 0.64, 1) !important;
}

.hwc-toggle:not(.hwc-collapsed) .hwc-arrow {
  transform: rotate(90deg) !important;
}

/* Ancestor highlight on hover */
li.hwc-hl {
  background-color: rgba(255,255,255,0.04) !important;
}
`;

const inject = createStyleInjector("hwc-styles");

export function injectStyles() {
  inject(STYLES);
}
