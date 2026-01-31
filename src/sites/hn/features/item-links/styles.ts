const STYLES = `
/* HackerWeb link styling */
.hn-links-hweb {
  margin-left: 4px;
  font-size: 0.85em;
  color: #828282;
}

.hn-links-hweb:visited {
  color: #828282;
}
`;

let injected = false;

export function injectStyles(): void {
  if (injected) return;
  injected = true;

  if (typeof GM_addStyle === "function") {
    GM_addStyle(STYLES);
    return;
  }

  const style = document.createElement("style");
  style.id = "hn-links-styles";
  style.textContent = STYLES;
  document.head.appendChild(style);
}

declare function GM_addStyle(css: string): void;
