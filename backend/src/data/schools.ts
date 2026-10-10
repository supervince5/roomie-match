// Every active, degree-granting U.S. college (2-year and 4-year), from the U.S. Department
// of Education's IPEDS directory (HD2024). `id` is the official IPEDS UNITID.
import schoolList from "./schools.json" with { type: "json" };

export type School = { id: number; name: string; city: string; state: string; aliases?: string[] };

const schools = schoolList as School[];
const schoolsById = new Map(schools.map(school => [school.id, school]));

export function getSchool(id: number) {
    return schoolsById.get(id);
}

// Search by name or nickname ("virginia tech", "uva", "mit").
// Exact name/nickname matches come first, then ones that start with the text, then the rest.
export function searchSchools(query: string, limit: number) {
    const q = query.trim().toLowerCase();
    if (q === "") {
        return [];
    }
    const exact: School[] = [];
    const startsWith: School[] = [];
    const contains: School[] = [];
    for (const school of schools) {
        const names = [school.name, ...(school.aliases ?? [])].map(name => name.toLowerCase());
        if (names.some(name => name === q)) {
            exact.push(school);
        } else if (names.some(name => name.startsWith(q))) {
            startsWith.push(school);
        } else if (names.some(name => name.includes(q))) {
            contains.push(school);
        }
    }
    return [...exact, ...startsWith, ...contains].slice(0, limit);
}
