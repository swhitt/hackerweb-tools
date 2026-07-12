export const CSS = `
.hwt-save-btn {
  appearance: none;
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  min-height: 24px;
  margin: -4px 2px -4px 6px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #828282;
  font: 600 15px/1 system-ui, sans-serif;
  cursor: pointer;
  vertical-align: middle;
}

.hwt-save-btn:hover,
.hwt-save-btn:focus-visible,
.hwt-save-btn.hwt-saved {
  color: #ff6600;
}

.hwt-save-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}

.hwt-save-btn[data-hwt-error] {
  color: #b42318;
}

[data-hwt-saved="true"] {
  background-color: rgba(255, 102, 0, 0.04) !important;
}

#hwlist > li {
  position: relative;
}

#hwlist > li > .hwt-save-story {
  position: absolute;
  top: 0;
  right: 38px;
  bottom: 0;
  z-index: 2;
  width: 38px;
  margin: 0;
  border-left: 1px solid rgba(128, 128, 128, 0.2);
}

#view-comments .post-content header .hwt-save-story {
  margin-left: 8px;
}

html.hwt-dark .hwt-save-btn {
  color: #aeb0b5;
}

html.hwt-dark .hwt-save-btn:hover,
html.hwt-dark .hwt-save-btn:focus-visible,
html.hwt-dark .hwt-save-btn.hwt-saved {
  color: #ff8a3d;
}
`;
