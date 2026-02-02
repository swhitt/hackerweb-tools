import { qsa, qs } from "../../../../utils/dom-helpers";

const SEL = {
  titleline: ".titleline",
  titleLink: ".titleline > a",
  sitebit: ".titleline .sitebit",
  sitestr: ".titleline .sitestr",
} as const;

const FAVICON_CLASS = "hwt-favicon";
const FAVICON_ERROR_CLASS = "hwt-favicon-error";
const PROCESSED_ATTR = "data-hwt-preview";

/**
 * Get the domain from a URL
 */
function getDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Get favicon URL for a domain
 */
function getFaviconUrl(domain: string): string {
  // Use Google's favicon service
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

/**
 * Create a favicon image element
 */
function createFavicon(domain: string): HTMLImageElement {
  const img = document.createElement("img");
  img.className = FAVICON_CLASS;
  img.src = getFaviconUrl(domain);
  img.alt = "";
  img.loading = "lazy";

  // Hide if favicon fails to load
  img.onerror = () => {
    img.classList.add(FAVICON_ERROR_CLASS);
  };

  return img;
}

/**
 * Add favicons and enhanced domain display to stories
 */
export function addInlinePreviews(): void {
  for (const titleline of qsa<HTMLSpanElement>(SEL.titleline)) {
    // Skip if already processed
    if (titleline.hasAttribute(PROCESSED_ATTR)) continue;
    titleline.setAttribute(PROCESSED_ATTR, "true");

    const titleLink = qs<HTMLAnchorElement>(SEL.titleLink, titleline);
    if (!titleLink) continue;

    const url = titleLink.href;
    const domain = getDomain(url);
    if (!domain) continue;

    // Add site data attribute for styling
    titleline.setAttribute("data-site", domain);

    // Add favicon before the title link
    const favicon = createFavicon(domain);
    titleLink.insertAdjacentElement("beforebegin", favicon);
  }
}
