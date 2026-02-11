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

/* Base */
html.hwt-dark {
  background-color: #1b1b1d;
  color-scheme: dark;
}
html.hwt-dark body {
  background-color: #1b1b1d;
}

/* Main content area */
html.hwt-dark #hnmain {
  background-color: #27272a;
}

/* Header - keep iconic orange */
html.hwt-dark #hnmain > tbody > tr:first-child td,
html.hwt-dark table[bgcolor="#ff6600"] {
  background-color: #ff6600 !important;
}
html.hwt-dark #hnmain > tbody > tr:first-child a,
html.hwt-dark td.pagetop a,
html.hwt-dark .pagetop,
html.hwt-dark span.pagetop b a {
  color: #000;
}

/* Titles */
html.hwt-dark .athing .titleline a {
  color: #e4e4e7;
}
html.hwt-dark .athing .titleline a:visited {
  color: #6e6e72;
}

/* Hostname / domain */
html.hwt-dark .titleline .sitebit a,
html.hwt-dark .titleline .sitestr,
html.hwt-dark .sitebit.comhead a {
  color: #8b8b90;
}
html.hwt-dark .titleline .sitebit {
  color: #8b8b90;
}

/* Meta / subtext */
html.hwt-dark .subtext,
html.hwt-dark .subtext a {
  color: #747478;
}
html.hwt-dark .subtext a:hover {
  color: #e4e4e7;
}
html.hwt-dark .score {
  color: #ff8040;
}
html.hwt-dark .hnuser {
  color: #9090a0;
}

/* Rank numbers */
html.hwt-dark .rank {
  color: #606065;
}

/* Comments */
html.hwt-dark .comhead,
html.hwt-dark .comhead a {
  color: #747478;
}
html.hwt-dark .comhead a:hover {
  color: #e4e4e7;
}
html.hwt-dark .comment,
html.hwt-dark .commtext {
  color: #c0c0c5;
}
html.hwt-dark .comment a {
  color: #6caed8;
}
html.hwt-dark .comment a:visited {
  color: #5a8aaa;
}
html.hwt-dark .reply a {
  color: #747478;
}
html.hwt-dark .reply a:hover {
  color: #e4e4e7;
}

/* Comment indent lines */
html.hwt-dark .ind img {
  opacity: 0.15;
}

/* Vote arrows */
html.hwt-dark .votearrow {
  filter: brightness(0.85);
}

/* Inputs */
html.hwt-dark input[type="text"],
html.hwt-dark input[type="password"],
html.hwt-dark textarea {
  background-color: #35353a;
  color: #e4e4e7;
  border: 1px solid #48484d;
  border-radius: 3px;
}
html.hwt-dark input[type="submit"] {
  background-color: #35353a;
  color: #e4e4e7;
  border: 1px solid #48484d;
  cursor: pointer;
}

/* Footer */
html.hwt-dark .yclinks,
html.hwt-dark .yclinks a {
  color: #606065;
}
html.hwt-dark .yclinks a:hover {
  color: #e4e4e7;
}

/* Visited stories */
html.hwt-dark tr.athing[data-visited="true"] .titleline a {
  color: #505055;
}

/* Score threshold - titles stay uniform */
html.hwt-dark tr.athing[data-score-tier="high"] .titleline a {
  color: #e4e4e7;
  font-weight: inherit;
}
html.hwt-dark tr.athing[data-score-tier="high"] + tr .subtext .score {
  color: #ff8040;
}
html.hwt-dark tr.athing[data-score-tier="low"] .titleline a {
  color: inherit;
  font-weight: inherit;
}

/* Domain badges - uniform in dark mode */
html.hwt-dark .titleline .sitestr {
  background: rgba(255,255,255,0.06);
  color: #8b8b90;
}
html.hwt-dark .titleline[data-site] .sitestr {
  background: rgba(255,255,255,0.06);
  color: #8b8b90;
}

/* Time grouping */
html.hwt-dark .hwt-time-group {
  background: #30303a;
  color: #747478;
  border-left-color: #ff6600;
}

/* Keyboard nav */
html.hwt-dark tr.athing.hwt-kb-focus {
  background: rgba(255, 102, 0, 0.12);
}
html.hwt-dark tr.athing.hwt-kb-focus .titleline a {
  color: #ff9050;
}
html.hwt-dark tr.athing.hwt-kb-focus + tr {
  background: rgba(255, 102, 0, 0.06);
}

/* Bookmarks */
html.hwt-dark .hwt-bookmarks-panel {
  background: #27272a;
  border-color: #3a3a3f;
}
html.hwt-dark .hwt-bookmark-item {
  border-color: #3a3a3f;
}
html.hwt-dark .hwt-bookmark-item:hover {
  background: #30303a;
}
html.hwt-dark .hwt-bookmark-item-text {
  color: #e4e4e7;
}

/* Hide-read toggle */
html.hwt-dark .hwt-hide-read-toggle {
  color: #747478;
}
html.hwt-dark .hwt-hide-read-toggle.active {
  color: #ff6600;
}

/* Reading progress bar */
html.hwt-dark .hwt-progress-bar-fill {
  background: linear-gradient(90deg, #ff6600, #ff8533);
}
`;
