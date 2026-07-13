import { CONFIG_VERSION } from "./defaults";
import type {
  DeepPartial,
  Display,
  Features,
  SiteConfig,
  Sites,
  StoredConfig,
  Thresholds,
  UserConfig,
} from "./types";

export interface NumericRange {
  min: number;
  max: number;
  step?: number;
}

export const THRESHOLD_RANGES = {
  minScore: { min: -100, max: 100 },
  minComments: { min: 0, max: 100 },
  gutterClickPx: { min: 5, max: 50 },
  autoCollapseDepth: { min: 1, max: 20 },
  highScoreThreshold: { min: 10, max: 500, step: 10 },
  lowScoreThreshold: { min: 0, max: 100, step: 5 },
} as const satisfies Record<keyof Thresholds, NumericRange>;

export const DISPLAY_RANGES = {
  maxContentWidth: { min: 400, max: 2000, step: 50 },
  fontSize: { min: 10, max: 24 },
  commentLineHeight: { min: 1, max: 3, step: 0.1 },
} as const satisfies Record<
  Exclude<keyof Display, "newCommentColor" | "themeMode">,
  NumericRange
>;

export type DecodeResult<T> =
  { ok: true; value: T } | { ok: false; error: string };

type Decoder<T> = (value: unknown, path: string) => DecodeResult<T>;

const success = <T>(value: T): DecodeResult<T> => ({ ok: true, value });
const failure = (error: string): DecodeResult<never> => ({ ok: false, error });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const booleanDecoder: Decoder<boolean> = (value, path) =>
  typeof value === "boolean"
    ? success(value)
    : failure(`${path} must be a boolean`);

function numberDecoder(range: NumericRange): Decoder<number> {
  return (value, path) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return failure(`${path} must be a finite number`);
    }
    return success(Math.min(range.max, Math.max(range.min, value)));
  };
}

const colorDecoder: Decoder<string> = (value, path) =>
  typeof value === "string" && /^#[\da-f]{6}$/i.test(value)
    ? success(value)
    : failure(`${path} must be a six-digit hex color`);

const themeModeDecoder: Decoder<Display["themeMode"]> = (value, path) =>
  value === "dark" || value === "light" || value === "system"
    ? success(value)
    : failure(`${path} must be dark, light, or system`);

function decodePartialObject<T extends object>(
  value: unknown,
  path: string,
  decoders: { [K in keyof T]: Decoder<T[K]> }
): DecodeResult<DeepPartial<T>> {
  if (!isRecord(value)) return failure(`${path} must be an object`);

  const allowedKeys = new Set(Object.keys(decoders));
  const entries: [string, unknown][] = [];

  for (const [key, candidate] of Object.entries(value)) {
    if (!allowedKeys.has(key))
      return failure(`${path}.${key} is not supported`);

    const decoder = decoders[key as keyof T];
    const decoded = decoder(candidate, `${path}.${key}`);
    if (!decoded.ok) return decoded;
    entries.push([key, decoded.value]);
  }

  // Every entry was checked by the decoder mapped to that exact key.
  return success(Object.fromEntries(entries) as DeepPartial<T>);
}

const featureDecoders = {
  collapse: booleanDecoder,
  hwebLinks: booleanDecoder,
  keyboardNav: booleanDecoder,
  newCommentHighlight: booleanDecoder,
  opBadge: booleanDecoder,
  deepLink: booleanDecoder,
  collapseByDepth: booleanDecoder,
  hideReadStories: booleanDecoder,
  scoreThreshold: booleanDecoder,
  timeGrouping: booleanDecoder,
  inlinePreview: booleanDecoder,
  darkModeSync: booleanDecoder,
  readingProgress: booleanDecoder,
  commentBookmarks: booleanDecoder,
  comfortMode: booleanDecoder,
} satisfies { [K in keyof Features]: Decoder<Features[K]> };

const thresholdDecoders = {
  minScore: numberDecoder(THRESHOLD_RANGES.minScore),
  minComments: numberDecoder(THRESHOLD_RANGES.minComments),
  gutterClickPx: numberDecoder(THRESHOLD_RANGES.gutterClickPx),
  autoCollapseDepth: numberDecoder(THRESHOLD_RANGES.autoCollapseDepth),
  highScoreThreshold: numberDecoder(THRESHOLD_RANGES.highScoreThreshold),
  lowScoreThreshold: numberDecoder(THRESHOLD_RANGES.lowScoreThreshold),
} satisfies { [K in keyof Thresholds]: Decoder<Thresholds[K]> };

const displayDecoders = {
  themeMode: themeModeDecoder,
  maxContentWidth: numberDecoder(DISPLAY_RANGES.maxContentWidth),
  fontSize: numberDecoder(DISPLAY_RANGES.fontSize),
  commentLineHeight: numberDecoder(DISPLAY_RANGES.commentLineHeight),
  newCommentColor: colorDecoder,
} satisfies { [K in keyof Display]: Decoder<Display[K]> };

const partialFeaturesDecoder: Decoder<Partial<Features>> = (value, path) =>
  decodePartialObject(value, path, featureDecoders);

const siteConfigDecoders = {
  enabled: booleanDecoder,
  features: partialFeaturesDecoder,
} satisfies { [K in keyof SiteConfig]: Decoder<SiteConfig[K]> };

const siteConfigDecoder: Decoder<DeepPartial<SiteConfig>> = (value, path) =>
  decodePartialObject(value, path, siteConfigDecoders);

const sitesDecoders = {
  hackerweb: siteConfigDecoder,
  hn: siteConfigDecoder,
} satisfies { [K in keyof Sites]: Decoder<DeepPartial<Sites[K]>> };

const configDecoders = {
  features: (value, path) => decodePartialObject(value, path, featureDecoders),
  thresholds: (value, path) =>
    decodePartialObject(value, path, thresholdDecoders),
  display: (value, path) => decodePartialObject(value, path, displayDecoders),
  sites: (value, path) => decodePartialObject(value, path, sitesDecoders),
} satisfies { [K in keyof UserConfig]: Decoder<DeepPartial<UserConfig[K]>> };

/** Decode sparse config overrides, rejecting unknown keys and invalid values. */
export function decodeConfig(
  value: unknown
): DecodeResult<DeepPartial<UserConfig>> {
  return decodePartialObject(value, "config", configDecoders);
}

/**
 * Decode the stored envelope before migration. Older versions may contain
 * legacy value shapes, so their nested config is decoded after migration.
 */
export function decodeStoredConfig(value: unknown): DecodeResult<StoredConfig> {
  if (!isRecord(value)) return failure("stored config must be an object");

  for (const key of Object.keys(value)) {
    if (key !== "version" && key !== "config") {
      return failure(`stored config.${key} is not supported`);
    }
  }

  const version = value["version"];
  if (
    !Number.isInteger(version) ||
    typeof version !== "number" ||
    version < 0
  ) {
    return failure("stored config.version must be a non-negative integer");
  }
  if (version > CONFIG_VERSION) {
    return failure(
      `stored config version ${version} is newer than supported version ${CONFIG_VERSION}`
    );
  }
  if (!isRecord(value["config"])) {
    return failure("stored config.config must be an object");
  }

  // Legacy nested values are intentionally accepted here and normalized by
  // migrations before decodeConfig performs strict current-schema validation.
  return success(value as unknown as StoredConfig);
}
