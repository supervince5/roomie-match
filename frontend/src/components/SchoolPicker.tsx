import { useEffect, useId, useRef, useState } from "react";
import { apiRequest } from "../lib/api";

export type SchoolOption = { id: number; name: string; city?: string; state?: string };
type SchoolPickerProps = {
  value: SchoolOption | null;
  sampleSchools?: SchoolOption[];
  onChange: (school: SchoolOption | null) => void;
};
type Results = { query: string; schools: SchoolOption[]; failed: boolean };

function SchoolPicker({ value, onChange, sampleSchools }: SchoolPickerProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const changeButton = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const trimmed = query.trim();
  const current = results?.query === trimmed ? results : null;
  const schools = current?.schools ?? [];
  const searching = trimmed.length >= 2 && current === null;
  const showOptions = expanded && trimmed.length >= 2 && value === null;

  useEffect(() => {
    if (trimmed.length < 2 || value !== null) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = sampleSchools
          ? {schools: sampleSchools.filter(school => [school.name, ...("aliases" in school ? school.aliases as string[] : [])].some(name => name.toLowerCase().includes(trimmed.toLowerCase())))}
          : await apiRequest<{ schools: SchoolOption[] }>("/schools?q=" + encodeURIComponent(trimmed));
        if (!cancelled) setResults({ query: trimmed, schools: data.schools, failed: false });
      } catch {
        if (!cancelled) setResults({ query: trimmed, schools: [], failed: true });
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [trimmed, retry, value, sampleSchools]);

  useEffect(() => {
    if (active >= 0 && showOptions)
      document.getElementById(`${id}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, showOptions, id]);

  function choose(school: SchoolOption) {
    onChange(school);
    setQuery("");
    setExpanded(false);
    setActive(-1);
    requestAnimationFrame(() => changeButton.current?.focus());
  }

  if (value !== null) return (
    <div className="school-picker__selected">
      <span>{value.name}</span>
      <button ref={changeButton} className="small-button" type="button" aria-label={`Change school, currently ${value.name}`} onClick={() => {
        onChange(null);
        setExpanded(true);
        requestAnimationFrame(() => input.current?.focus());
      }}>Change</button>
    </div>
  );

  return (
    <div className="school-picker" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
    }}>
      <input
        ref={input}
        role="combobox"
        aria-label="Search for your school"
        aria-autocomplete="list"
        aria-expanded={showOptions}
        aria-controls={showOptions ? `${id}-list` : undefined}
        aria-activedescendant={showOptions && active >= 0 && schools[active] ? `${id}-option-${active}` : undefined}
        aria-describedby={`${id}-status`}
        autoComplete="off"
        placeholder="Start typing, e.g. Virginia Tech"
        value={query}
        onFocus={() => setExpanded(true)}
        onChange={e => { setQuery(e.target.value); setActive(-1); setExpanded(true); }}
        onKeyDown={e => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setExpanded(true);
            if (schools.length) setActive(index => e.key === "ArrowDown"
              ? (index + 1) % schools.length
              : (index <= 0 ? schools.length - 1 : index - 1));
          } else if (e.key === "Enter" && showOptions && active >= 0 && schools[active]) {
            e.preventDefault(); choose(schools[active]);
          } else if (e.key === "Escape" && showOptions) {
            e.preventDefault(); e.stopPropagation(); setExpanded(false); setActive(-1);
          }
        }}
      />
      <span id={`${id}-status`} className="school-picker__status" role="status">
        {trimmed.length < 2 ? "Type at least two letters." : searching ? "Searching schools…"
          : current?.failed ? "Couldn't load schools. Try again."
          : schools.length === 0 ? "No schools found. Try another name."
          : `${schools.length} ${schools.length === 1 ? "school" : "schools"} found. Use arrow keys to choose.`}
      </span>
      {showOptions && current?.failed && <button className="small-button" type="button" onClick={() => {
        setResults(null); setRetry(n => n + 1); input.current?.focus();
      }}>Retry school search</button>}
      {showOptions && (
        <ul id={`${id}-list`} className="school-picker__results" role="listbox" aria-label="Schools" aria-busy={searching}>
          {schools.map((school, index) => (
            <li key={school.id} id={`${id}-option-${index}`} role="option" aria-selected={active === index}
              onMouseDown={e => e.preventDefault()} onClick={() => choose(school)}>
              <strong>{school.name}</strong>
              <span>{[school.city, school.state].filter(Boolean).join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export default SchoolPicker;
