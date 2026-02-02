/**
 * HackerWeb Tools Configuration System
 *
 * This module provides a centralized configuration system with:
 * - Type-safe config access
 * - Persistence in localStorage
 * - Subscription to config changes
 * - Migration support for legacy data
 * - Feature state storage separate from preferences
 */

// Types
export type {
  UserConfig,
  Features,
  Thresholds,
  Display,
  Sites,
  SiteConfig,
  StoredConfig,
  DeepPartial,
  ConfigListener,
  ConfigSection,
  ConfigKey,
} from "./types";

// Defaults
export { DEFAULT_CONFIG, CONFIG_VERSION } from "./defaults";

// Store
export { getConfigStore, resetConfigStore, STORAGE_KEY } from "./store";

// State
export { FeatureState, SetState, MapState } from "./state";
export type { StateKey } from "./state";

// Migrations
export { runMigrations, migrateLegacyCollapseState } from "./migrations";

/**
 * Convenience function to check if a feature is enabled.
 * Respects site-specific overrides.
 */
import { getConfigStore } from "./store";
import type { Features } from "./types";

export function isFeatureEnabled(
  feature: keyof Features,
  site?: "hackerweb" | "hn"
): boolean {
  const store = getConfigStore();

  // Check site-specific override first
  if (site) {
    const siteConfig = store.get("sites", site);
    if (!siteConfig.enabled) return false;
    if (feature in siteConfig.features) {
      return siteConfig.features[feature] ?? false;
    }
  }

  // Fall back to global feature flag
  return store.get("features", feature);
}

/**
 * Get a threshold value from config
 */
import type { Thresholds } from "./types";

export function getThreshold(key: keyof Thresholds): number {
  return getConfigStore().get("thresholds", key);
}

/**
 * Get a display value from config
 */
import type { Display } from "./types";

export function getDisplay(key: keyof Display): string {
  return getConfigStore().get("display", key);
}
