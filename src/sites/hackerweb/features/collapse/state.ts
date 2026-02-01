const STORAGE_KEY = "hwc-collapsed";
const LOG_PREFIX = "[HackerWeb Tools]";

/** Branded type for validated comment IDs (numeric strings only). */
export type CommentId = string & { readonly __brand: "CommentId" };

/** Validate and brand a string as a CommentId. */
export function asCommentId(id: string | null | undefined): CommentId | null {
  return id && /^\d+$/.test(id) ? (id as CommentId) : null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

let cache: Set<CommentId> | null = null;

function loadState(): Set<CommentId> {
  if (cache) return cache;
  cache = new Set<CommentId>();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cache;

    const parsed: unknown = JSON.parse(stored);
    if (isStringArray(parsed)) {
      for (const id of parsed) {
        const validId = asCommentId(id);
        if (validId) cache.add(validId);
      }
    } else {
      console.warn(
        LOG_PREFIX,
        "localStorage data has unexpected format, starting fresh"
      );
    }
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      "Failed to load collapse state:",
      formatError(error)
    );
  }
  return cache;
}

function saveState(state: Set<CommentId>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      "Failed to save collapse state:",
      formatError(error)
    );
  }
}

export function getCollapsedState(commentId: CommentId): boolean {
  return loadState().has(commentId);
}

export function setCollapsedState(
  commentId: CommentId,
  collapsed: boolean
): void {
  const state = loadState();
  if (collapsed) state.add(commentId);
  else state.delete(commentId);
  saveState(state);
}

export function clearCollapsedState(): void {
  cache = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn(
      LOG_PREFIX,
      "Failed to clear collapse state:",
      formatError(error)
    );
  }
}

/** Reset cache without clearing localStorage (for testing). */
export function resetCache(): void {
  cache = null;
}
