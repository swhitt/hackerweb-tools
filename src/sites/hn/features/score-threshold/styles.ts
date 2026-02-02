export const CSS = `
/* Score Threshold - highlight high/low score stories */

/* High score stories */
tr.athing[data-score-tier="high"] .titleline a {
  color: #1a73e8;
  font-weight: 600;
}

tr.athing[data-score-tier="high"] + tr .subtext .score {
  color: #1a73e8;
  font-weight: bold;
}

/* Low score / negative stories */
tr.athing[data-score-tier="low"] {
  opacity: 0.6;
}

tr.athing[data-score-tier="low"] .titleline a {
  color: #666;
}

tr.athing[data-score-tier="low"] + tr .subtext .score {
  color: #c00;
}
`;
