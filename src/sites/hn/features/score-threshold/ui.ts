import { qsa, qs } from "../../../../utils/dom-helpers";
import { getThreshold } from "../../../../config";

const SEL = {
  /** Story row */
  storyRow: "tr.athing",
  /** Subtext row (contains score) */
  subtextRow: "tr.athing + tr",
  /** Score element */
  score: ".score",
} as const;

const SCORE_ATTR = "data-score-tier";

/**
 * Parse score from a score element like "123 points"
 */
function parseScore(scoreEl: Element | null): number | null {
  if (!scoreEl) return null;
  const text = scoreEl.textContent;
  if (!text) return null;
  const match = /^(\d+)\s+points?$/.exec(text);
  if (!match?.[1]) return null;
  return parseInt(match[1], 10);
}

/**
 * Determine the score tier for a story
 */
function getScoreTier(score: number): "high" | "low" | "normal" {
  const highThreshold = getThreshold("highScoreThreshold");
  const lowThreshold = getThreshold("lowScoreThreshold");

  if (score >= highThreshold) return "high";
  if (score <= lowThreshold) return "low";
  return "normal";
}

/**
 * Apply score tier attributes to story rows
 */
export function applyScoreThresholds(): void {
  // Process each story row
  for (const storyRow of qsa<HTMLTableRowElement>(SEL.storyRow)) {
    // Skip if already processed
    if (storyRow.hasAttribute(SCORE_ATTR)) continue;

    // Find the subtext row (next sibling)
    const subtextRow = storyRow.nextElementSibling;
    if (!subtextRow) continue;

    // Get the score
    const scoreEl = qs(SEL.score, subtextRow);
    const score = parseScore(scoreEl);

    if (score === null) {
      // Jobs and other items without scores
      storyRow.setAttribute(SCORE_ATTR, "normal");
      continue;
    }

    const tier = getScoreTier(score);
    storyRow.setAttribute(SCORE_ATTR, tier);
  }
}
