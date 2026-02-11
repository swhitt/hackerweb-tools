export const CSS = `
/* Comfort Mode - centered, readable layout */

html.hwt-comfort #hnmain {
  max-width: 920px;
  margin: 0 auto;
  font-size: 15px;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Dark mode shadow */
html.hwt-dark.hwt-comfort #hnmain {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* More vertical space between stories */
html.hwt-comfort .itemlist .spacer td {
  height: 8px;
}

/* Title readability */
html.hwt-comfort .athing .titleline {
  font-size: 15px;
  line-height: 1.4;
}

/* Subtext */
html.hwt-comfort .subtext {
  font-size: 11px;
  line-height: 1.5;
}

/* Story row padding */
html.hwt-comfort .athing td {
  padding-top: 4px;
  padding-bottom: 2px;
}

/* Rank numbers */
html.hwt-comfort .rank {
  font-size: 14px;
}

/* Comment readability */
html.hwt-comfort .comment {
  font-size: 14px;
  line-height: 1.6;
}
`;
