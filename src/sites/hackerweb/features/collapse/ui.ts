import {
  qs,
  qsa,
  getEventTargetElement,
  setDataBool,
  getDataBool,
} from "../../../../utils/dom-helpers";
import {
  type CommentId,
  asCommentId,
  getCollapsedState,
  setCollapsedState,
} from "./state";

const SEL = {
  comment: "section li",
  replies: ":scope > ul",
  child: ":scope > li",
  toggle: ":scope > button.hwc-toggle",
  originalToggle: ":scope > button.comments-toggle:not(.hwc-toggle)",
  anyToggle: "button.hwc-toggle",
} as const;

const LEFT_GUTTER_PX = 15;

function getReplies(li: Element): HTMLUListElement | null {
  return qs<HTMLUListElement>(SEL.replies, li);
}

function countReplies(ul: HTMLUListElement | null): number {
  if (!ul) return 0;
  let count = 0;
  for (const child of qsa<HTMLLIElement>(SEL.child, ul)) {
    count += 1 + countReplies(getReplies(child));
  }
  return count;
}

function findRoot(li: HTMLLIElement): HTMLLIElement {
  let current = li;
  while (current.parentElement?.closest("li") instanceof HTMLLIElement) {
    current = current.parentElement.closest("li") as HTMLLIElement;
  }
  return current;
}

function getCommentId(li: HTMLLIElement): CommentId | null {
  const href = li
    .querySelector('p.metadata time a[href*="item?id="]')
    ?.getAttribute("href");
  const match = href?.match(/item\?id=(\d+)/);
  return (
    asCommentId(match?.[1]) ??
    asCommentId(li.dataset["id"]) ??
    asCommentId(li.id)
  );
}

function setCollapsed(li: HTMLLIElement, collapsed: boolean): void {
  const ul = getReplies(li);
  const btn = qs<HTMLButtonElement>(SEL.toggle, li);
  if (!ul || !btn) return;

  ul.style.display = collapsed ? "none" : "";
  setDataBool(btn, "collapsed", collapsed);
  btn.classList.toggle("hwc-collapsed", collapsed);

  const count = btn.dataset["count"] ?? "0";
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.setAttribute(
    "aria-label",
    `${collapsed ? "Expand" : "Collapse"} ${count} replies`
  );

  const id = getCommentId(li);
  if (id) setCollapsedState(id, collapsed);
}

function collapseThread(root: HTMLLIElement): void {
  for (const btn of qsa<HTMLButtonElement>(SEL.anyToggle, root)) {
    if (getDataBool(btn, "collapsed")) continue;
    const li = btn.closest("li");
    if (li instanceof HTMLLIElement) setCollapsed(li, true);
  }
}

function createToggle(ul: HTMLUListElement): HTMLButtonElement | null {
  if (!ul.children.length) return null;

  const count = countReplies(ul);
  const collapsed = getComputedStyle(ul).display === "none";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `comments-toggle hwc-toggle${collapsed ? " hwc-collapsed" : ""}`;
  btn.innerHTML = `<span class="hwc-arrow">▶</span> ${count}`;
  btn.dataset["count"] = String(count);
  btn.title = "Click to toggle, Shift+click to collapse thread";
  btn.setAttribute("aria-expanded", String(!collapsed));
  btn.setAttribute(
    "aria-label",
    `${collapsed ? "Expand" : "Collapse"} ${count} replies`
  );
  setDataBool(btn, "collapsed", collapsed);

  return btn;
}

export function injectButtons(): void {
  for (const li of qsa<HTMLLIElement>(SEL.comment)) {
    const ul = getReplies(li);
    if (!ul?.children.length) continue;
    if (qs(SEL.toggle, li)) continue;

    qs(SEL.originalToggle, li)?.remove();

    const btn = createToggle(ul);
    if (btn) li.insertBefore(btn, ul);

    const id = getCommentId(li);
    if (id && getCollapsedState(id)) setCollapsed(li, true);
  }
}

function highlightAncestors(start: HTMLLIElement | null): void {
  qsa(".hwc-hl").forEach((el) => el.classList.remove("hwc-hl"));
  for (
    let li = start;
    li instanceof HTMLLIElement;
    li = li.parentElement?.closest("li") ?? null
  ) {
    li.classList.add("hwc-hl");
  }
}

function onToggleClick(e: MouseEvent, btn: HTMLButtonElement): void {
  e.stopPropagation();
  e.preventDefault();

  const li = btn.closest("li");
  if (!(li instanceof HTMLLIElement)) return;

  if (e.shiftKey) {
    collapseThread(findRoot(li));
  } else {
    setCollapsed(li, !getDataBool(btn, "collapsed"));
  }
}

function onGutterClick(e: MouseEvent, li: HTMLLIElement): void {
  const clickX = e.clientX - li.getBoundingClientRect().left;
  if (clickX > LEFT_GUTTER_PX) return;

  const btn = qs<HTMLButtonElement>(SEL.toggle, li);
  if (!btn) return;

  e.preventDefault();
  setCollapsed(li, !getDataBool(btn, "collapsed"));
}

export function setupEventListeners(): void {
  document.addEventListener("mouseover", (e) => {
    const target = getEventTargetElement(e);
    const li = target?.closest(SEL.comment);
    if (li instanceof HTMLLIElement) highlightAncestors(li);
  });

  document.addEventListener("click", (e) => {
    const target = getEventTargetElement(e);
    if (!target) return;

    const btn = target.closest("button.hwc-toggle");
    if (btn instanceof HTMLButtonElement) {
      onToggleClick(e, btn);
      return;
    }

    const li = target.closest(SEL.comment);
    if (li instanceof HTMLLIElement) onGutterClick(e, li);
  });
}
