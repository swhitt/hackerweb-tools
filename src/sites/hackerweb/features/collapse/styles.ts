const STYLES = `
/* Wider main column */
body > section {
  max-width: 900px !important;
}

/* Better readability */
.comment-content,
section li > p {
  line-height: 1.6 !important;
}

/* More breathing room between comments */
section li {
  margin-bottom: 12px !important;
}

/* Toggle button */
.hwc-toggle.comments-toggle {
  display: inline-block !important;
  font-size: 0.75em !important;
  font-weight: 600 !important;
  margin: 2px 0 !important;
  padding: 2px 4px !important;
  white-space: nowrap !important;
  color: #828282 !important;
}

/* Collapsed state - same muted color */
.hwc-toggle.hwc-collapsed {
  color: #828282 !important;
}

/* Ancestor highlight on hover */
li.hwc-hl {
  background-color: rgba(255,255,255,0.04) !important;
}
`;

let injected = false;

export function injectStyles() {
  if (injected) return;
  injected = true;

  if (typeof GM_addStyle === "function") {
    GM_addStyle(STYLES);
    return;
  }

  const style = document.createElement("style");
  style.id = "hwc-styles";
  style.textContent = STYLES;
  document.head.appendChild(style);
}

declare function GM_addStyle(css: string): void;
