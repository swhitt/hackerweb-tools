/**
 * Feature flags - controls which features are enabled
 */
export interface Features {
  // HackerWeb features
  collapse: boolean;
  hwebLinks: boolean;
  keyboardNav: boolean;
  newCommentHighlight: boolean;
  opBadge: boolean;
  deepLink: boolean;
  collapseByDepth: boolean;

  // HN features
  hideReadStories: boolean;
  scoreThreshold: boolean;
  timeGrouping: boolean;
  inlinePreview: boolean;

  // Shared features (both sites)
  darkModeSync: boolean;
  readingProgress: boolean;
  commentBookmarks: boolean;
}

/**
 * Threshold configuration values
 */
export interface Thresholds {
  minScore: number;
  minComments: number;
  gutterClickPx: number;
  autoCollapseDepth: number;
  highScoreThreshold: number;
  lowScoreThreshold: number;
}

/**
 * Display/styling configuration
 */
export interface Display {
  maxContentWidth: string;
  commentLineHeight: string;
  newCommentColor: string;
}

/**
 * Per-site configuration overrides
 */
export interface SiteConfig {
  enabled: boolean;
  features: Partial<Features>;
}

/**
 * Site-specific configurations
 */
export interface Sites {
  hackerweb: SiteConfig;
  hn: SiteConfig;
}

/**
 * Complete user configuration
 */
export interface UserConfig {
  features: Features;
  thresholds: Thresholds;
  display: Display;
  sites: Sites;
}

/**
 * Stored config format (includes version for migrations)
 */
export interface StoredConfig {
  version: number;
  config: DeepPartial<UserConfig>;
}

/**
 * Deep partial type for sparse config overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Config change listener callback
 */
export type ConfigListener<T = unknown> = (newValue: T, oldValue: T) => void;

/**
 * Path segments for accessing nested config values
 */
export type ConfigSection = keyof UserConfig;
export type ConfigKey<S extends ConfigSection> = keyof UserConfig[S];
