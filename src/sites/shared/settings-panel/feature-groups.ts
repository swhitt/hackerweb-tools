import type { Features, Thresholds, Display } from "../../../config/types";
import { DISPLAY_RANGES, THRESHOLD_RANGES } from "../../../config/validation";

/**
 * Feature groupings for the settings panel UI
 */
export interface FeatureGroup {
  label: string;
  description: string;
  scope: string;
  features: (keyof Features)[];
}

export const FEATURE_GROUPS: Record<string, FeatureGroup> = {
  shared: {
    label: "Available here",
    description: "Shared tools configured separately on each site.",
    scope: "This site",
    features: ["keyboardNav", "readingProgress", "commentBookmarks"],
  },
  hackerweb: {
    label: "HackerWeb",
    description: "Thread controls and context for focused discussions.",
    scope: "hackerweb.app",
    features: [
      "collapse",
      "opBadge",
      "deepLink",
      "newCommentHighlight",
      "collapseByDepth",
    ],
  },
  hn: {
    label: "Hacker News",
    description: "Better scanning, filtering, and story discovery.",
    scope: "news.ycombinator.com",
    features: [
      "hideReadStories",
      "scoreThreshold",
      "timeGrouping",
      "inlinePreview",
      "hwebLinks",
      "comfortMode",
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
    description: "Use vim-style shortcuts for stories and comments",
  },
  opBadge: {
    label: "OP badge",
    description: "Highlight comments by the original poster",
  },
  deepLink: {
    label: "Copy comment links",
    description: "Click a timestamp to copy its HN permalink",
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
    label: "Save stories & comments",
    description: "Add save buttons and keep items in the Saved view",
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
    label: "Story score signals",
    description: "Emphasize standout scores and dim quieter stories",
  },
  timeGrouping: {
    label: "Time grouping",
    description: "Group stories by time period",
  },
  inlinePreview: {
    label: "Story favicons",
    description: "Show site favicons beside stories via Google",
  },
  hwebLinks: {
    label: "HackerWeb story links",
    description: "Add a HackerWeb shortcut to each story",
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
    ...THRESHOLD_RANGES.autoCollapseDepth,
  },
  gutterClickPx: {
    label: "Gutter click width (px)",
    ...THRESHOLD_RANGES.gutterClickPx,
  },
  highScoreThreshold: {
    label: "High score threshold",
    ...THRESHOLD_RANGES.highScoreThreshold,
  },
  lowScoreThreshold: {
    label: "Low score threshold",
    ...THRESHOLD_RANGES.lowScoreThreshold,
  },
  minScore: {
    label: "Minimum score",
    ...THRESHOLD_RANGES.minScore,
  },
  minComments: {
    label: "Minimum comments",
    ...THRESHOLD_RANGES.minComments,
  },
};

/**
 * Labels for display settings
 */
export type DisplayLabelInfo =
  | { label: string; type: "text" | "color" }
  | { label: string; type: "number"; min: number; max: number; step?: number };

export const DISPLAY_LABELS = {
  maxContentWidth: {
    label: "Max content width (px)",
    type: "number",
    ...DISPLAY_RANGES.maxContentWidth,
  },
  fontSize: {
    label: "Font size (px)",
    type: "number",
    ...DISPLAY_RANGES.fontSize,
  },
  commentLineHeight: {
    label: "Line height",
    type: "number",
    ...DISPLAY_RANGES.commentLineHeight,
  },
  newCommentColor: {
    label: "New comment color",
    type: "color",
  },
} satisfies Record<Exclude<keyof Display, "themeMode">, DisplayLabelInfo>;
