import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

export type SchoolOption = { id: number; name: string; city?: string; state?: string };

type SchoolPickerProps = {
  value: SchoolOption | null;
  onChange: (school: SchoolOption | null) => void;
};

// Type part of a school's name or nickname, then pick it from the suggestions.
function SchoolPicker({ value, onChange }: SchoolPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SchoolOption[]>([]);

  // Wait until you stop typing for a moment before searching, so we don't
  // send a request for every single letter (this is called "debouncing").
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiRequest<{ schools: SchoolOption[] }>("/schools?q=" + encodeURIComponent(query));
        if (!cancelled) setResults(data.schools);
      } catch {
        if (!cancelled) setResults([]);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  if (value !== null) {
    return (
      <div className="school-picker__selected">
        <span>{value.name}</span>
        <button className="small-button" type="button" onClick={() => onChange(null)}>
          Change
        </button>
      </div>
    );
  }

  const showResults = query.trim().length >= 2;

  return (
    <div className="school-picker">
      <input
        placeholder="Start typing, e.g. Virginia Tech"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for your school"
      />
      {showResults && (
        <ul className="school-picker__results" role="listbox">
          {results.length === 0 && <li className="school-picker__empty">No schools found yet...</li>}
          {results.map((school) => (
            <li key={school.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => {
                  onChange(school);
                  setQuery("");
                  setResults([]);
                }}
              >
                <strong>{school.name}</strong>
                <span>
                  {school.city}, {school.state}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SchoolPicker;
