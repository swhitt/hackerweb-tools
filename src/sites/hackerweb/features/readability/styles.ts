export const CSS = `
/* HackerWeb comment readability, scoped so list and article views stay native. */
html.hwt-hackerweb-readable #view-comments.view {
  max-width: var(--hwt-max-width) !important;
}

html.hwt-hackerweb-readable #view-comments section.comments li {
  margin-bottom: 10px !important;
  font-size: var(--hwt-font-size) !important;
  line-height: var(--hwt-line-height) !important;
}

html.hwt-hackerweb-readable #view-comments section.comments li > p.metadata {
  display: flex !important;
  align-items: baseline !important;
  gap: 8px !important;
}

html.hwt-hackerweb-readable #view-comments section.comments li > p.metadata time {
  margin-left: auto !important;
}

html.hwt-hackerweb-readable #view-comments section.comments ul ul {
  margin-left: 6px !important;
  padding-left: 14px !important;
  border-left: 1px solid rgba(128, 128, 128, 0.28) !important;
}

html.hwt-hackerweb-readable #view-comments section.comments pre {
  max-width: 100%;
  overflow-x: auto;
  padding: 10px;
  border: 1px solid rgba(128, 128, 128, 0.22);
  border-radius: 3px;
}

@media (max-width: 600px) {
  html.hwt-hackerweb-readable #view-comments section.comments ul ul {
    margin-left: 2px !important;
    padding-left: 10px !important;
  }
}
`;
