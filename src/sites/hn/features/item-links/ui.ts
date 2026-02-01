const HACKERWEB_URL = "https://hackerweb.app/#/item/";
const LINK_CLASS = "hn-links-hweb";

function createLink(itemId: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = `${HACKERWEB_URL}${itemId}`;
  link.textContent = "[hweb]";
  link.className = LINK_CLASS;
  link.title = "View on HackerWeb";
  return link;
}

function getSubtext(row: Element): Element | null {
  return row.nextElementSibling?.querySelector(".subtext") ?? null;
}

function injectLink(subtext: Element, itemId: string): void {
  if (subtext.querySelector(`.${LINK_CLASS}`)) return;
  subtext.appendChild(createLink(itemId));
}

/** Inject [hweb] links into story listings. */
export function injectStoryLinks(): void {
  for (const row of document.querySelectorAll<HTMLTableRowElement>(
    "tr.athing[id]"
  )) {
    const subtext = getSubtext(row);
    if (row.id && subtext) injectLink(subtext, row.id);
  }
}

/** Inject [hweb] link on comment pages. */
export function injectCommentPageLink(): void {
  const itemId = new URLSearchParams(location.search).get("id");
  const row = document.querySelector("tr.athing[id]");
  const subtext = row && getSubtext(row);
  if (itemId && subtext) injectLink(subtext, itemId);
}
