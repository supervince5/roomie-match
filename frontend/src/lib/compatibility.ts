import type { Profile } from "../types/profile";
export type Fit = { label: string; detail: string; aligned: boolean };
export function compareProfiles(me: Profile, other: Profile): Fit[] {
  const low = Math.max(me.budget.min, other.budget.min),
    high = Math.min(me.budget.max, other.budget.max);
  const sameMonth = me.moveInDate.slice(0, 7) === other.moveInDate.slice(0, 7);
  return [
    {
      label: low <= high ? "Your budgets overlap" : "Different budget ranges",
      detail:
        low <= high
          ? `$${low.toLocaleString()}–$${high.toLocaleString()}/month in common`
          : "Talk through a comfortable monthly rent.",
      aligned: low <= high,
    },
    {
      label: sameMonth ? "Same move-in month" : "Compare your move-in dates",
      detail: sameMonth
        ? "Your planned timing lines up."
        : "A little flexibility may help.",
      aligned: sameMonth,
    },
    {
      label:
        me.sleepSchedule === other.sleepSchedule
          ? "Similar sleep schedules"
          : "Different daily rhythms",
      detail:
        me.sleepSchedule === other.sleepSchedule
          ? "You described the same sleep routine."
          : "Talk about alarms and quiet hours.",
      aligned: me.sleepSchedule === other.sleepSchedule,
    },
    {
      label:
        me.cleanliness === other.cleanliness
          ? "Similar cleaning habits"
          : "Talk about shared chores",
      detail:
        me.cleanliness === other.cleanliness
          ? "You selected the same cleanliness preference."
          : "Agree on what a clean home means to you.",
      aligned: me.cleanliness === other.cleanliness,
    },
  ];
}
