export const CSS = `
/* Score Threshold - highlight high/low score stories */

/* High score - only highlight the score number */
tr.athing[data-score-tier="high"] + tr .subtext .score {
  color: #ff6600;
  font-weight: bold;
}

/* Low score / negative stories - subtle dim */
tr.athing[data-score-tier="low"] {
  opacity: 0.55;
}
`;
