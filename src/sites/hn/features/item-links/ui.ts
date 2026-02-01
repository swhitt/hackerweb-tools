const HACKERWEB_URL = "https://hackerweb.app/#/item/";
const LINK_CLASS = "hn-links-hweb";

function createHackerWebLink(itemId: string): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = `${HACKERWEB_URL}${itemId}`;
  link.textContent = "[hweb]";
  link.className = LINK_CLASS;
  link.title = "View on HackerWeb";
  return link;
}

/**
 * Inject [hweb] links into story listings (front page, /newest, /best, etc.)
 * Each story row: <tr class="athing" id="{itemId}">
 * Link goes in the subtext row (next to "X comments")
 */
export function injectStoryLinks(): void {
  const storyRows =
    document.querySelectorAll<HTMLTableRowElement>("tr.athing[id]");

  for (const row of storyRows) {
    const itemId = row.id;
    if (!itemId) continue;

    // The subtext row is the next sibling <tr>
    const subtextRow = row.nextElementSibling;
    if (!subtextRow) continue;

    const subtext = subtextRow.querySelector(".subtext");
    if (!subtext) continue;

    // Don't double-inject
    if (subtext.querySelector(`.${LINK_CLASS}`)) continue;

    const link = createHackerWebLink(itemId);
    subtext.appendChild(link);
  }
}

/**
 * Inject [hweb] link on comment pages (/item?id=X)
 * Add near the story title area
 */
export function injectCommentPageLink(): void {
  // Check if we're on a comment page
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");
  if (!itemId) return;

  // Find the title row - it has the story title
  const titleRow = document.querySelector("tr.athing[id]");
  if (!titleRow) return;

  // Check the subtext area for comment pages
  const subtextRow = titleRow.nextElementSibling;
  if (!subtextRow) return;

  const subtext = subtextRow.querySelector(".subtext");
  if (!subtext) return;

  // Don't double-inject
  if (subtext.querySelector(`.${LINK_CLASS}`)) return;

  const link = createHackerWebLink(itemId);
  subtext.appendChild(link);
}
