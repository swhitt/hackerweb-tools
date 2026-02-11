export const CSS = `
/* Settings Panel - Gear Button */
.hwt-settings-gear {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ff6600;
  border: none;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hwt-settings-gear:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.hwt-settings-gear:active {
  transform: scale(0.95);
}

.hwt-settings-gear svg {
  width: 24px;
  height: 24px;
  fill: white;
}

/* Overlay */
.hwt-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.hwt-settings-overlay.hwt-visible {
  opacity: 1;
  visibility: visible;
}

/* Panel */
.hwt-settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  max-width: 90vw;
  height: 100vh;
  background: #e5e3dc;
  z-index: 10000;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  color: #3a3a3a;
}

.hwt-settings-panel.hwt-visible {
  transform: translateX(0);
}

/* Header */
.hwt-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #c5c2b8;
  background: #dad8d0;
  flex-shrink: 0;
}

.hwt-settings-title {
  font-size: 18px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0;
}

.hwt-settings-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.hwt-settings-close:hover {
  background: #ccc9c0;
}

.hwt-settings-close svg {
  width: 20px;
  height: 20px;
  stroke: #555;
}

/* Content area */
.hwt-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

/* Sections */
.hwt-settings-section {
  margin-bottom: 24px;
}

.hwt-settings-section:last-child {
  margin-bottom: 0;
}

.hwt-settings-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #777;
  margin: 0 0 12px 0;
}

/* Group (card-like container) */
.hwt-settings-group {
  background: #dddbd3;
  border-radius: 10px;
  padding: 4px 0;
  margin-bottom: 12px;
}

.hwt-settings-group:last-child {
  margin-bottom: 0;
}

.hwt-settings-group-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 8px 16px 4px;
  margin: 0;
}

/* Row (each setting item) */
.hwt-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  min-height: 44px;
  transition: background 0.15s ease;
}

.hwt-settings-row:hover {
  background: rgba(0, 0, 0, 0.04);
}

.hwt-settings-row-info {
  flex: 1;
  min-width: 0;
  padding-right: 12px;
}

.hwt-settings-row-label {
  font-size: 14px;
  font-weight: 500;
  color: #2a2a2a;
  margin: 0 0 2px 0;
}

.hwt-settings-row-description {
  font-size: 12px;
  color: #777;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Toggle Switch (iOS-style) */
.hwt-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.hwt-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.hwt-toggle-track {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #b8b5ab;
  border-radius: 24px;
  transition: background 0.25s ease;
}

.hwt-toggle input:checked + .hwt-toggle-track {
  background: #ff6600;
}

.hwt-toggle-knob {
  position: absolute;
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hwt-toggle input:checked + .hwt-toggle-track .hwt-toggle-knob {
  transform: translateX(20px);
}

/* Focus state for keyboard accessibility */
.hwt-toggle input:focus-visible + .hwt-toggle-track {
  outline: 2px solid #4a9eff;
  outline-offset: 2px;
}

/* Pulse animation on change */
.hwt-toggle.hwt-pulse .hwt-toggle-track {
  animation: hwt-pulse 0.4s ease;
}

@keyframes hwt-pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 102, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 102, 0, 0); }
}

/* Number Input */
.hwt-number-input {
  width: 70px;
  height: 32px;
  border: 1px solid #c5c2b8;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 14px;
  text-align: center;
  background: #eeecea;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.hwt-number-input:focus {
  outline: none;
  border-color: #ff6600;
  box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.15);
}

.hwt-number-input::-webkit-inner-spin-button,
.hwt-number-input::-webkit-outer-spin-button {
  opacity: 1;
}

/* Text Input */
.hwt-text-input {
  width: 100px;
  height: 32px;
  border: 1px solid #c5c2b8;
  border-radius: 6px;
  padding: 0 8px;
  font-size: 14px;
  background: #eeecea;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.hwt-text-input:focus {
  outline: none;
  border-color: #ff6600;
  box-shadow: 0 0 0 2px rgba(255, 102, 0, 0.15);
}

/* Color Input */
.hwt-color-input {
  width: 44px;
  height: 32px;
  border: 1px solid #c5c2b8;
  border-radius: 6px;
  padding: 2px;
  cursor: pointer;
  background: #eeecea;
}

.hwt-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.hwt-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

/* Footer */
.hwt-settings-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #c5c2b8;
  background: #dad8d0;
  flex-shrink: 0;
}

.hwt-reset-btn {
  padding: 8px 16px;
  border: 1px solid #c5c2b8;
  border-radius: 6px;
  background: #eeecea;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.hwt-reset-btn:hover {
  border-color: #ff6600;
  color: #ff6600;
}

.hwt-version {
  font-size: 12px;
  color: #888;
}

/* Welcome State */
.hwt-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.hwt-welcome-icon {
  width: 64px;
  height: 64px;
  background: #ff6600;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.hwt-welcome-icon svg {
  width: 36px;
  height: 36px;
  fill: white;
}

.hwt-welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: #2a2a2a;
  margin: 0 0 8px 0;
}

.hwt-welcome-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  max-width: 280px;
  line-height: 1.5;
}

.hwt-welcome-shortcuts {
  background: #dddbd3;
  border-radius: 10px;
  padding: 16px;
  width: 100%;
  max-width: 260px;
  margin-bottom: 24px;
}

.hwt-welcome-shortcut {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.hwt-welcome-shortcut:not(:last-child) {
  border-bottom: 1px solid #c5c2b8;
}

.hwt-welcome-shortcut-key {
  font-family: ui-monospace, monospace;
  font-size: 12px;
  background: #ccc9c0;
  padding: 4px 8px;
  border-radius: 4px;
  color: #2a2a2a;
}

.hwt-welcome-shortcut-desc {
  font-size: 13px;
  color: #666;
}

.hwt-explore-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #ff6600;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.15s ease;
}

.hwt-explore-btn:hover {
  background: #e55a00;
}

.hwt-explore-btn:active {
  transform: scale(0.98);
}

/* Dark Mode Overrides */
.hwt-dark .hwt-settings-panel {
  background: #1a1a1a;
  color: #e0e0e0;
}

.hwt-dark .hwt-settings-header {
  background: #222;
  border-color: #333;
}

.hwt-dark .hwt-settings-title {
  color: #e0e0e0;
}

.hwt-dark .hwt-settings-close:hover {
  background: #333;
}

.hwt-dark .hwt-settings-close svg {
  stroke: #aaa;
}

.hwt-dark .hwt-settings-section-title {
  color: #888;
}

.hwt-dark .hwt-settings-group {
  background: #252525;
}

.hwt-dark .hwt-settings-group-title {
  color: #888;
}

.hwt-dark .hwt-settings-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.hwt-dark .hwt-settings-row-label {
  color: #e0e0e0;
}

.hwt-dark .hwt-settings-row-description {
  color: #888;
}

.hwt-dark .hwt-toggle-track {
  background: #444;
}

.hwt-dark .hwt-number-input,
.hwt-dark .hwt-text-input {
  background: #2a2a2a;
  border-color: #444;
  color: #e0e0e0;
}

.hwt-dark .hwt-color-input {
  background: #2a2a2a;
  border-color: #444;
}

.hwt-dark .hwt-settings-footer {
  background: #222;
  border-color: #333;
}

.hwt-dark .hwt-reset-btn {
  background: #2a2a2a;
  border-color: #444;
  color: #aaa;
}

.hwt-dark .hwt-reset-btn:hover {
  border-color: #ff6600;
  color: #ff6600;
}

.hwt-dark .hwt-welcome-shortcuts {
  background: #252525;
}

.hwt-dark .hwt-welcome-shortcut:not(:last-child) {
  border-color: #333;
}

.hwt-dark .hwt-welcome-shortcut-key {
  background: #333;
  color: #e0e0e0;
}

.hwt-dark .hwt-welcome-title {
  color: #e0e0e0;
}

.hwt-dark .hwt-welcome-desc,
.hwt-dark .hwt-welcome-shortcut-desc {
  color: #888;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .hwt-settings-gear,
  .hwt-settings-overlay,
  .hwt-settings-panel,
  .hwt-toggle-track,
  .hwt-toggle-knob,
  .hwt-number-input,
  .hwt-text-input,
  .hwt-reset-btn,
  .hwt-explore-btn {
    transition: none;
  }

  .hwt-toggle.hwt-pulse .hwt-toggle-track {
    animation: none;
  }
}

/* Site toggle styling */
.hwt-site-toggle {
  padding: 12px 16px;
}

.hwt-site-toggle .hwt-settings-row-label {
  font-size: 15px;
}
`;
