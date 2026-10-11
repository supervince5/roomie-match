import { apiRequest } from "./api";
import { invalidateApiCache } from "./useApi";
import type { Profile } from "../types/profile";

export type SwipeDirection = "like" | "pass";
export type SwipeResult = { matched: boolean; match?: Profile };

// Swipe on someone from anywhere in the app (search, history, their profile page).
export async function swipeOn(targetId: string, direction: SwipeDirection) {
  const result = await apiRequest<SwipeResult>("/swipes", { method: "POST", body: { targetId, direction } });
  forgetStaleLists(result.matched);
  return result;
}

// Undo a swipe: they go back into your Discover. If it had made a match, that's removed too.
export async function undoSwipe(targetId: string) {
  const result = await apiRequest<{ unmatched: boolean }>("/swipes/" + encodeURIComponent(targetId), { method: "DELETE" });
  forgetStaleLists(result.unmatched);
  return result;
}

// Change your mind: undo, then swipe the other way.
export async function switchSwipe(targetId: string, newDirection: SwipeDirection) {
  await undoSwipe(targetId);
  return swipeOn(targetId, newDirection);
}

// Swipes change who's in Discover (and maybe Matches), so drop those remembered lists.
function forgetStaleLists(matchesChanged: boolean) {
  invalidateApiCache("/discover");
  invalidateApiCache("/swipes");
  if (matchesChanged) {
    invalidateApiCache("/matches");
  }
}
