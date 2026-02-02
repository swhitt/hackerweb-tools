export const CSS = `
/* New Comments - highlight comments since last visit */

/* New comment indicator */
li[data-is-new="true"] {
  position: relative;
}

li[data-is-new="true"]::before {
  content: "";
  position: absolute;
  left: -2px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #ff6600;
  border-radius: 1px;
}

/* New comment background highlight (subtle) */
li[data-is-new="true"] > p:first-of-type {
  background: rgba(255, 102, 0, 0.05);
  margin-left: -8px;
  padding-left: 8px;
  margin-right: -8px;
  padding-right: 8px;
  border-radius: 2px;
}

/* "X new comments" indicator in header */
.hwt-new-count {
  display: inline-block;
  background: #ff6600;
  color: white;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
}
`;
