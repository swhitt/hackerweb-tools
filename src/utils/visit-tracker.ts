/**
 * Track page visits with timestamps.
 * Used for features like "hide read stories".
 */

import { MapState } from "../config/state";

type ItemId = string;

interface VisitInfo {
  /** Timestamp of first visit */
  firstVisit: number;
  /** Timestamp of most recent visit */
  lastVisit: number;
  /** Number of times visited */
  visitCount: number;
}

const visitState = new MapState<ItemId, VisitInfo>(
  "visited",
  (v): v is VisitInfo =>
    typeof v === "object" &&
    v !== null &&
    typeof (v as VisitInfo).firstVisit === "number" &&
    typeof (v as VisitInfo).lastVisit === "number" &&
    typeof (v as VisitInfo).visitCount === "number"
);

/**
 * Record a visit to an item
 */
export function recordVisit(itemId: string): VisitInfo {
  const now = Date.now();
  const existing = visitState.get(itemId);

  const info: VisitInfo = existing
    ? {
        firstVisit: existing.firstVisit,
        lastVisit: now,
        visitCount: existing.visitCount + 1,
      }
    : {
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
      };

  visitState.set(itemId, info);
  return info;
}

/**
 * Check if an item has been visited
 */
export function hasVisited(itemId: string): boolean {
  return visitState.has(itemId);
}
