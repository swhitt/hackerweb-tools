import { qsa, qs } from "../../../../utils/dom-helpers";
import { getKeyboardManager } from "../../../../utils/keyboard-manager";
import {
  scrollToElement,
  isElementInViewport,
} from "../../../../utils/scroll-position";

const SEL = {
  comments: "section li",
  toggle: ":scope > button.hwc-toggle",
} as const;

const FOCUS_CLASS = "hwt-kb-focus";
const HELP_CLASS = "hwt-kb-help";

// Timeout for vim-style "gg" key sequence (ms)
const GG_SEQUENCE_TIMEOUT_MS = 500;

let focusedIndex = -1;
let helpVisible = false;

/**
 * Get all comment list items
 */
function getComments(): HTMLLIElement[] {
  return Array.from(qsa<HTMLLIElement>(SEL.comments));
}

/**
 * Get currently focused comment
 */
function getFocused(): HTMLLIElement | null {
  return qs(`.${FOCUS_CLASS}`);
}

/**
 * Set focus to a comment at the given index
 */
function setFocus(index: number): void {
  const comments = getComments();
  if (comments.length === 0) return;

  // Clamp index
  index = Math.max(0, Math.min(index, comments.length - 1));

  // Remove previous focus
  getFocused()?.classList.remove(FOCUS_CLASS);

  // Set new focus
  const comment = comments[index];
  if (!comment) return;

  comment.classList.add(FOCUS_CLASS);
  focusedIndex = index;

  // Scroll into view if needed
  if (!isElementInViewport(comment)) {
    scrollToElement(comment, 100, "smooth");
  }
}

/**
 * Move focus to next comment
 */
function focusNext(): void {
  const comments = getComments();
  if (focusedIndex < 0) {
    setFocus(0);
  } else {
    setFocus(Math.min(focusedIndex + 1, comments.length - 1));
  }
}

/**
 * Move focus to previous comment
 */
function focusPrev(): void {
  if (focusedIndex < 0) {
    setFocus(0);
  } else {
    setFocus(Math.max(focusedIndex - 1, 0));
  }
}

/**
 * Move focus to parent comment
 */
function focusParent(): void {
  const focused = getFocused();
  if (!focused) return;

  const parent = focused.parentElement?.closest("li");
  if (parent instanceof HTMLLIElement) {
    const comments = getComments();
    const parentIndex = comments.indexOf(parent);
    if (parentIndex >= 0) {
      setFocus(parentIndex);
    }
  }
}

/**
 * Move focus to first child comment
 */
function focusChild(): void {
  const focused = getFocused();
  if (!focused) return;

  const child = qs<HTMLLIElement>("ul > li", focused);
  if (child) {
    const comments = getComments();
    const childIndex = comments.indexOf(child);
    if (childIndex >= 0) {
      setFocus(childIndex);
    }
  }
}

/**
 * Toggle collapse on focused comment
 */
function toggleFocused(): void {
  const focused = getFocused();
  if (!focused) return;

  const toggle = qs<HTMLButtonElement>(SEL.toggle, focused);
  toggle?.click();
}

/**
 * Move focus to first comment
 */
function focusFirst(): void {
  setFocus(0);
}

/**
 * Move focus to last comment
 */
function focusLast(): void {
  const comments = getComments();
  setFocus(comments.length - 1);
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
          <tr><td><kbd>j</kbd></td><td>Next comment</td></tr>
          <tr><td><kbd>k</kbd></td><td>Previous comment</td></tr>
          <tr><td><kbd>l</kbd></td><td>First child</td></tr>
          <tr><td><kbd>h</kbd></td><td>Parent comment</td></tr>
          <tr><td><kbd>o</kbd></td><td>Toggle collapse</td></tr>
          <tr><td><kbd>g g</kbd></td><td>First comment</td></tr>
          <tr><td><kbd>G</kbd></td><td>Last comment</td></tr>
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
      description: "Next comment",
      scope: "hackerweb",
    }),
    km.register("k", focusPrev, {
      description: "Previous comment",
      scope: "hackerweb",
    }),
    km.register("h", focusParent, {
      description: "Parent comment",
      scope: "hackerweb",
    }),
    km.register("l", focusChild, {
      description: "First child comment",
      scope: "hackerweb",
    }),
    km.register("o", toggleFocused, {
      description: "Toggle collapse",
      scope: "hackerweb",
    }),
    km.register("shift+g", focusLast, {
      description: "Last comment",
      scope: "hackerweb",
    }),
    km.register("?", toggleHelp, {
      description: "Toggle help",
      scope: "hackerweb",
    }),
  ];

  // Track g key for gg sequence
  let gPressed = false;
  let gTimeout: ReturnType<typeof setTimeout> | null = null;

  const unregisterG = km.register(
    "g",
    () => {
      if (gPressed) {
        focusFirst();
        gPressed = false;
        if (gTimeout) clearTimeout(gTimeout);
      } else {
        gPressed = true;
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, GG_SEQUENCE_TIMEOUT_MS);
      }
    },
    {
      description: "First comment (press twice)",
      scope: "hackerweb",
    }
  );

  unsubscribers.push(unregisterG);

  return () => {
    if (gTimeout) clearTimeout(gTimeout);
    unsubscribers.forEach((unsub) => unsub());
    qs(`.${HELP_CLASS}`)?.remove();
    getFocused()?.classList.remove(FOCUS_CLASS);
  };
}
