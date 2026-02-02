import type { UserConfig } from "./types";

/**
 * Default configuration values.
 *
 * Features marked as `true` are stable and non-intrusive.
 * Features marked as `false` are experimental or change behavior significantly.
 */
export const DEFAULT_CONFIG: UserConfig = {
  features: {
    // ON by default (stable, non-intrusive)
    collapse: true,
    hwebLinks: true,
    opBadge: true,
    deepLink: true,

    // OFF by default (experimental or changes behavior significantly)
    keyboardNav: false,
    newCommentHighlight: false,
    hideReadStories: false,
    darkModeSync: false,
    readingProgress: false,
    commentBookmarks: false,
    scoreThreshold: false,
    collapseByDepth: false,
    timeGrouping: false,
    inlinePreview: false,
  },

  thresholds: {
    minScore: 0,
    minComments: 0,
    gutterClickPx: 15,
    autoCollapseDepth: 5,
    highScoreThreshold: 100,
    lowScoreThreshold: -5,
  },

  display: {
    maxContentWidth: "900px",
    commentLineHeight: "1.5",
    newCommentColor: "#ffffcc",
  },

  sites: {
    hackerweb: {
      enabled: true,
      features: {},
    },
    hn: {
      enabled: true,
      features: {},
    },
  },
};

/**
 * Current config storage version.
 * Increment when making breaking changes to config structure.
 */
export const CONFIG_VERSION = 1;
