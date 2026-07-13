import { describe, expect, it } from "vitest";
import { CONFIG_VERSION } from "./defaults";
import { decodeConfig, decodeStoredConfig } from "./validation";

describe("config validation", () => {
  describe("decodeConfig", () => {
    it("accepts sparse config and clamps documented numeric ranges", () => {
      const result = decodeConfig({
        thresholds: {
          autoCollapseDepth: 999,
          lowScoreThreshold: -20,
        },
        display: {
          maxContentWidth: 100,
          fontSize: 40,
          commentLineHeight: 1.75,
        },
        sites: { hn: { features: { keyboardNav: true } } },
      });

      expect(result).toEqual({
        ok: true,
        value: {
          thresholds: {
            autoCollapseDepth: 20,
            lowScoreThreshold: 0,
          },
          display: {
            maxContentWidth: 400,
            fontSize: 24,
            commentLineHeight: 1.75,
          },
          sites: { hn: { features: { keyboardNav: true } } },
        },
      });
    });

    it.each([
      {
        label: "unknown top-level keys",
        value: { mystery: {} },
        error: "config.mystery is not supported",
      },
      {
        label: "unknown nested keys",
        value: { features: { collapse: true, mystery: false } },
        error: "config.features.mystery is not supported",
      },
      {
        label: "wrong nested types",
        value: { sites: { hn: { enabled: "yes" } } },
        error: "config.sites.hn.enabled must be a boolean",
      },
      {
        label: "non-finite numbers",
        value: { display: { fontSize: Number.NaN } },
        error: "config.display.fontSize must be a finite number",
      },
      {
        label: "invalid colors",
        value: { display: { newCommentColor: "tomato" } },
        error: "config.display.newCommentColor must be a six-digit hex color",
      },
      {
        label: "invalid themes",
        value: { display: { themeMode: "midnight" } },
        error: "config.display.themeMode must be dark, light, or system",
      },
    ])("rejects $label", ({ value, error }) => {
      expect(decodeConfig(value)).toEqual({ ok: false, error });
    });
  });

  describe("decodeStoredConfig", () => {
    it("accepts a supported envelope for migration and later decoding", () => {
      expect(
        decodeStoredConfig({
          version: CONFIG_VERSION,
          config: { features: { collapse: false } },
        })
      ).toEqual({
        ok: true,
        value: {
          version: CONFIG_VERSION,
          config: { features: { collapse: false } },
        },
      });
    });

    it.each([
      {
        label: "future versions",
        value: { version: CONFIG_VERSION + 1, config: {} },
        error: `stored config version ${CONFIG_VERSION + 1} is newer than supported version ${CONFIG_VERSION}`,
      },
      {
        label: "non-integer versions",
        value: { version: 1.5, config: {} },
        error: "stored config.version must be a non-negative integer",
      },
      {
        label: "non-object config",
        value: { version: CONFIG_VERSION, config: [] },
        error: "stored config.config must be an object",
      },
      {
        label: "unknown envelope keys",
        value: { version: CONFIG_VERSION, config: {}, extra: true },
        error: "stored config.extra is not supported",
      },
    ])("rejects $label", ({ value, error }) => {
      expect(decodeStoredConfig(value)).toEqual({ ok: false, error });
    });
  });
});
