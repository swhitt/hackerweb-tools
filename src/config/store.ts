import type {
  UserConfig,
  StoredConfig,
  DeepPartial,
  ConfigListener,
  ConfigSection,
  ConfigKey,
} from "./types";
import { DEFAULT_CONFIG, CONFIG_VERSION } from "./defaults";
import { migrateConfig } from "./migrations";

export const STORAGE_KEY = "hwt:config";
const LOG_PREFIX = "[HWT Config]";

interface NestedListener {
  section: ConfigSection;
  key: string;
  callback: ConfigListener;
}

/**
 * Deep merge two objects, with source taking precedence.
 * Only merges plain objects, not arrays.
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as object,
        sourceValue as DeepPartial<object>
      );
    } else if (sourceValue !== undefined) {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Deep clone an object
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * ConfigStore manages user configuration with persistence and subscriptions.
 */
class ConfigStore {
  private config: UserConfig;
  private overrides: DeepPartial<UserConfig>;
  private listeners = new Map<string, Set<ConfigListener>>();
  private nestedListeners = new Set<NestedListener>();

  constructor() {
    const stored = this.load();
    this.overrides = stored?.config ?? {};
    this.config = deepMerge(deepClone(DEFAULT_CONFIG), this.overrides);
  }

  private load(): StoredConfig | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as StoredConfig;

      // Run migrations if needed
      if (parsed.version < CONFIG_VERSION) {
        const migrated = migrateConfig(parsed);
        this.save(migrated.config);
        return migrated;
      }

      return parsed;
    } catch (error) {
      console.warn(LOG_PREFIX, "Failed to load config:", error);
      return null;
    }
  }

  private save(overrides: DeepPartial<UserConfig>): void {
    try {
      const stored: StoredConfig = {
        version: CONFIG_VERSION,
        config: overrides,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (error) {
      console.warn(LOG_PREFIX, "Failed to save config:", error);
    }
  }

  /**
   * Get the full resolved config (defaults merged with user overrides)
   */
  getAll(): UserConfig {
    return deepClone(this.config);
  }

  /**
   * Get a specific config section
   */
  getSection<S extends ConfigSection>(section: S): UserConfig[S] {
    return deepClone(this.config[section]);
  }

  /**
   * Get a specific config value
   */
  get<S extends ConfigSection, K extends ConfigKey<S>>(
    section: S,
    key: K
  ): UserConfig[S][K] {
    return this.config[section][key];
  }

  /**
   * Set a specific config value
   */
  set<S extends ConfigSection, K extends ConfigKey<S>>(
    section: S,
    key: K,
    value: UserConfig[S][K]
  ): void {
    const oldValue = this.config[section][key];
    if (oldValue === value) return;

    // Update override
    if (!this.overrides[section]) {
      (this.overrides as Record<S, object>)[section] = {};
    }
    (this.overrides[section] as Record<K, unknown>)[key] = value;

    // Update resolved config
    (this.config[section] as Record<K, unknown>)[key] = value;

    // Persist
    this.save(this.overrides);

    // Notify listeners
    this.notifyListeners(section, key, value, oldValue);
  }

  /**
   * Reset a specific config value to default
   */
  reset<S extends ConfigSection>(section: S, key: ConfigKey<S>): void {
    const oldValue = this.config[section][key];
    const defaultValue = DEFAULT_CONFIG[section][key];

    if (oldValue === defaultValue) return;

    // Remove override
    if (this.overrides[section]) {
      const sectionOverrides = this.overrides[section] as Record<
        string,
        unknown
      >;
      Reflect.deleteProperty(sectionOverrides, key as string);

      // Clean up empty section
      if (Object.keys(sectionOverrides).length === 0) {
        Reflect.deleteProperty(this.overrides, section);
      }
    }

    // Reset to default - use type assertion to handle the dynamic key access
    const sectionConfig = this.config[section] as Record<
      ConfigKey<S>,
      UserConfig[S][ConfigKey<S>]
    >;
    sectionConfig[key] = defaultValue;

    // Persist
    this.save(this.overrides);

    // Notify listeners
    this.notifyListeners(section, key, defaultValue, oldValue);
  }

  /**
   * Reset all config to defaults and notify all listeners
   */
  resetAll(): void {
    const oldConfig = this.config;
    this.overrides = {};
    this.config = deepClone(DEFAULT_CONFIG);
    this.save({});

    // Notify all listeners about the reset
    this.notifyResetListeners(oldConfig);
  }

  /**
   * Notify all listeners after a full reset
   */
  private notifyResetListeners(oldConfig: UserConfig): void {
    // Notify nested listeners for each changed value
    for (const listener of this.nestedListeners) {
      const section = listener.section;
      const key = listener.key;
      // Use indexed access to get values from the config objects
      const oldSection = oldConfig[section] as unknown as Record<
        string,
        unknown
      >;
      const newSection = this.config[section] as unknown as Record<
        string,
        unknown
      >;
      const oldValue = oldSection[key];
      const newValue = newSection[key];

      if (oldValue !== newValue) {
        listener.callback(newValue, oldValue);
      }
    }

    // Notify section listeners
    for (const [section, sectionListeners] of this.listeners) {
      const sectionValue = this.getSection(section as ConfigSection);
      for (const callback of sectionListeners) {
        callback(sectionValue, sectionValue);
      }
    }
  }

  /**
   * Subscribe to changes for a specific config path
   */
  subscribe<S extends ConfigSection, K extends ConfigKey<S>>(
    section: S,
    key: K,
    callback: ConfigListener<UserConfig[S][K]>
  ): () => void {
    const listener: NestedListener = {
      section,
      key: key as string,
      callback: callback as ConfigListener,
    };
    this.nestedListeners.add(listener);

    return () => {
      this.nestedListeners.delete(listener);
    };
  }

  /**
   * Subscribe to all changes in a section
   */
  subscribeSection<S extends ConfigSection>(
    section: S,
    callback: ConfigListener<UserConfig[S]>
  ): () => void {
    const key = section;
    const listeners = this.listeners.get(key) ?? new Set();
    listeners.add(callback as ConfigListener);
    this.listeners.set(key, listeners);

    return () => {
      listeners.delete(callback as ConfigListener);
    };
  }

  private notifyListeners<S extends ConfigSection, K extends ConfigKey<S>>(
    section: S,
    key: K,
    newValue: UserConfig[S][K],
    oldValue: UserConfig[S][K]
  ): void {
    // Notify nested listeners
    for (const listener of this.nestedListeners) {
      if (listener.section === section && listener.key === key) {
        try {
          listener.callback(newValue, oldValue);
        } catch (error) {
          console.error(LOG_PREFIX, "Error in config listener:", error);
        }
      }
    }

    // Notify section listeners
    const sectionListeners = this.listeners.get(section);
    if (sectionListeners) {
      const sectionValue = this.getSection(section);
      for (const callback of sectionListeners) {
        try {
          callback(sectionValue, sectionValue);
        } catch (error) {
          console.error(LOG_PREFIX, "Error in section listener:", error);
        }
      }
    }
  }

  /**
   * Export config as JSON string (for backup/sharing)
   */
  export(): string {
    return JSON.stringify(this.overrides, null, 2);
  }

  /**
   * Validate imported config has expected structure
   */
  private isValidConfig(obj: unknown): obj is DeepPartial<UserConfig> {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return false;
    }
    // Check that all top-level keys are valid config sections
    const validSections = new Set(Object.keys(DEFAULT_CONFIG));
    for (const key of Object.keys(obj)) {
      if (!validSections.has(key)) return false;
      const section = (obj as Record<string, unknown>)[key];
      if (typeof section !== "object" || section === null) return false;
    }
    return true;
  }

  /**
   * Import config from JSON string
   */
  import(json: string): boolean {
    try {
      const parsed: unknown = JSON.parse(json);
      if (!this.isValidConfig(parsed)) {
        console.error(LOG_PREFIX, "Invalid config structure");
        return false;
      }

      const oldConfig = this.config;
      this.overrides = parsed;
      this.config = deepMerge(deepClone(DEFAULT_CONFIG), this.overrides);
      this.save(this.overrides);

      // Notify listeners about the import
      this.notifyResetListeners(oldConfig);
      return true;
    } catch (error) {
      console.error(LOG_PREFIX, "Failed to import config:", error);
      return false;
    }
  }
}

// Singleton instance
let instance: ConfigStore | null = null;

/**
 * Get the singleton ConfigStore instance
 */
export function getConfigStore(): ConfigStore {
  instance ??= new ConfigStore();
  return instance;
}

/**
 * Reset the singleton for testing
 */
export function resetConfigStore(): void {
  instance = null;
}
