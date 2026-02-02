export const CSS_HACKERWEB = `
/* Dark Mode - HackerWeb */
html.hwt-dark {
  filter: invert(1) hue-rotate(180deg);
}

/* Don't invert images and videos */
html.hwt-dark img,
html.hwt-dark video,
html.hwt-dark iframe {
  filter: invert(1) hue-rotate(180deg);
}
`;

export const CSS_HN = `
/* Dark Mode - Hacker News */
html.hwt-dark {
  background-color: #1a1a1a;
}

html.hwt-dark body {
  background-color: #1a1a1a;
}

html.hwt-dark #hnmain {
  background-color: #2d2d2d;
}

html.hwt-dark .athing .titleline a {
  color: #e0e0e0;
}

html.hwt-dark .athing .titleline a:visited {
  color: #888;
}

html.hwt-dark .subtext,
html.hwt-dark .subtext a {
  color: #828282;
}

html.hwt-dark .comhead,
html.hwt-dark .comhead a {
  color: #828282;
}

html.hwt-dark .comment {
  color: #c0c0c0;
}

html.hwt-dark .comment a {
  color: #6b9fcf;
}

html.hwt-dark td.pagetop a {
  color: #000;
}

html.hwt-dark .score {
  color: #ff6600;
}

html.hwt-dark input,
html.hwt-dark textarea {
  background-color: #333;
  color: #e0e0e0;
  border-color: #555;
}
`;
