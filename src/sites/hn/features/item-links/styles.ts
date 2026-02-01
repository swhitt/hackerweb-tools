import { createStyleInjector } from "../../../../utils/style-injector";

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

const inject = createStyleInjector("hn-links-styles");

export function injectStyles(): void {
  inject(STYLES);
}
