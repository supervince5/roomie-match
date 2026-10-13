export type DiscoverFeedbackKind = "like" | "pass" | "match";
const notes: Record<DiscoverFeedbackKind, readonly string[]> = {
  pass: [
    "not quite in tune.",
    "a different kind of harmony.",
    "the search goes on.",
    "almost, but not our rhythm.",
  ],
  like: [
    "a little spark?",
    "could be your kind of person.",
    "same wavelength?",
    "a promising hello.",
  ],
  match: [
    "the perfect one?",
    "oh, this feels in tune.",
    "the feeling is mutual.",
    "a roomie-shaped coincidence.",
  ],
};
export function pickDiscoverNote(
  kind: DiscoverFeedbackKind,
  previous = "",
  random = Math.random,
) {
  const choices = notes[kind].filter((note) => note !== previous);
  return choices[
    Math.min(
      choices.length - 1,
      Math.max(0, Math.floor(random() * choices.length)),
    )
  ];
}
