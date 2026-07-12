import type { StoredConfig } from "./types";
import { CONFIG_VERSION } from "./defaults";

const LOG_PREFIX = "[HWT Migrate]";

/**
 * Legacy storage key from the original collapse feature
 */
const LEGACY_COLLAPSE_KEY = "hwc-collapsed";

/**
 * New state key for collapse feature
 */
const NEW_COLLAPSE_KEY = "hwt:state:collapse";

/**
 * Migrate legacy "hwc-collapsed" data to new state format.
 * Called once during initialization if legacy data exists.
 */
export function migrateLegacyCollapseState(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_COLLAPSE_KEY);
    if (!legacy) return;

    // Check if already migrated
    const existing = localStorage.getItem(NEW_COLLAPSE_KEY);
    if (existing) {
      // Clean up legacy data since we already have new data
      localStorage.removeItem(LEGACY_COLLAPSE_KEY);
      console.debug(LOG_PREFIX, "Cleaned up legacy collapse data");
      return;
    }

    // Parse and validate legacy data
    const parsed: unknown = JSON.parse(legacy);
    if (!Array.isArray(parsed)) {
      console.warn(LOG_PREFIX, "Legacy collapse data has invalid format");
      localStorage.removeItem(LEGACY_COLLAPSE_KEY);
      return;
    }

    // Filter to valid comment IDs (numeric strings only)
    const validIds = parsed.filter(
      (id): id is string => typeof id === "string" && /^\d+$/.test(id)
    );

    // Save in new format
    localStorage.setItem(NEW_COLLAPSE_KEY, JSON.stringify(validIds));

    // Remove legacy data
    localStorage.removeItem(LEGACY_COLLAPSE_KEY);

    console.debug(
      LOG_PREFIX,
      `Migrated ${validIds.length} collapsed comments to new format`
    );
  } catch (error) {
    console.warn(LOG_PREFIX, "Failed to migrate legacy collapse data:", error);
    // Don't delete legacy data on error - it might be recoverable
  }
}

/**
 * Migrate config from an older version to the current version.
 */
export function migrateConfig(stored: StoredConfig): StoredConfig {
  let { version } = stored;
  const { config } = stored;

  // Apply migrations in sequence
  while (version < CONFIG_VERSION) {
    console.debug(LOG_PREFIX, `Migrating config from v${version}`);

    switch (version) {
      case 0:
        // Initial migration from unversioned to v1
        // No changes needed, just bump version
        break;

      case 1: {
        // v1 → v2: Convert display string values to numbers
        const display = config.display as Record<string, unknown> | undefined;
        if (display) {
          if (typeof display["maxContentWidth"] === "string") {
            display["maxContentWidth"] =
              parseInt(display["maxContentWidth"], 10) || 900;
          }
          if (typeof display["commentLineHeight"] === "string") {
            display["commentLineHeight"] =
              parseFloat(display["commentLineHeight"]) || 1.6;
          }
        }
        break;
      }

      case 2: {
        // v2 → v3: Scores on HN are non-negative. A stored negative value was
        // an explicit override (defaults are sparse), so preserve its effective
        // "do not dim low scores" behavior at the new minimum of zero.
        const thresholds = config.thresholds as
          | Record<string, unknown>
          | undefined;
        if (
          thresholds &&
          typeof thresholds["lowScoreThreshold"] === "number" &&
          thresholds["lowScoreThreshold"] < 0
        ) {
          thresholds["lowScoreThreshold"] = 0;
        }
        break;
      }

      default:
        // Unknown version, reset to defaults
        console.warn(
          LOG_PREFIX,
          `Unknown config version ${version}, resetting to defaults`
        );
        return { version: CONFIG_VERSION, config: {} };
    }

    version++;
  }

  return { version, config };
}

/**
 * Run all necessary migrations during initialization.
 */
export function runMigrations(): void {
  migrateLegacyCollapseState();
}

// Example future migration function:
// function migrateV1toV2(config: DeepPartial<UserConfig>): DeepPartial<UserConfig> {
//   // Transform config structure as needed
//   return config;
// }
