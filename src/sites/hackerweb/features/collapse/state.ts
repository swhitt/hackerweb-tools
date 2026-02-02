import { SetState } from "../../../../config";

/** Branded type for validated comment IDs (numeric strings only). */
export type CommentId = string & { readonly __brand: "CommentId" };

/** Validate and brand a string as a CommentId. */
export function asCommentId(id: string | null | undefined): CommentId | null {
  return id && /^\d+$/.test(id) ? (id as CommentId) : null;
}

// State storage using the centralized config system
const collapseState = new SetState<CommentId>("collapse");

export function getCollapsedState(commentId: CommentId): boolean {
  return collapseState.has(commentId);
}

export function setCollapsedState(
  commentId: CommentId,
  collapsed: boolean
): void {
  if (collapsed) {
    collapseState.add(commentId);
  } else {
    collapseState.delete(commentId);
  }
}

export function clearCollapsedState(): void {
  collapseState.clear();
}

/** Reset cache without clearing localStorage (for testing). */
export function resetCache(): void {
  collapseState.resetCache();
}
