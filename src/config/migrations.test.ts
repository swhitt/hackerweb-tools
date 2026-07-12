import { describe, expect, it } from "vitest";
import { migrateConfig } from "./migrations";
import type { StoredConfig } from "./types";

describe("config migrations", () => {
  it("preserves the effect of an explicit negative story-score threshold", () => {
    const stored: StoredConfig = {
      version: 2,
      config: { thresholds: { lowScoreThreshold: -5 } },
    };

    const migrated = migrateConfig(stored);

    expect(migrated.version).toBe(4);
    expect(migrated.config.thresholds?.lowScoreThreshold).toBe(0);
  });

  it("preserves an existing non-negative low-score threshold", () => {
    const stored: StoredConfig = {
      version: 2,
      config: { thresholds: { lowScoreThreshold: 20 } },
    };

    const migrated = migrateConfig(stored);

    expect(migrated.config.thresholds?.lowScoreThreshold).toBe(20);
  });

  it("runs older migrations in sequence", () => {
    const stored = {
      version: 1,
      config: {
        display: { maxContentWidth: "1200", commentLineHeight: "1.8" },
        thresholds: { lowScoreThreshold: -1 },
      },
    } as unknown as StoredConfig;

    const migrated = migrateConfig(stored);

    expect(migrated.version).toBe(4);
    expect(migrated.config.display?.maxContentWidth).toBe(1200);
    expect(migrated.config.display?.commentLineHeight).toBe(1.8);
    expect(migrated.config.thresholds?.lowScoreThreshold).toBe(0);
  });

  it("remembers an explicit dark-mode override as a theme", () => {
    const dark: StoredConfig = {
      version: 3,
      config: { features: { darkModeSync: true } },
    };
    const light: StoredConfig = {
      version: 3,
      config: { features: { darkModeSync: false } },
    };

    expect(migrateConfig(dark).config.display?.themeMode).toBe("system");
    expect(migrateConfig(light).config.display?.themeMode).toBe("light");
    expect(migrateConfig(dark).config.features?.darkModeSync).toBeUndefined();
  });
});
