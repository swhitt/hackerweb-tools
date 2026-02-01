const STORAGE_KEY = "hwc-collapsed";

// In-memory cache to avoid repeated localStorage reads
let cache: Set<string> | null = null;

function loadState(): Set<string> {
  if (cache) return cache;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    cache = stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    cache = new Set();
  }

  return cache;
}

function saveState(state: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
  } catch {
    // localStorage might be full or disabled
  }
}

export function getCollapsedState(commentId: string): boolean {
  return loadState().has(commentId);
}

export function setCollapsedState(commentId: string, collapsed: boolean): void {
  const state = loadState();

  if (collapsed) {
    state.add(commentId);
  } else {
    state.delete(commentId);
  }

  saveState(state);
}

export function clearCollapsedState(): void {
  cache = new Set();
  localStorage.removeItem(STORAGE_KEY);
}

// Data attribute helpers for button state
export function setDataBool(
  el: HTMLElement,
  key: string,
  value: boolean
): void {
  el.dataset[key] = value ? "true" : "false";
}

export function getDataBool(el: HTMLElement | null, key: string): boolean {
  return el?.dataset?.[key] === "true";
}
