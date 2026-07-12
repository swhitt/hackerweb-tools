export const CSS = `
/* HackerWeb Tools settings */
.hwt-settings-panel,
.hwt-settings-panel *,
.hwt-settings-gear,
.hwt-settings-gear * {
  box-sizing: border-box;
}

.hwt-settings-panel [hidden] {
  display: none !important;
}

.hwt-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Launcher */
.hwt-settings-gear {
  position: fixed;
  right: max(18px, env(safe-area-inset-right));
  bottom: max(76px, calc(env(safe-area-inset-bottom) + 64px));
  z-index: 9998;
  min-width: 48px;
  height: 48px;
  padding: 0 10px 0 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 15px;
  background: #18191d;
  color: #ffffff;
  box-shadow:
    0 12px 30px rgba(19, 15, 12, 0.22),
    0 2px 8px rgba(19, 15, 12, 0.16);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.hwt-settings-gear:hover {
  background: #24262b;
  transform: translateY(-2px);
  box-shadow:
    0 16px 34px rgba(19, 15, 12, 0.26),
    0 3px 10px rgba(19, 15, 12, 0.18);
}

.hwt-settings-gear:active {
  transform: translateY(0) scale(0.97);
}

.hwt-settings-gear:focus-visible {
  outline: 3px solid rgba(255, 102, 0, 0.42);
  outline-offset: 3px;
}

.hwt-settings-gear-icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  background: linear-gradient(145deg, #ff7a1a, #ff5200);
  display: grid;
  place-items: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32);
}

.hwt-settings-gear-icon svg {
  width: 19px;
  height: 19px;
  fill: currentColor;
}

.hwt-settings-gear kbd {
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border: 1px solid #4c4e55;
  border-bottom-color: #656871;
  border-radius: 5px;
  background: #292b31;
  color: #c9cbd1;
  display: grid;
  place-items: center;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* Modal layer */
.hwt-settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  background: rgba(20, 18, 16, 0.5);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 220ms ease,
    visibility 220ms ease;
}

.hwt-settings-overlay.hwt-visible {
  opacity: 1;
  visibility: visible;
}

.hwt-settings-panel {
  --hwt-accent: #ff620f;
  --hwt-accent-strong: #e94f00;
  --hwt-bg: #f4f2ec;
  --hwt-surface: #ffffff;
  --hwt-surface-soft: #eeece5;
  --hwt-surface-hover: #f8f6f1;
  --hwt-text: #1e2025;
  --hwt-text-soft: #5c6069;
  --hwt-text-muted: #737781;
  --hwt-border: #dbd8cf;
  --hwt-border-strong: #c5c1b7;
  --hwt-focus: #137cc1;
  --hwt-shadow: rgba(25, 20, 16, 0.2);

  position: fixed;
  top: 0;
  right: 0;
  z-index: 2147483002;
  width: min(440px, 100vw);
  height: 100vh;
  height: 100dvh;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--hwt-bg);
  color: var(--hwt-text);
  box-shadow: -18px 0 50px var(--hwt-shadow);
  transform: translateX(calc(100% + 24px));
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  overflow-x: clip;
  overflow-y: hidden;
  isolation: isolate;
  color-scheme: light;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif;
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
}

.hwt-settings-panel.hwt-visible {
  transform: translateX(0);
}

.hwt-settings-panel.hwt-dark {
  --hwt-bg: #18191c;
  --hwt-surface: #222328;
  --hwt-surface-soft: #292a30;
  --hwt-surface-hover: #2d2f35;
  --hwt-text: #f2f2f0;
  --hwt-text-soft: #b6b8bf;
  --hwt-text-muted: #9699a2;
  --hwt-border: #373940;
  --hwt-border-strong: #484a53;
  --hwt-focus: #57b7f0;
  --hwt-shadow: rgba(0, 0, 0, 0.42);
  color-scheme: dark;
}

/* Header */
.hwt-settings-header {
  position: relative;
  flex: 0 0 auto;
  min-height: 82px;
  padding: calc(18px + env(safe-area-inset-top)) 20px 16px;
  background:
    radial-gradient(circle at 12% -20%, rgba(255, 112, 28, 0.34), transparent 43%),
    linear-gradient(135deg, #1a1b1f, #24262c);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  overflow: hidden;
}

.hwt-settings-header::after {
  content: "";
  position: absolute;
  right: -42px;
  bottom: -58px;
  width: 150px;
  height: 150px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  pointer-events: none;
}

.hwt-settings-brand {
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.hwt-settings-brand-mark {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 12px;
  background: linear-gradient(145deg, #ff7716, #ff5200);
  color: #ffffff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 7px 16px rgba(255, 82, 0, 0.24);
  display: grid;
  place-items: center;
  font: 800 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.04em;
}

.hwt-settings-title-group {
  min-width: 0;
}

.hwt-settings-title {
  margin: 0;
  color: #ffffff;
  font-size: 17px;
  font-weight: 720;
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.hwt-settings-subtitle {
  margin: 4px 0 0;
  color: #b9bbc3;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.2;
}

.hwt-settings-active-count {
  color: #ff9a5f;
}

.hwt-settings-close {
  position: relative;
  z-index: 1;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: #d7d8dd;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease;
}

.hwt-settings-close:hover {
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.hwt-settings-close:focus-visible {
  outline: 3px solid rgba(255, 137, 71, 0.5);
  outline-offset: 2px;
}

.hwt-settings-close svg {
  width: 19px;
  height: 19px;
  stroke: currentColor;
}

/* Primary views */
.hwt-settings-tabs {
  flex: 0 0 auto;
  min-height: 45px;
  padding: 0 18px;
  border-bottom: 1px solid var(--hwt-border);
  background: var(--hwt-bg);
  display: flex;
  align-items: end;
  gap: 18px;
}

.hwt-settings-tab {
  align-self: stretch;
  padding: 2px 1px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--hwt-text-soft);
  cursor: pointer;
  font: 700 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hwt-settings-tab:hover {
  color: var(--hwt-text);
}

.hwt-settings-tab.hwt-active {
  border-bottom-color: var(--hwt-accent);
  color: var(--hwt-text);
}

.hwt-settings-tab:focus-visible {
  outline: 2px solid var(--hwt-focus);
  outline-offset: 2px;
}

/* Search */
.hwt-settings-search-bar {
  flex: 0 0 auto;
  min-height: 68px;
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--hwt-border);
  background: var(--hwt-bg);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
}

.hwt-settings-search {
  height: 42px;
  padding: 0 10px 0 12px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 12px;
  background: var(--hwt-surface);
  box-shadow: 0 1px 2px rgba(20, 18, 15, 0.04);
  display: flex;
  align-items: center;
  gap: 9px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.hwt-settings-search:focus-within {
  border-color: var(--hwt-accent);
  box-shadow: 0 0 0 3px rgba(255, 98, 15, 0.14);
}

.hwt-settings-search-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  color: var(--hwt-text-muted);
}

.hwt-settings-search-icon svg {
  width: 18px;
  height: 18px;
  display: block;
  stroke: currentColor;
}

.hwt-settings-search input {
  width: 100%;
  min-width: 0;
  height: 38px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--hwt-text);
  font: 500 13px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hwt-settings-search input::placeholder {
  color: var(--hwt-text-muted);
  opacity: 1;
}

.hwt-settings-search input::-webkit-search-cancel-button {
  cursor: pointer;
}

.hwt-settings-search kbd {
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  border: 1px solid var(--hwt-border);
  border-bottom-color: var(--hwt-border-strong);
  border-radius: 6px;
  background: var(--hwt-surface-soft);
  color: var(--hwt-text-muted);
  display: grid;
  place-items: center;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}

.hwt-settings-search-status {
  min-width: 56px;
  color: var(--hwt-text-muted);
  font-size: 11px;
  font-weight: 650;
  text-align: right;
  white-space: nowrap;
}

/* Saved/reload state */
.hwt-settings-reload {
  flex: 0 0 auto;
  min-height: 46px;
  padding: 8px 18px;
  border-bottom: 1px solid var(--hwt-border);
  background: color-mix(in srgb, var(--hwt-accent) 9%, var(--hwt-bg));
  color: var(--hwt-text-soft);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.35;
}

.hwt-settings-reload button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--hwt-accent);
  border-radius: 8px;
  background: var(--hwt-accent);
  color: #ffffff;
  cursor: pointer;
  font: 700 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hwt-settings-reload button:hover {
  background: var(--hwt-accent-strong);
}

.hwt-settings-reload button:focus-visible {
  outline: 3px solid rgba(255, 98, 15, 0.24);
  outline-offset: 2px;
}

/* Scrollable content */
.hwt-settings-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 14px 18px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--hwt-border-strong) transparent;
}

.hwt-settings-content::-webkit-scrollbar {
  width: 9px;
}

.hwt-settings-content::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 99px;
  background: var(--hwt-border-strong);
  background-clip: padding-box;
}

/* Sections and cards */
.hwt-settings-section {
  margin: 0 0 26px;
}

.hwt-settings-section:last-of-type {
  margin-bottom: 0;
}

.hwt-settings-section-title {
  margin: 0 2px 10px;
  color: var(--hwt-text-soft);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.085em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hwt-settings-group {
  margin-bottom: 12px;
  border: 1px solid var(--hwt-border);
  border-radius: 15px;
  background: var(--hwt-surface);
  box-shadow: 0 2px 8px rgba(25, 21, 16, 0.035);
  overflow: hidden;
}

.hwt-settings-group:last-child {
  margin-bottom: 0;
}

.hwt-settings-group-header {
  min-height: 62px;
  padding: 13px 14px 11px;
  border-bottom: 1px solid var(--hwt-border);
  background: var(--hwt-surface-soft);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.hwt-settings-group-heading {
  min-width: 0;
}

.hwt-settings-group-title {
  margin: 0;
  color: var(--hwt-text);
  font-size: 13px;
  font-weight: 720;
  line-height: 1.25;
}

.hwt-settings-group-description {
  margin: 3px 0 0;
  color: var(--hwt-text-soft);
  font-size: 11px;
  line-height: 1.35;
}

.hwt-settings-scope {
  flex: 0 0 auto;
  max-width: 135px;
  padding: 4px 7px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 7px;
  color: var(--hwt-text-soft);
  font: 650 9px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hwt-settings-row {
  position: relative;
  min-height: 62px;
  padding: 10px 13px 10px 15px;
  border-bottom: 1px solid var(--hwt-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: background 150ms ease;
}

.hwt-settings-row:last-child {
  border-bottom: 0;
}

.hwt-settings-row:hover {
  background: var(--hwt-surface-hover);
}

.hwt-settings-row-info {
  flex: 1 1 auto;
  min-width: 0;
}

.hwt-settings-row-label {
  display: block;
  margin: 0;
  color: var(--hwt-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.3;
}

.hwt-settings-row-description {
  margin: 3px 0 0;
  color: var(--hwt-text-soft);
  font-size: 11px;
  line-height: 1.35;
  white-space: normal;
}

.hwt-site-toggle {
  min-height: 66px;
}

.hwt-site-toggle .hwt-settings-row-label {
  font-size: 14px;
}

/* Switch */
.hwt-toggle {
  position: relative;
  width: 48px;
  height: 44px;
  flex: 0 0 48px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.hwt-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.hwt-toggle-track {
  position: relative;
  width: 42px;
  height: 24px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 99px;
  background: #aaa9a5;
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.hwt-toggle input:checked + .hwt-toggle-track {
  border-color: var(--hwt-accent);
  background: var(--hwt-accent);
}

.hwt-toggle-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 5px rgba(20, 18, 15, 0.3);
  transition: transform 190ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hwt-toggle input:checked + .hwt-toggle-track .hwt-toggle-knob {
  transform: translateX(18px);
}

.hwt-toggle input:focus-visible + .hwt-toggle-track {
  outline: 3px solid color-mix(in srgb, var(--hwt-focus) 35%, transparent);
  outline-offset: 3px;
}

.hwt-toggle.hwt-pulse .hwt-toggle-track {
  animation: hwt-pulse 400ms ease;
}

@keyframes hwt-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 98, 15, 0.34); }
  65% { box-shadow: 0 0 0 8px rgba(255, 98, 15, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 98, 15, 0); }
}

/* Inputs */
.hwt-number-input,
.hwt-text-input,
.hwt-color-input,
.hwt-select-input {
  flex: 0 0 auto;
  height: 36px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 9px;
  background: var(--hwt-surface-soft);
  color: var(--hwt-text);
  font: 600 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    background 150ms ease;
}

.hwt-number-input {
  width: 74px;
  padding: 0 7px;
  text-align: center;
}

.hwt-text-input {
  width: 112px;
  padding: 0 9px;
}

.hwt-color-input {
  width: 48px;
  padding: 3px;
  cursor: pointer;
}

.hwt-select-input {
  min-width: 104px;
  padding: 0 8px;
}

.hwt-number-input:focus,
.hwt-text-input:focus,
.hwt-color-input:focus-visible,
.hwt-select-input:focus-visible {
  border-color: var(--hwt-accent);
  outline: 0;
  background: var(--hwt-surface);
  box-shadow: 0 0 0 3px rgba(255, 98, 15, 0.14);
}

.hwt-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.hwt-color-input::-webkit-color-swatch {
  border: 0;
  border-radius: 6px;
}

/* Empty state */
.hwt-settings-empty {
  margin: 38px auto;
  padding: 24px;
  text-align: center;
}

.hwt-settings-empty::before {
  content: "?";
  width: 40px;
  height: 40px;
  margin: 0 auto 12px;
  border: 1px solid var(--hwt-border);
  border-radius: 13px;
  background: var(--hwt-surface);
  color: var(--hwt-text-muted);
  display: grid;
  place-items: center;
  font: 700 15px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
}

.hwt-settings-empty-title {
  margin: 0;
  color: var(--hwt-text);
  font-size: 14px;
  font-weight: 700;
}

.hwt-settings-empty-description {
  margin: 4px 0 0;
  color: var(--hwt-text-soft);
  font-size: 12px;
}

/* Saved */
.hwt-settings-content.hwt-showing-saved {
  padding-top: 16px;
}

.hwt-saved-view {
  color: var(--hwt-text);
}

.hwt-saved-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 125px;
  gap: 8px;
}

.hwt-saved-search,
.hwt-saved-filter,
.hwt-saved-sort,
.hwt-saved-action,
.hwt-saved-load-more {
  min-height: 40px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 8px;
  background: var(--hwt-surface);
  color: var(--hwt-text);
  font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hwt-saved-search {
  min-width: 0;
  padding: 0 11px;
}

.hwt-saved-filter,
.hwt-saved-sort {
  padding: 0 8px;
}

.hwt-saved-search:focus,
.hwt-saved-filter:focus,
.hwt-saved-sort:focus,
.hwt-saved-action:focus-visible,
.hwt-saved-load-more:focus-visible,
.hwt-saved-remove:focus-visible,
.hwt-saved-source:focus-visible {
  border-color: var(--hwt-focus);
  outline: 2px solid color-mix(in srgb, var(--hwt-focus) 26%, transparent);
  outline-offset: 1px;
}

.hwt-saved-action {
  padding: 0 10px;
  cursor: pointer;
}

.hwt-saved-action:hover,
.hwt-saved-load-more:hover {
  border-color: var(--hwt-accent);
  color: var(--hwt-accent-strong);
}

.hwt-saved-import {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hwt-saved-import-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.hwt-saved-summary,
.hwt-saved-import-status {
  margin: 10px 2px 0;
  color: var(--hwt-text-muted);
  font-size: 11px;
}

.hwt-saved-import-status:empty {
  display: none;
}

.hwt-saved-list {
  margin-top: 10px;
  border: 1px solid var(--hwt-border);
  background: var(--hwt-surface);
}

.hwt-saved-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 10px;
  padding: 13px 12px;
  border-bottom: 1px solid var(--hwt-border);
}

.hwt-saved-item:last-child {
  border-bottom: 0;
}

.hwt-saved-item-content {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.hwt-saved-item-content:hover .hwt-saved-item-title {
  color: var(--hwt-accent-strong);
}

.hwt-saved-item-title {
  margin: 0;
  color: var(--hwt-text);
  font-size: 13px;
  font-weight: 720;
  line-height: 1.35;
}

.hwt-saved-item-meta,
.hwt-saved-item-preview {
  margin: 4px 0 0;
  color: var(--hwt-text-muted);
  font-size: 11px;
  line-height: 1.4;
}

.hwt-saved-item-preview {
  color: var(--hwt-text-soft);
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.hwt-saved-source,
.hwt-saved-remove {
  min-height: 34px;
  padding: 0 8px;
  border: 0;
  background: transparent;
  color: var(--hwt-text-muted);
  cursor: pointer;
  font: 650 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-decoration: none;
}

.hwt-saved-source:hover {
  color: var(--hwt-accent-strong);
}

.hwt-saved-remove:hover {
  color: #b42318;
}

.hwt-saved-source {
  grid-column: 2;
  display: inline-flex;
  align-items: center;
}

.hwt-saved-remove {
  grid-column: 2;
}

.hwt-saved-empty {
  padding: 36px 18px;
  color: var(--hwt-text-muted);
  text-align: center;
  font-size: 12px;
}

.hwt-saved-load-more {
  width: 100%;
  margin-top: 10px;
  cursor: pointer;
}

/* Footer */
.hwt-settings-footer {
  flex: 0 0 auto;
  min-height: 63px;
  padding: 10px 18px calc(10px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--hwt-border);
  background: color-mix(in srgb, var(--hwt-bg) 94%, transparent);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hwt-reset-btn {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid var(--hwt-border-strong);
  border-radius: 10px;
  background: var(--hwt-surface);
  color: var(--hwt-text-soft);
  cursor: pointer;
  font: 650 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  transition:
    border-color 150ms ease,
    color 150ms ease,
    background 150ms ease;
}

.hwt-reset-btn:hover {
  border-color: var(--hwt-accent);
  background: var(--hwt-surface-hover);
  color: var(--hwt-accent-strong);
}

.hwt-reset-btn:focus-visible {
  outline: 3px solid rgba(255, 98, 15, 0.2);
  outline-offset: 2px;
}

.hwt-version {
  color: var(--hwt-text-soft);
  font: 600 10px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.02em;
}

@media (max-width: 520px) {
  .hwt-settings-panel {
    width: 100vw;
    border-left: 0;
  }

  .hwt-settings-header {
    padding-left: 16px;
    padding-right: 14px;
  }

  .hwt-settings-search-bar,
  .hwt-settings-tabs,
  .hwt-settings-reload,
  .hwt-settings-content,
  .hwt-settings-footer {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hwt-settings-gear {
    right: max(12px, env(safe-area-inset-right));
    width: 48px;
    min-width: 48px;
    padding: 0 6px;
    border-radius: 15px;
  }

  .hwt-settings-gear-label,
  .hwt-settings-gear > kbd {
    display: none;
  }

  .hwt-settings-row {
    min-height: 68px;
  }

  .hwt-settings-scope {
    max-width: 108px;
  }

  .hwt-saved-toolbar {
    grid-template-columns: 1fr 1fr;
  }

  .hwt-saved-search {
    grid-column: 1 / -1;
  }

  .hwt-saved-action {
    min-height: 44px;
  }

  .hwt-saved-item {
    padding: 13px 10px;
  }

  .hwt-saved-remove,
  .hwt-saved-source {
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hwt-settings-gear,
  .hwt-settings-overlay,
  .hwt-settings-panel,
  .hwt-settings-close,
  .hwt-settings-search,
  .hwt-settings-row,
  .hwt-toggle-track,
  .hwt-toggle-knob,
  .hwt-number-input,
  .hwt-text-input,
  .hwt-color-input,
  .hwt-reset-btn {
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }

  .hwt-toggle.hwt-pulse .hwt-toggle-track {
    animation: none;
  }
}
`;
