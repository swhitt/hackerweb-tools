const HCKRNEWS_URL = "https://hckrnews.com/";
const LINK_CLASS = "hn-links-header";

export function injectHeaderLink(): void {
  // Don't double-inject
  if (document.querySelector(`.${LINK_CLASS}`)) return;

  // Find the .pagetop area with navigation links
  const pagetop = document.querySelector(".pagetop");
  if (!pagetop) return;

  // Create separator and link
  const separator = document.createTextNode(" | ");
  const link = document.createElement("a");
  link.href = HCKRNEWS_URL;
  link.textContent = "hckrnews";
  link.className = LINK_CLASS;

  pagetop.appendChild(separator);
  pagetop.appendChild(link);
}
