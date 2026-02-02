export const CSS = `
/* Inline Preview - favicon and enhanced domain display */

/* Favicon next to title */
.hwt-favicon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  margin-right: 6px;
  border-radius: 2px;
  background: #f6f6ef;
}

/* Hide broken favicon images */
.hwt-favicon-error {
  display: none;
}

/* Domain styling */
.titleline .sitestr {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
}

/* Known site badges */
.titleline[data-site="github.com"] .sitestr {
  background: #24292e;
  color: white;
}

.titleline[data-site="twitter.com"] .sitestr,
.titleline[data-site="x.com"] .sitestr {
  background: #1da1f2;
  color: white;
}

.titleline[data-site="youtube.com"] .sitestr {
  background: #ff0000;
  color: white;
}

.titleline[data-site="medium.com"] .sitestr {
  background: #00ab6c;
  color: white;
}
`;
