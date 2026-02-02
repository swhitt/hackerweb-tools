export const CSS = `
/* Time Grouping - group stories by age */

/* Group header */
.hwt-time-group {
  display: block;
  background: #f6f6ef;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
  font-weight: bold;
  color: #828282;
  border-left: 3px solid #ff6600;
}

/* First group has no top margin */
.hwt-time-group:first-of-type {
  margin-top: 0;
}

/* Make group headers sticky */
.hwt-time-group {
  position: sticky;
  top: 0;
  z-index: 10;
}
`;
