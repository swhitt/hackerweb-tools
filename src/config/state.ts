/**
 * Feature state storage - separate from user preferences.
 * Stores runtime state like collapsed comments, visited stories, etc.
 */

const STATE_PREFIX = "hwt:state:";
const LOG_PREFIX = "[HWT State]";

export type StateKey =
  | "collapse"
  | "visited"
  | "bookmarks"
  | "lastVisit"
  | "newComments";

/**
 * Generic typed state storage with optional validation
 */
export class FeatureState<T> {
  private key: string;
  private cache: T | null = null;
  private defaultValue: T;
  private validator: ((value: unknown) => value is T) | undefined;

  constructor(
    feature: StateKey,
    defaultValue: T,
    validator?: (value: unknown) => value is T
  ) {
    this.key = STATE_PREFIX + feature;
    this.defaultValue = defaultValue;
    this.validator = validator;
  }

  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Load state from localStorage
   */
  load(): T {
    if (this.cache !== null) return this.cache;

    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) {
        this.cache = this.defaultValue;
        return this.cache;
      }

      const parsed: unknown = JSON.parse(raw);

      if (this.validator) {
        if (this.validator(parsed)) {
          this.cache = parsed;
        } else {
          console.warn(
            LOG_PREFIX,
            `Invalid state for ${this.key}, using default`
          );
          this.cache = this.defaultValue;
        }
      } else {
        // Without a validator, we trust that the stored value matches T.
        // This is safe for primitives but risky for objects - consider adding
        // a validator for complex types to ensure runtime type safety.
        this.cache = parsed as T;
      }

      return this.cache;
    } catch (error) {
      console.warn(
        LOG_PREFIX,
        `Failed to load state for ${this.key}:`,
        this.formatError(error)
      );
      this.cache = this.defaultValue;
      return this.cache;
    }
  }

  /**
   * Save state to localStorage
   */
  save(value: T): void {
    this.cache = value;

    try {
      localStorage.setItem(this.key, JSON.stringify(value));
    } catch (error) {
      console.warn(
        LOG_PREFIX,
        `Failed to save state for ${this.key}:`,
        this.formatError(error)
      );
    }
  }

  /**
   * Update state using a function
   */
  update(updater: (current: T) => T): void {
    const current = this.load();
    const updated = updater(current);
    this.save(updated);
  }

  /**
   * Clear state
   */
  clear(): void {
    this.cache = null;
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.warn(
        LOG_PREFIX,
        `Failed to clear state for ${this.key}:`,
        this.formatError(error)
      );
    }
  }

  /**
   * Reset cache without clearing localStorage (for testing)
   */
  resetCache(): void {
    this.cache = null;
  }
}

/**
 * State storage for Set-based data (collapsed IDs, bookmarks, etc.)
 */
export class SetState<T extends string = string> {
  private state: FeatureState<T[]>;
  private setCache: Set<T> | null = null;

  constructor(feature: StateKey) {
    this.state = new FeatureState<T[]>(
      feature,
      [],
      (v): v is T[] => Array.isArray(v) && v.every((i) => typeof i === "string")
    );
  }

  private getSet(): Set<T> {
    if (this.setCache) return this.setCache;
    this.setCache = new Set(this.state.load());
    return this.setCache;
  }

  has(item: T): boolean {
    return this.getSet().has(item);
  }

  add(item: T): void {
    const set = this.getSet();
    if (set.has(item)) return;
    set.add(item);
    this.state.save([...set]);
  }

  delete(item: T): void {
    const set = this.getSet();
    if (!set.has(item)) return;
    set.delete(item);
    this.state.save([...set]);
  }

  toggle(item: T): boolean {
    const set = this.getSet();
    if (set.has(item)) {
      set.delete(item);
      this.state.save([...set]);
      return false;
    } else {
      set.add(item);
      this.state.save([...set]);
      return true;
    }
  }

  getAll(): T[] {
    return [...this.getSet()];
  }

  clear(): void {
    this.setCache = null;
    this.state.clear();
  }

  resetCache(): void {
    this.setCache = null;
    this.state.resetCache();
  }
}

/**
 * State storage for Map-based data (timestamps, visit counts, etc.)
 */
export class MapState<K extends string, V> {
  private state: FeatureState<Record<K, V>>;
  private mapCache: Map<K, V> | null = null;

  constructor(
    feature: StateKey,
    valueValidator?: (value: unknown) => value is V
  ) {
    this.state = new FeatureState<Record<K, V>>(
      feature,
      {} as Record<K, V>,
      (v): v is Record<K, V> => {
        if (typeof v !== "object" || v === null || Array.isArray(v))
          return false;
        if (!valueValidator) return true;
        return Object.values(v).every((val) => valueValidator(val));
      }
    );
  }

  private getMap(): Map<K, V> {
    if (this.mapCache) return this.mapCache;
    const obj = this.state.load();
    this.mapCache = new Map(Object.entries(obj) as [K, V][]);
    return this.mapCache;
  }

  get(key: K): V | undefined {
    return this.getMap().get(key);
  }

  set(key: K, value: V): void {
    const map = this.getMap();
    map.set(key, value);
    this.state.save(Object.fromEntries(map) as Record<K, V>);
  }

  delete(key: K): void {
    const map = this.getMap();
    if (!map.has(key)) return;
    map.delete(key);
    this.state.save(Object.fromEntries(map) as Record<K, V>);
  }

  has(key: K): boolean {
    return this.getMap().has(key);
  }

  entries(): [K, V][] {
    return [...this.getMap().entries()];
  }

  clear(): void {
    this.mapCache = null;
    this.state.clear();
  }

  resetCache(): void {
    this.mapCache = null;
    this.state.resetCache();
  }
}
