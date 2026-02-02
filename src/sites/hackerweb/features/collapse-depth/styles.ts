export const CSS = `
/* Collapse by Depth - auto-collapsed indicator */

/* Indicator for auto-collapsed comments */
li[data-auto-collapsed="true"] > button.hwc-toggle::after {
  content: " (auto)";
  font-size: 10px;
  color: #828282;
  font-style: italic;
}
`;
