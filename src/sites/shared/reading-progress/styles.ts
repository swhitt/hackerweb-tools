export const CSS = `
/* Reading Progress Bar */
.hwt-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: transparent;
  z-index: 99999;
  pointer-events: none;
}

.hwt-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6600, #ff9933);
  width: 0%;
  transition: width 0.1s ease-out;
}
`;
