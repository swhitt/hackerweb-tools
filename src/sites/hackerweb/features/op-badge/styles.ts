export const CSS = `
/* OP Badge - highlights original poster in comment threads */
.hwt-op-badge {
  display: inline-block;
  background: #ff6600;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 2px;
  margin-left: 4px;
  vertical-align: middle;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Subtle highlight for OP's comments */
li[data-is-op="true"] > p:first-of-type {
  border-left: 2px solid #ff6600;
  padding-left: 8px;
  margin-left: -10px;
}
`;
