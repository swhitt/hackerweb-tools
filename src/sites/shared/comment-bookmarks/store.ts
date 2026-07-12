export type SavedItemKind = "story" | "comment";
export type SavedItemSource = "hn" | "hackerweb";
export type SavedSort = "newest" | "oldest" | "title" | "type";

export interface SavedItem {
  key: string;
  id: string;
  kind: SavedItemKind;
  url: string;
  sourceUrl?: string;
  title: string;
  text: string;
  author: string;
  source: SavedItemSource;
  savedAt: number;
}

interface SavedEnvelope {
  version: 1;
  items: SavedItem[];
}

interface LegacyBookmark {
  id?: unknown;
  url?: unknown;
  title?: unknown;
  text?: unknown;
  author?: unknown;
  timestamp?: unknown;
}

declare function GM_getValue<T>(key: string, defaultValue: T): T;
declare function GM_setValue(key: string, value: unknown): void;
declare function GM_addValueChangeListener(
  key: string,
  callback: (
    key: string,
    oldValue: unknown,
    newValue: unknown,
    remote: boolean
  ) => void
): number;

export const SAVED_STORAGE_KEY = "hwt:saved:v1";
export const SAVED_CHANGE_EVENT = "hwt:saved-changed";
const LEGACY_IDS_KEY = "hwt:state:bookmarks";
const LEGACY_DATA_KEY = "hwt:state:bookmarkData";
const LOG_PREFIX = "[HWT Saved]";
const MAX_ITEMS = 5000;

let cache: SavedItem[] | null = null;
let observingStorage = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSavedItem(value: unknown): value is SavedItem {
  if (!isRecord(value)) return false;

  const id = value["id"];
  const url = value["url"];
  const sourceUrl = value["sourceUrl"];
  const isHttpUrl = (candidate: unknown): candidate is string => {
    if (typeof candidate !== "string") return false;
    try {
      const protocol = new URL(candidate).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  };

  return (
    typeof value["key"] === "string" &&
    typeof id === "string" &&
    value["key"] === `hn:${id}` &&
    (value["kind"] === "story" || value["kind"] === "comment") &&
    isHttpUrl(url) &&
    (sourceUrl === undefined || isHttpUrl(sourceUrl)) &&
    typeof value["title"] === "string" &&
    value["title"].length <= 240 &&
    typeof value["text"] === "string" &&
    value["text"].length <= 320 &&
    typeof value["author"] === "string" &&
    value["author"].length <= 80 &&
    (value["source"] === "hn" || value["source"] === "hackerweb") &&
    typeof value["savedAt"] === "number" &&
    Number.isFinite(value["savedAt"]) &&
    value["savedAt"] >= 0
  );
}

function decodeEnvelope(raw: unknown): SavedEnvelope | null {
  try {
    const parsed = typeof raw === "string" ? (JSON.parse(raw) as unknown) : raw;
    if (!isRecord(parsed) || parsed["version"] !== 1) return null;
    const items = parsed["items"];
    if (
      !Array.isArray(items) ||
      items.length > MAX_ITEMS ||
      !items.every(isSavedItem)
    ) {
      return null;
    }
    return {
      version: 1,
      items: [...new Map(items.map((item) => [item.key, item])).values()],
    };
  } catch {
    return null;
  }
}

function readStoredValue(): unknown {
  try {
    if (typeof GM_getValue === "function") {
      return GM_getValue<unknown>(SAVED_STORAGE_KEY, null);
    }
    return localStorage.getItem(SAVED_STORAGE_KEY);
  } catch (error) {
    console.warn(LOG_PREFIX, "Failed to read saved items:", error);
    return null;
  }
}

function writeItems(items: SavedItem[]): boolean {
  const envelope: SavedEnvelope = { version: 1, items };
  const serialized = JSON.stringify(envelope);

  try {
    if (typeof GM_setValue === "function") {
      GM_setValue(SAVED_STORAGE_KEY, serialized);
    } else {
      localStorage.setItem(SAVED_STORAGE_KEY, serialized);
    }
    cache = items;
    window.dispatchEvent(
      new CustomEvent(SAVED_CHANGE_EVENT, { detail: { count: items.length } })
    );
    return true;
  } catch (error) {
    console.warn(LOG_PREFIX, "Failed to save items:", error);
    return false;
  }
}

function observeStorageChanges(): void {
  if (observingStorage) return;
  observingStorage = true;

  const applyExternalValue = (value: unknown) => {
    const envelope = decodeEnvelope(value);
    if (!envelope) return;
    cache = envelope.items;
    window.dispatchEvent(
      new CustomEvent(SAVED_CHANGE_EVENT, {
        detail: { count: envelope.items.length },
      })
    );
  };

  if (typeof GM_addValueChangeListener === "function") {
    GM_addValueChangeListener(
      SAVED_STORAGE_KEY,
      (_key, _oldValue, newValue, remote) => {
        if (remote) applyExternalValue(newValue);
      }
    );
    return;
  }

  window.addEventListener("storage", (event) => {
    if (event.key === SAVED_STORAGE_KEY && event.newValue) {
      applyExternalValue(event.newValue);
    }
  });
}

function readLegacyItems(): SavedItem[] {
  try {
    const idsRaw = localStorage.getItem(LEGACY_IDS_KEY);
    const dataRaw = localStorage.getItem(LEGACY_DATA_KEY);
    const ids: unknown = idsRaw ? JSON.parse(idsRaw) : [];
    const data: unknown = dataRaw ? JSON.parse(dataRaw) : {};
    if (!Array.isArray(ids) || !isRecord(data)) return [];

    return ids.flatMap((legacyId): SavedItem[] => {
      if (typeof legacyId !== "string") return [];
      const value = data[legacyId];
      const legacy: LegacyBookmark = isRecord(value) ? value : {};
      const id = typeof legacy.id === "string" ? legacy.id : legacyId;

      return [
        {
          key: `hn:${id}`,
          id,
          kind: "comment",
          url:
            typeof legacy.url === "string"
              ? legacy.url
              : `https://news.ycombinator.com/item?id=${id}`,
          title:
            typeof legacy.title === "string" ? legacy.title : `Comment #${id}`,
          text: typeof legacy.text === "string" ? legacy.text : "",
          author: typeof legacy.author === "string" ? legacy.author : "",
          source: location.hostname === "hackerweb.app" ? "hackerweb" : "hn",
          savedAt:
            typeof legacy.timestamp === "number" &&
            Number.isFinite(legacy.timestamp)
              ? legacy.timestamp
              : Date.now(),
        },
      ];
    });
  } catch (error) {
    console.warn(LOG_PREFIX, "Failed to migrate legacy bookmarks:", error);
    return [];
  }
}

function loadItems(): SavedItem[] {
  if (cache) return cache;
  observeStorageChanges();

  const stored = decodeEnvelope(readStoredValue());
  const byKey = new Map((stored?.items ?? []).map((item) => [item.key, item]));
  let migrated = false;

  for (const legacy of readLegacyItems()) {
    if (byKey.has(legacy.key)) continue;
    byKey.set(legacy.key, legacy);
    migrated = true;
  }

  const items = [...byKey.values()];
  cache = items;
  if (migrated) writeItems(items);
  return items;
}

export function makeSavedKey(_kind: SavedItemKind, id: string): string {
  return `hn:${id}`;
}

export function hasSavedItem(key: string): boolean {
  return loadItems().some((item) => item.key === key);
}

export function saveItem(item: SavedItem): boolean {
  if (!isSavedItem(item)) return false;

  const items = loadItems();
  const existing = items.find((candidate) => candidate.key === item.key);
  const next = existing
    ? items.map((candidate) =>
        candidate.key === item.key
          ? { ...item, savedAt: existing.savedAt }
          : candidate
      )
    : [...items, item];
  return writeItems(next);
}

export function removeSavedItem(key: string): boolean {
  const items = loadItems();
  if (!items.some((item) => item.key === key)) return true;
  return writeItems(items.filter((item) => item.key !== key));
}

export function getSavedItems(sort: SavedSort = "newest"): SavedItem[] {
  const items = [...loadItems()];
  const byTitle = (a: SavedItem, b: SavedItem) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

  if (sort === "oldest") return items.sort((a, b) => a.savedAt - b.savedAt);
  if (sort === "title") return items.sort(byTitle);
  if (sort === "type") {
    return items.sort((a, b) => a.kind.localeCompare(b.kind) || byTitle(a, b));
  }
  return items.sort((a, b) => b.savedAt - a.savedAt);
}

export function exportSavedItems(): string {
  const envelope: SavedEnvelope = { version: 1, items: getSavedItems() };
  return JSON.stringify(envelope, null, 2);
}

export function importSavedItems(
  json: string,
  mode: "merge" | "replace" = "merge"
): boolean {
  const imported = decodeEnvelope(json);
  if (!imported) return false;

  if (mode === "replace") return writeItems(imported.items);

  const byKey = new Map(loadItems().map((item) => [item.key, item]));
  for (const item of imported.items) byKey.set(item.key, item);
  return writeItems([...byKey.values()]);
}

export function resetSavedStoreForTests(): void {
  cache = null;
}
