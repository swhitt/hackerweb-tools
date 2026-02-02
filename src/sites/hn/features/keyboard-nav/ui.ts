import { qsa, qs } from "../../../../utils/dom-helpers";
import { getKeyboardManager } from "../../../../utils/keyboard-manager";
import {
  scrollToElement,
  isElementInViewport,
} from "../../../../utils/scroll-position";
import { recordVisit } from "../../../../utils/visit-tracker";

const SEL = {
  storyRows: "tr.athing",
  titleLink: ".titleline > a",
  commentsLink: 'a[href^="item?id="]',
} as const;

const FOCUS_CLASS = "hwt-kb-focus";
const HELP_CLASS = "hwt-kb-help";

let focusedIndex = -1;
let helpVisible = false;

/**
 * Get all story rows
 */
function getStories(): HTMLTableRowElement[] {
  return Array.from(qsa<HTMLTableRowElement>(SEL.storyRows));
}

/**
 * Get currently focused story
 */
function getFocused(): HTMLTableRowElement | null {
  return qs(`.${FOCUS_CLASS}`);
}

/**
 * Set focus to a story at the given index
 */
function setFocus(index: number): void {
  const stories = getStories();
  if (stories.length === 0) return;

  // Clamp index
  index = Math.max(0, Math.min(index, stories.length - 1));

  // Remove previous focus
  getFocused()?.classList.remove(FOCUS_CLASS);

  // Set new focus
  const story = stories[index];
  if (!story) return;

  story.classList.add(FOCUS_CLASS);
  focusedIndex = index;

  // Scroll into view if needed
  if (!isElementInViewport(story)) {
    scrollToElement(story, 100, "smooth");
  }
}

/**
 * Move focus to next story
 */
function focusNext(): void {
  const stories = getStories();
  if (focusedIndex < 0) {
    setFocus(0);
  } else {
    setFocus(Math.min(focusedIndex + 1, stories.length - 1));
  }
}

/**
 * Move focus to previous story
 */
function focusPrev(): void {
  if (focusedIndex < 0) {
    setFocus(0);
  } else {
    setFocus(Math.max(focusedIndex - 1, 0));
  }
}

/**
 * Open the focused story's link
 */
function openStory(): void {
  const focused = getFocused();
  if (!focused) return;

  const link = qs<HTMLAnchorElement>(SEL.titleLink, focused);
  if (link) {
    // Track as visited
    const id = focused.id;
    if (id) recordVisit(id);

    // Open link
    window.open(link.href, "_blank");
  }
}

/**
 * Open the focused story's comments
 */
function openComments(): void {
  const focused = getFocused();
  if (!focused) return;

  // Comments link is in the next row
  const subtextRow = focused.nextElementSibling;
  if (!subtextRow) return;

  const links = qsa<HTMLAnchorElement>(SEL.commentsLink, subtextRow);
  // Find the comments link (last link with item?id=)
  const commentsLink = links[links.length - 1];

  if (commentsLink) {
    // Track as visited
    const id = focused.id;
    if (id) recordVisit(id);

    window.location.href = commentsLink.href;
  }
}

/**
 * Toggle keyboard help overlay
 */
function toggleHelp(): void {
  helpVisible = !helpVisible;
  let help = qs(`.${HELP_CLASS}`);

  if (helpVisible) {
    if (!help) {
      help = document.createElement("div");
      help.className = HELP_CLASS;
      help.innerHTML = `
        <h4>Keyboard Shortcuts</h4>
        <table>
          <tr><td><kbd>j</kbd></td><td>Next story</td></tr>
          <tr><td><kbd>k</kbd></td><td>Previous story</td></tr>
          <tr><td><kbd>o</kbd></td><td>Open story link</td></tr>
          <tr><td><kbd>c</kbd></td><td>Open comments</td></tr>
          <tr><td><kbd>?</kbd></td><td>Toggle help</td></tr>
        </table>
      `;
      document.body.appendChild(help);
    }
  } else {
    help?.remove();
  }
}

/**
 * Register all keyboard shortcuts
 */
export function registerKeyboardShortcuts(): () => void {
  const km = getKeyboardManager();
  km.init();

  const unsubscribers = [
    km.register("j", focusNext, {
      description: "Next story",
      scope: "hn",
    }),
    km.register("k", focusPrev, {
      description: "Previous story",
      scope: "hn",
    }),
    km.register("o", openStory, {
      description: "Open story link",
      scope: "hn",
    }),
    km.register("c", openComments, {
      description: "Open comments",
      scope: "hn",
    }),
    km.register("?", toggleHelp, {
      description: "Toggle help",
      scope: "hn",
    }),
  ];

  return () => {
    unsubscribers.forEach((unsub) => unsub());
    qs(`.${HELP_CLASS}`)?.remove();
    getFocused()?.classList.remove(FOCUS_CLASS);
  };
}
