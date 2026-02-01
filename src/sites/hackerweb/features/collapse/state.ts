const STORAGE_KEY = "hwc-collapsed";
const LOG_PREFIX = "[HackerWeb Tools]";

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

// In-memory cache to avoid repeated localStorage reads. Cleared via clearCollapsedState() or resetCache().
let cache: Set<CommentId> | null = null;

function loadState(): Set<CommentId> {
  if (cache) return cache;

  cache = new Set<CommentId>();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (isStringArray(parsed)) {
        // Use asCommentId for centralized validation
        for (const id of parsed) {
          const validId = asCommentId(id);
          if (validId) cache.add(validId);
        }
      } else {
        console.warn(
          LOG_PREFIX,
          "localStorage data has unexpected format, starting fresh. Expected string array, got:",
          typeof parsed
        );
      }
    }
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      "Failed to load collapse state from localStorage:",
      error instanceof Error ? error.message : String(error)
    );
  }
  return cache;
}

function saveState(state: Set<CommentId>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
  } catch (error) {
    // localStorage might be full or disabled; state won't persist but in-memory cache remains valid
    console.warn(
      LOG_PREFIX,
      "Failed to save collapse state to localStorage:",
      error instanceof Error ? error.message : String(error)
    );
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
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      "Failed to clear collapse state from localStorage:",
      error instanceof Error ? error.message : String(error)
    );
  }
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
