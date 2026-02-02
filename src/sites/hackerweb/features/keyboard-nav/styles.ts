export const CSS = `
/* Keyboard Navigation - highlight focused comment */

/* Focus indicator for keyboard navigation */
li.hwt-kb-focus {
  outline: 2px solid #ff6600;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Ensure focused comment is visible */
li.hwt-kb-focus > p:first-of-type {
  background: rgba(255, 102, 0, 0.1);
}

/* Keyboard help overlay */
.hwt-kb-help {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  z-index: 10000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hwt-kb-help h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #ff6600;
}

.hwt-kb-help table {
  border-collapse: collapse;
}

.hwt-kb-help td {
  padding: 2px 0;
}

.hwt-kb-help kbd {
  display: inline-block;
  background: #333;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 2px 6px;
  margin-right: 8px;
  min-width: 20px;
  text-align: center;
}
`;
