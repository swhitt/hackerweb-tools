const STORAGE_KEY = "hwc-collapsed";

/** Branded type for validated comment IDs */
export type CommentId = string & { readonly __brand: "CommentId" };

/** Validate and brand a string as a CommentId (must be numeric) */
export function asCommentId(id: string | null | undefined): CommentId | null {
  if (!id || !/^\d+$/.test(id)) return null;
  return id as CommentId;
}

/** Runtime validation for localStorage data */
function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

// In-memory cache to avoid repeated localStorage reads
let cache: Set<CommentId> | null = null;

function loadState() {
  if (cache) return cache;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isStringArray(parsed)) {
        // Filter to only valid CommentIds
        cache = new Set(parsed.filter((id) => /^\d+$/.test(id)) as CommentId[]);
      } else {
        cache = new Set();
      }
    } else {
      cache = new Set();
    }
  } catch {
    cache = new Set();
  }

  return cache;
}

function saveState(state: Set<CommentId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
  } catch {
    // localStorage might be full or disabled
  }
}

export function getCollapsedState(commentId: CommentId) {
  return loadState().has(commentId);
}

export function setCollapsedState(commentId: CommentId, collapsed: boolean) {
  const state = loadState();

  if (collapsed) {
    state.add(commentId);
  } else {
    state.delete(commentId);
  }

  saveState(state);
}

export function clearCollapsedState() {
  cache = null;
  localStorage.removeItem(STORAGE_KEY);
}

/** Reset cache without clearing localStorage (for testing) */
export function resetCache() {
  cache = null;
}

// Data attribute helpers for button state
export function setDataBool(el: HTMLElement, key: string, value: boolean) {
  el.dataset[key] = value ? "true" : "false";
}

export function getDataBool(el: HTMLElement | null, key: string) {
  return el?.dataset[key] === "true";
}
