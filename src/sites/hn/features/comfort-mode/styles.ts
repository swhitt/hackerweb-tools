export const CSS = `
/* A restrained reading layout that keeps Hacker News looking like Hacker News. */

html.hwt-comfort body {
  margin: 0;
  background: #e8e8e2;
}

html.hwt-comfort #hnmain {
  width: calc(100% - 24px) !important;
  max-width: 1060px;
  margin: 12px auto !important;
  border: 1px solid #d6d6ce;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
}

html.hwt-comfort #hnmain > tbody > tr:first-child > td {
  padding: 3px 4px;
}

html.hwt-comfort .itemlist .spacer td {
  height: 6px;
}

html.hwt-comfort .athing .titleline {
  font-size: 14px;
  line-height: 1.4;
}

html.hwt-comfort .subtext {
  font-size: 11px;
  line-height: 1.45;
}

html.hwt-comfort .athing td {
  padding-top: 3px;
  padding-bottom: 1px;
}

html.hwt-comfort .rank {
  font-size: 13px;
}

html.hwt-comfort .comment,
html.hwt-comfort .commtext {
  font-size: 14px;
  line-height: 1.55;
  max-width: 80ch;
}

html.hwt-comfort pre {
  max-width: 100%;
  overflow-x: auto;
}

html.hwt-dark.hwt-comfort body {
  background: #1b1b1d;
}

html.hwt-dark.hwt-comfort #hnmain {
  border-color: #38383c;
}

@media (max-width: 700px) {
  html.hwt-comfort body {
    background: #f6f6ef;
  }

  html.hwt-comfort #hnmain {
    width: 100% !important;
    margin: 0 !important;
    border: 0;
  }

  html.hwt-dark.hwt-comfort body {
    background: #1b1b1d;
  }
}
`;
