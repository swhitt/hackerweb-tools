export const CSS = `
/* Hide Read Stories */

/* Visited/read story indicator */
tr.athing[data-visited="true"] .titleline a {
  color: #828282;
}

tr.athing[data-visited="true"] .titleline a:visited {
  color: #828282;
}

/* Hide read stories when toggle is active */
body.hwt-hide-read tr.athing[data-visited="true"],
body.hwt-hide-read tr.athing[data-visited="true"] + tr,
body.hwt-hide-read tr.athing[data-visited="true"] + tr + tr.spacer {
  display: none;
}

/* Toggle button */
.hwt-hide-read-toggle {
  font-size: 10px;
  color: #828282;
  cursor: pointer;
  margin-left: 10px;
}

.hwt-hide-read-toggle:hover {
  text-decoration: underline;
}

.hwt-hide-read-toggle.active {
  color: #ff6600;
  font-weight: bold;
}
`;
