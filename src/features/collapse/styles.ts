const STYLES = `
/* Collapse button - appears after time in metadata */
.hwc-collapse-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-family: monospace;
  font-size: 0.9em;
  padding: 0 0.3em;
  margin-left: 0.5em;
  opacity: 0.6;
  transition: opacity 0.15s ease;
  vertical-align: baseline;
}

.hwc-collapse-btn:hover {
  opacity: 1;
}

.hwc-collapse-btn:focus {
  outline: 1px dotted currentColor;
  outline-offset: 1px;
}

/* Collapsed replies */
.hwc-collapsed {
  display: none !important;
}
`;

let injected = false;

export function injectStyles() {
  if (injected) return;

  const style = document.createElement("style");
  style.id = "hwc-styles";
  style.textContent = STYLES;
  document.head.appendChild(style);
  injected = true;
}
