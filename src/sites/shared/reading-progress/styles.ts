export const CSS = `
/* Reading Progress Bar */
.hwt-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: transparent;
  z-index: 2147482998;
  pointer-events: none;
}

.hwt-progress-bar-fill {
  height: 100%;
  background: #ff6600;
  width: 100%;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.1s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .hwt-progress-bar-fill {
    transition: none;
  }
}
`;
