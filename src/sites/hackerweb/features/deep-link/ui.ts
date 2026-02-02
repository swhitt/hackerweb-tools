import { qsa, qs, getEventTargetElement } from "../../../../utils/dom-helpers";

const SEL = {
  comments: "section li",
  timeLink: 'p.metadata time a[href*="item?id="]',
} as const;

const DEEP_LINK_CLASS = "hwt-deep-link";
const TOAST_CLASS = "hwt-toast";

/**
 * Extract item ID from a time link
 */
function getItemId(link: HTMLAnchorElement): string | null {
  const href = link.getAttribute("href");
  const match = href?.match(/item\?id=(\d+)/);
  return match?.[1] ?? null;
}

/**
 * Show a brief toast notification
 */
function showToast(message: string): void {
  // Remove any existing toast
  qs(`.${TOAST_CLASS}`)?.remove();

  const toast = document.createElement("div");
  toast.className = TOAST_CLASS;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Remove after animation completes
  setTimeout(() => toast.remove(), 2000);
}

/**
 * Copy text to clipboard and show confirmation
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API not available - return false
    return false;
  }
}

/**
 * Handle click on a time link
 */
async function handleTimeLinkClick(
  e: MouseEvent,
  link: HTMLAnchorElement
): Promise<void> {
  const itemId = getItemId(link);
  if (!itemId) return;

  // Build the HN permalink
  const hnUrl = `https://news.ycombinator.com/item?id=${itemId}`;

  e.preventDefault();
  e.stopPropagation();

  const success = await copyToClipboard(hnUrl);
  showToast(success ? "Link copied!" : "Failed to copy link");
}

/**
 * Mark time links as deep links
 */
export function injectDeepLinks(): void {
  for (const comment of qsa<HTMLLIElement>(SEL.comments)) {
    const timeLink = qs<HTMLAnchorElement>(SEL.timeLink, comment);
    if (!timeLink) continue;

    // Skip if already processed
    if (timeLink.classList.contains(DEEP_LINK_CLASS)) continue;

    timeLink.classList.add(DEEP_LINK_CLASS);
    timeLink.title = "Click to copy link";
  }
}

/**
 * Set up click handler for deep links
 */
export function setupDeepLinkHandler(): void {
  document.addEventListener("click", (e) => {
    const target = getEventTargetElement(e);
    if (!target) return;

    const link = target.closest(`a.${DEEP_LINK_CLASS}`);
    if (link instanceof HTMLAnchorElement) {
      void handleTimeLinkClick(e, link);
    }
  });
}
