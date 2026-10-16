import type { Profile } from "../types/profile";
export type Fit = { label: string; detail: string; aligned: boolean };
export function compareProfiles(me: Profile, other: Profile): Fit[] {
  const low = Math.max(me.budget?.min ?? 0, other.budget?.min ?? 0),
    high = Math.min(me.budget?.max ?? 0, other.budget?.max ?? 0);
  const sameMonth = me.moveInDate?.slice(0, 7) === other.moveInDate?.slice(0, 7);
  const fits = [
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
  const known = [me.budget && other.budget, me.moveInDate && other.moveInDate, me.sleepSchedule && other.sleepSchedule, me.cleanliness && other.cleanliness];
  const labels = ["compare your budgets", "compare your move-in dates", "compare your daily rhythms", "compare your cleaning habits"];
  return fits.map((fit, index) => known[index] ? fit : { label: labels[index], detail: "one or both of you have not shared this yet.", aligned: false });
}
