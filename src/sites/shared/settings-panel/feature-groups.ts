import type { Features, Thresholds, Display } from "../../../config/types";

/**
 * Feature groupings for the settings panel UI
 */
export interface FeatureGroup {
  label: string;
  features: (keyof Features)[];
}

export const FEATURE_GROUPS: Record<string, FeatureGroup> = {
  core: {
    label: "Core",
    features: ["collapse", "keyboardNav", "opBadge", "deepLink"],
  },
  reading: {
    label: "Reading",
    features: ["newCommentHighlight", "readingProgress", "commentBookmarks"],
  },
  visual: {
    label: "Visual",
    features: ["darkModeSync", "comfortMode", "collapseByDepth"],
  },
  hnSpecific: {
    label: "HN Features",
    features: [
      "hideReadStories",
      "scoreThreshold",
      "timeGrouping",
      "inlinePreview",
      "hwebLinks",
    ],
  },
};

/**
 * Labels and descriptions for each feature
 */
export const FEATURE_LABELS: Record<
  keyof Features,
  { label: string; description: string }
> = {
  collapse: {
    label: "Collapse threads",
    description: "Click to collapse/expand comment threads",
  },
  keyboardNav: {
    label: "Keyboard nav",
    description: "j/k to navigate, o to open links",
  },
  opBadge: {
    label: "OP badge",
    description: "Highlight comments by the original poster",
  },
  deepLink: {
    label: "Deep linking",
    description: "URL updates when viewing comments",
  },
  newCommentHighlight: {
    label: "New comment highlight",
    description: "Highlight unread comments since last visit",
  },
  readingProgress: {
    label: "Reading progress",
    description: "Show progress bar while scrolling",
  },
  commentBookmarks: {
    label: "Comment bookmarks",
    description: "Save comments for later reading",
  },
  darkModeSync: {
    label: "Dark mode sync",
    description: "Match system dark/light preference",
  },
  comfortMode: {
    label: "Comfort mode",
    description: "Centered layout with larger fonts",
  },
  collapseByDepth: {
    label: "Auto-collapse by depth",
    description: "Collapse deeply nested comments",
  },
  hideReadStories: {
    label: "Hide read stories",
    description: "Hide stories you've already viewed",
  },
  scoreThreshold: {
    label: "Score threshold",
    description: "Dim low-scoring comments",
  },
  timeGrouping: {
    label: "Time grouping",
    description: "Group stories by time period",
  },
  inlinePreview: {
    label: "Inline preview",
    description: "Preview links without leaving the page",
  },
  hwebLinks: {
    label: "HackerWeb links",
    description: "Add links to view on HackerWeb",
  },
};

/**
 * Labels for threshold settings
 */
export const THRESHOLD_LABELS: Record<
  keyof Thresholds,
  { label: string; min: number; max: number; step?: number }
> = {
  autoCollapseDepth: {
    label: "Auto-collapse depth",
    min: 1,
    max: 20,
  },
  gutterClickPx: {
    label: "Gutter click width (px)",
    min: 5,
    max: 50,
  },
  highScoreThreshold: {
    label: "High score threshold",
    min: 10,
    max: 500,
    step: 10,
  },
  lowScoreThreshold: {
    label: "Low score threshold",
    min: -100,
    max: 0,
  },
  minScore: {
    label: "Minimum score",
    min: -100,
    max: 100,
  },
  minComments: {
    label: "Minimum comments",
    min: 0,
    max: 100,
  },
};

/**
 * Labels for display settings
 */
export const DISPLAY_LABELS: Record<
  keyof Display,
  { label: string; type: "text" | "color" }
> = {
  maxContentWidth: {
    label: "Max content width",
    type: "text",
  },
  commentLineHeight: {
    label: "Comment line height",
    type: "text",
  },
  newCommentColor: {
    label: "New comment color",
    type: "color",
  },
};
