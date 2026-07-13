import { getEventTargetElement, qs, qsa } from "../../../utils/dom-helpers";
import {
  extractComment,
  extractHackerWebStory,
  extractHnStory,
  type SavedSite,
} from "./adapters";
import {
  hasSavedItem,
  makeSavedKey,
  removeSavedItem,
  saveItem,
  type SavedItem,
  type SavedItemKind,
} from "./store";

const SAVE_BUTTON_CLASS = "hwt-save-btn";
const SAVED_ATTR = "data-hwt-saved";

function setButtonState(button: HTMLButtonElement, saved: boolean): void {
  const kind = button.dataset["hwtSavedKind"] as SavedItemKind | undefined;
  const noun = kind === "story" ? "story" : "comment";
  button.classList.toggle("hwt-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute(
    "aria-label",
    saved ? `Remove saved ${noun}` : `Save ${noun}`
  );
  button.title = saved ? `Remove saved ${noun}` : `Save ${noun}`;
  button.textContent = saved ? "★" : "☆";
}

function createSaveButton(kind: SavedItemKind, id: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `${SAVE_BUTTON_CLASS} hwt-save-${kind}`;
  button.dataset["hwtSavedKind"] = kind;
  button.dataset["hwtSavedId"] = id;
  setButtonState(button, hasSavedItem(makeSavedKey(kind, id)));
  return button;
}

function addHnStoryButtons(): void {
  for (const row of qsa<HTMLElement>("tr.athing[id]")) {
    const item = extractHnStory(row);
    const subtext = row.nextElementSibling?.querySelector(".subtext");
    if (
      !item ||
      !subtext ||
      qs(`.${SAVE_BUTTON_CLASS}.hwt-save-story`, subtext)
    ) {
      continue;
    }
    subtext.append(
      document.createTextNode(" | "),
      createSaveButton("story", item.id)
    );
  }
}

function addHackerWebStoryButtons(): void {
  for (const row of qsa<HTMLElement>("#hwlist > li[id^='story-']")) {
    if (qs(`.${SAVE_BUTTON_CLASS}.hwt-save-story`, row)) continue;
    const item = extractHackerWebStory(row);
    if (!item) continue;
    row.insertBefore(
      createSaveButton("story", item.id),
      qs(".detail-disclosure-button", row)
    );
  }

  const header = qs<HTMLElement>("#view-comments .post-content header");
  if (header && !qs(`.${SAVE_BUTTON_CLASS}.hwt-save-story`, header)) {
    const item = extractHackerWebStory(header);
    const metadata = qs(".metadata", header);
    if (item && metadata)
      metadata.appendChild(createSaveButton("story", item.id));
  }
}

function addCommentButtons(site: SavedSite): void {
  const selector =
    site === "hn" ? ".comtr" : "#view-comments section.comments li";
  const metadataSelector = site === "hn" ? ".comhead" : "p.metadata";

  for (const comment of qsa<HTMLElement>(selector)) {
    const metadata = qs(metadataSelector, comment);
    if (!metadata || qs(`.${SAVE_BUTTON_CLASS}.hwt-save-comment`, metadata)) {
      continue;
    }
    const item = extractComment(comment, site);
    if (!item) continue;
    const button = createSaveButton("comment", item.id);
    const author = qs(site === "hn" ? ".hnuser" : ".user", metadata);
    if (author) author.after(button);
    else metadata.appendChild(button);
  }
}

export function addSavedButtons(site: SavedSite): void {
  if (site === "hn") addHnStoryButtons();
  else addHackerWebStoryButtons();
  addCommentButtons(site);
  syncSavedButtons();
}

function itemForButton(
  button: HTMLButtonElement,
  site: SavedSite
): SavedItem | null {
  const kind = button.dataset["hwtSavedKind"] as SavedItemKind | undefined;
  if (kind === "comment") {
    const comment = button.closest(site === "hn" ? ".comtr" : "li");
    return comment ? extractComment(comment, site) : null;
  }
  if (site === "hn") {
    const story = button.closest("tr")?.previousElementSibling;
    return story?.matches("tr.athing") ? extractHnStory(story) : null;
  }
  const story = button.closest("#hwlist > li, header");
  return story ? extractHackerWebStory(story) : null;
}

export function syncSavedButtons(): void {
  for (const button of qsa<HTMLButtonElement>(`.${SAVE_BUTTON_CLASS}`)) {
    const kind = button.dataset["hwtSavedKind"] as SavedItemKind | undefined;
    const id = button.dataset["hwtSavedId"];
    if (!kind || !id) continue;
    const saved = hasSavedItem(makeSavedKey(kind, id));
    setButtonState(button, saved);
    button.closest("li, tr")?.setAttribute(SAVED_ATTR, String(saved));
  }
}

export function setupSavedHandler(site: SavedSite): () => void {
  const handler = (event: MouseEvent) => {
    const target = getEventTargetElement(event);
    const button = target?.closest(`.${SAVE_BUTTON_CLASS}`);
    if (!(button instanceof HTMLButtonElement)) return;
    event.preventDefault();
    event.stopPropagation();

    const item = itemForButton(button, site);
    if (!item) return;
    const succeeded = hasSavedItem(item.key)
      ? removeSavedItem(item.key)
      : saveItem(item);
    if (!succeeded) {
      button.dataset["hwtError"] = "Storage unavailable";
      button.title = "Could not update Saved; browser storage is unavailable";
      return;
    }
    button.removeAttribute("data-hwt-error");
    syncSavedButtons();
  };

  document.addEventListener("click", handler);
  return () => document.removeEventListener("click", handler);
}
