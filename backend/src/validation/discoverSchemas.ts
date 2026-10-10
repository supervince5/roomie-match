import { z } from "zod";
import { TAGS } from "./profileSchemas.js";

// URL filters come in as text (?smoking=false&maxBudget=800), so "false" and "800"
// have to be turned into a real boolean and number.
const booleanText = z.enum(["true", "false"]).transform(value => value === "true");

// Every filter is optional. Leave them all off to see everyone at your school.
export const discoverFiltersSchema = z.object({
    sleepSchedule: z.enum(["early_bird", "flexible", "night_owl"]).optional(),
    cleanliness: z.enum(["very_clean", "clean", "relaxed"]).optional(),
    smoking: booleanText.optional(),
    pets: booleanText.optional(),
    maxBudget: z.coerce.number().int().min(0).optional(),  // their budget has to start at or below this
    classYear: z.coerce.number().int().optional(),
    tag: z.enum(TAGS, "Not one of the allowed tags").optional(),
    cursor: z.string().max(2000).optional() // bookmark from the previous page ("load more")
}).strict();

export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>;
