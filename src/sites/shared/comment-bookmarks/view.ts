import { qs } from "../../../utils/dom-helpers";
import { syncSavedButtons } from "./controls";
import {
  exportSavedItems,
  getSavedItems,
  importSavedItems,
  removeSavedItem,
  SAVED_CHANGE_EVENT,
  type SavedItemKind,
  type SavedSort,
} from "./store";

const PAGE_SIZE = 20;
let savedView: HTMLDivElement | null = null;
let visibleLimit = PAGE_SIZE;
let viewFilter: "all" | SavedItemKind = "all";
let viewSort: SavedSort = "newest";
let viewQuery = "";

function formatSavedAt(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function downloadJson(): void {
  const blob = new Blob([exportSavedItems()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hwt-saved-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function renderSavedView(): void {
  if (!savedView) return;
  const list = qs<HTMLElement>(".hwt-saved-list", savedView);
  const summary = qs<HTMLElement>(".hwt-saved-summary", savedView);
  const loadMore = qs<HTMLButtonElement>(".hwt-saved-load-more", savedView);
  if (!list || !summary || !loadMore) return;

  const query = viewQuery.trim().toLowerCase();
  const allItems = getSavedItems(viewSort);
  const filtered = allItems.filter((item) => {
    if (viewFilter !== "all" && item.kind !== viewFilter) return false;
    return (
      !query ||
      [item.title, item.text, item.author, item.kind]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  });
  const visible = filtered.slice(0, visibleLimit);

  summary.textContent = `${allItems.length} saved · showing ${visible.length}`;
  list.innerHTML = "";
  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hwt-saved-empty";
    empty.textContent = allItems.length
      ? "No saved items match these filters."
      : "Nothing saved yet. Use ☆ beside a story or comment.";
    list.appendChild(empty);
  }

  for (const item of visible) {
    const row = document.createElement("article");
    row.className = "hwt-saved-item";

    const content = document.createElement("a");
    content.className = "hwt-saved-item-content";
    content.href = item.url;
    const title = document.createElement("h3");
    title.className = "hwt-saved-item-title";
    title.textContent = item.title;
    content.appendChild(title);

    const metadata = document.createElement("p");
    metadata.className = "hwt-saved-item-meta";
    metadata.textContent = [
      item.kind,
      item.author,
      `saved ${formatSavedAt(item.savedAt)}`,
    ]
      .filter(Boolean)
      .join(" · ");
    content.appendChild(metadata);

    if (item.text) {
      const preview = document.createElement("p");
      preview.className = "hwt-saved-item-preview";
      preview.textContent = item.text;
      content.appendChild(preview);
    }
    row.appendChild(content);

    if (item.sourceUrl && item.kind === "story") {
      const source = document.createElement("a");
      source.className = "hwt-saved-source";
      source.href = item.sourceUrl;
      source.textContent = "Source";
      source.setAttribute("aria-label", `Open source for ${item.title}`);
      row.appendChild(source);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "hwt-saved-remove";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", `Remove ${item.title} from Saved`);
    remove.addEventListener("click", () => {
      if (removeSavedItem(item.key)) {
        syncSavedButtons();
        renderSavedView();
      }
    });
    row.appendChild(remove);
    list.appendChild(row);
  }
  loadMore.hidden = visible.length >= filtered.length;
}

export function getSavedCount(): number {
  return getSavedItems().length;
}

export function createSavedView(): HTMLDivElement {
  if (savedView) {
    renderSavedView();
    return savedView;
  }

  const view = document.createElement("div");
  view.className = "hwt-saved-view";
  const toolbar = document.createElement("div");
  toolbar.className = "hwt-saved-toolbar";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "hwt-saved-search";
  search.placeholder = "Search saved";
  search.setAttribute("aria-label", "Search saved stories and comments");
  search.addEventListener("input", () => {
    viewQuery = search.value;
    visibleLimit = PAGE_SIZE;
    renderSavedView();
  });
  toolbar.appendChild(search);

  const filter = document.createElement("select");
  filter.className = "hwt-saved-filter";
  filter.setAttribute("aria-label", "Filter saved items");
  const filterOptions: [string, string][] = [
    ["all", "All items"],
    ["story", "Stories"],
    ["comment", "Comments"],
  ];
  for (const [value, label] of filterOptions) {
    filter.appendChild(new Option(label, value));
  }
  filter.addEventListener("change", () => {
    viewFilter = filter.value as typeof viewFilter;
    visibleLimit = PAGE_SIZE;
    renderSavedView();
  });
  toolbar.appendChild(filter);

  const sort = document.createElement("select");
  sort.className = "hwt-saved-sort";
  sort.setAttribute("aria-label", "Sort saved items");
  const sortOptions: [SavedSort, string][] = [
    ["newest", "Newest saved"],
    ["oldest", "Oldest saved"],
    ["title", "Title A–Z"],
    ["type", "Type"],
  ];
  for (const [value, label] of sortOptions) {
    sort.appendChild(new Option(label, value));
  }
  sort.addEventListener("change", () => {
    viewSort = sort.value as SavedSort;
    visibleLimit = PAGE_SIZE;
    renderSavedView();
  });
  toolbar.appendChild(sort);

  const exportButton = document.createElement("button");
  exportButton.type = "button";
  exportButton.className = "hwt-saved-action";
  exportButton.textContent = "Export JSON";
  exportButton.addEventListener("click", downloadJson);
  toolbar.appendChild(exportButton);

  const importButton = document.createElement("button");
  importButton.type = "button";
  importButton.className = "hwt-saved-action hwt-saved-import";
  importButton.textContent = "Import JSON";
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json,.json";
  importInput.className = "hwt-saved-import-input";
  const importFile = async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    const valid = importSavedItems(await file.text(), "merge");
    const status = qs<HTMLElement>(".hwt-saved-import-status", view);
    if (status) {
      status.textContent = valid
        ? "Imported into Saved."
        : "That file is not a valid HWT Saved export.";
    }
    importInput.value = "";
    renderSavedView();
  };
  importInput.addEventListener("change", () => {
    void importFile();
  });
  importButton.addEventListener("click", () => importInput.click());
  toolbar.append(importButton, importInput);
  view.appendChild(toolbar);

  const summary = document.createElement("p");
  summary.className = "hwt-saved-summary";
  view.appendChild(summary);
  const importStatus = document.createElement("p");
  importStatus.className = "hwt-saved-import-status";
  importStatus.setAttribute("role", "status");
  view.appendChild(importStatus);
  const list = document.createElement("div");
  list.className = "hwt-saved-list";
  view.appendChild(list);

  const loadMore = document.createElement("button");
  loadMore.type = "button";
  loadMore.className = "hwt-saved-load-more";
  loadMore.textContent = "Load more";
  loadMore.addEventListener("click", () => {
    visibleLimit += PAGE_SIZE;
    renderSavedView();
  });
  view.appendChild(loadMore);

  savedView = view;
  window.addEventListener(SAVED_CHANGE_EVENT, renderSavedView);
  renderSavedView();
  return view;
}
