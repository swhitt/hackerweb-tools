import { getCollapsedState, setCollapsedState } from "./state";

const SELECTORS = {
  // All comments in the thread
  commentSection: "section.comments",
  // Individual comment items
  comment: "section.comments li",
  // HW's native toggle (we skip comments that have this)
  nativeToggle: "button.comments-toggle",
} as const;

export function addCollapseButtons() {
  const comments = document.querySelectorAll(SELECTORS.comment);

  comments.forEach((comment) => {
    if (!(comment instanceof HTMLElement)) return;

    // Skip if already processed
    if (comment.dataset.hwcInit) return;
    comment.dataset.hwcInit = "true";

    // Find direct child ul (replies container)
    const replies = comment.querySelector(":scope > ul");
    if (!(replies instanceof HTMLElement)) return;

    // Skip if no actual replies
    if (replies.children.length === 0) return;

    // Skip if this comment already has HW's native toggle (first-level comments)
    const hasNativeToggle = comment.querySelector(
      `:scope > ${SELECTORS.nativeToggle}`
    );
    if (hasNativeToggle) return;

    // Find the metadata paragraph to append our button
    const meta = comment.querySelector(":scope > p.metadata");
    if (!meta) return;

    const button = createCollapseButton(comment, replies);
    meta.appendChild(button);

    // Restore collapsed state if previously collapsed
    const commentId = getCommentId(comment);
    if (commentId && getCollapsedState(commentId)) {
      collapse(replies, button);
    }
  });
}

function createCollapseButton(
  comment: HTMLElement,
  replies: HTMLElement
): HTMLElement {
  const button = document.createElement("button");
  button.className = "hwc-collapse-btn";
  button.type = "button";
  updateButtonState(button, replies, false);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCollapse(comment, replies, button);
  });

  return button;
}

function toggleCollapse(
  comment: HTMLElement,
  replies: HTMLElement,
  button: HTMLElement
) {
  const isCollapsed = replies.classList.contains("hwc-collapsed");

  if (isCollapsed) {
    expand(replies, button);
  } else {
    collapse(replies, button);
  }

  // Persist state
  const commentId = getCommentId(comment);
  if (commentId) {
    setCollapsedState(commentId, !isCollapsed);
  }
}

function collapse(replies: HTMLElement, button: HTMLElement) {
  replies.classList.add("hwc-collapsed");
  updateButtonState(button, replies, true);
}

function expand(replies: HTMLElement, button: HTMLElement) {
  replies.classList.remove("hwc-collapsed");
  updateButtonState(button, replies, false);
}

function updateButtonState(
  button: HTMLElement,
  replies: HTMLElement,
  isCollapsed: boolean
) {
  const count = countNestedComments(replies);
  if (isCollapsed) {
    button.textContent = `[+${count}]`;
    button.title = `Expand ${count} ${count === 1 ? "reply" : "replies"}`;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", `Expand ${count} collapsed replies`);
  } else {
    button.textContent = "[-]";
    button.title = "Collapse thread";
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-label", "Collapse this comment thread");
  }
}

function countNestedComments(replies: HTMLElement): number {
  return replies.querySelectorAll("li").length;
}

function getCommentId(comment: HTMLElement): string | null {
  // Try to find the HN item link in the metadata
  const timeLink = comment.querySelector(
    'p.metadata time a[href*="item?id="]'
  );
  if (timeLink) {
    const href = timeLink.getAttribute("href");
    const match = href?.match(/item\?id=(\d+)/);
    if (match) return match[1];
  }

  // Fallback: use data attributes or element id
  return comment.dataset.id || comment.id || null;
}
