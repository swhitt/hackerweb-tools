import { qsa, qs } from "../../../../utils/dom-helpers";

const SEL = {
  storyRow: "tr.athing",
  subtextRow: "tr.athing + tr",
  age: ".age",
  itemList: "#hnmain table:first-of-type > tbody",
} as const;

const GROUP_CLASS = "hwt-time-group";

type TimeGroup = "now" | "hour" | "today" | "yesterday" | "week" | "older";

interface GroupConfig {
  label: string;
  maxMinutes: number;
}

const GROUPS: Record<TimeGroup, GroupConfig> = {
  now: { label: "Just now", maxMinutes: 30 },
  hour: { label: "Past hour", maxMinutes: 60 },
  today: { label: "Today", maxMinutes: 24 * 60 },
  yesterday: { label: "Yesterday", maxMinutes: 48 * 60 },
  week: { label: "This week", maxMinutes: 7 * 24 * 60 },
  older: { label: "Older", maxMinutes: Infinity },
};

const GROUP_ORDER: TimeGroup[] = [
  "now",
  "hour",
  "today",
  "yesterday",
  "week",
  "older",
];

/**
 * Parse age string like "2 hours ago" to minutes
 */
function parseAge(ageText: string): number | null {
  const text = ageText.toLowerCase().trim();

  // Match patterns like "2 hours ago", "1 day ago"
  const match = /^(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago$/.exec(
    text
  );
  if (!match?.[1] || !match[2]) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    minute: 1,
    hour: 60,
    day: 24 * 60,
    week: 7 * 24 * 60,
    month: 30 * 24 * 60,
    year: 365 * 24 * 60,
  };

  const multiplier = multipliers[unit];
  return multiplier ? value * multiplier : null;
}

/**
 * Determine which group a story belongs to based on age
 */
function getTimeGroup(ageMinutes: number): TimeGroup {
  for (const group of GROUP_ORDER) {
    if (ageMinutes <= GROUPS[group].maxMinutes) {
      return group;
    }
  }
  return "older";
}

/**
 * Create a group header element
 */
function createGroupHeader(group: TimeGroup): HTMLTableRowElement {
  const tr = document.createElement("tr");
  tr.className = GROUP_CLASS;
  tr.setAttribute("data-group", group);

  const td = document.createElement("td");
  td.colSpan = 3;
  td.textContent = GROUPS[group].label;

  tr.appendChild(td);
  return tr;
}

/**
 * Add time group headers to the story list
 */
export function addTimeGrouping(): void {
  const tbody = qs(SEL.itemList);
  if (!tbody) return;

  // Check if already processed
  if (qs(`.${GROUP_CLASS}`, tbody)) return;

  // Collect stories with their ages
  const stories: { row: HTMLTableRowElement; ageMinutes: number }[] = [];

  for (const row of qsa<HTMLTableRowElement>(SEL.storyRow)) {
    const subtextRow = row.nextElementSibling;
    if (!subtextRow) continue;

    const ageEl = qs(SEL.age, subtextRow);
    if (!ageEl) continue;

    const ageText = ageEl.getAttribute("title") ?? ageEl.textContent;
    if (!ageText) continue;
    const ageMinutes = parseAge(ageText);

    if (ageMinutes !== null) {
      stories.push({ row, ageMinutes });
    }
  }

  // Group stories and insert headers
  let currentGroup: TimeGroup | null = null;

  for (const { row, ageMinutes } of stories) {
    const group = getTimeGroup(ageMinutes);

    if (group !== currentGroup) {
      const header = createGroupHeader(group);
      row.parentNode?.insertBefore(header, row);
      currentGroup = group;
    }
  }
}
