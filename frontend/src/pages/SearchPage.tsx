import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import PersonRow from "../components/PersonRow";
import { apiRequest } from "../lib/api";
import type { Profile } from "../types/profile";

type Person = Profile & { swiped: boolean };
type Results = { query: string; people: Person[]; error: unknown };

// Look people up by name at your school.
function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const trimmed = query.trim();

  // Search once you pause typing (debouncing), and ignore answers to old searches
  useEffect(() => {
    if (trimmed.length < 2) {
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await apiRequest<{ people: Person[] }>("/people?q=" + encodeURIComponent(trimmed));
        if (!cancelled) setResults({ query: trimmed, people: data.people, error: null });
      } catch (caught) {
        if (!cancelled) setResults({ query: trimmed, people: [], error: caught });
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [trimmed]);

  const current = results?.query === trimmed ? results : null;

  let content;
  if (trimmed.length < 2) {
    content = <p className="status-message">Search for someone by name.</p>;
  } else if (current === null) {
    content = <p className="status-message">Searching...</p>;
  } else if (current.error) {
    content = <FormErrors error={current.error} />;
  } else if (current.people.length === 0) {
    content = <p className="status-message">No one at your school matches "{trimmed}".</p>;
  } else {
    content = (
      <section className="match-list">
        {current.people.map((person) => (
          <PersonRow
            key={person.id}
            profile={person}
            to={`/people/${encodeURIComponent(person.id)}`}
            aside={person.swiped ? <span className="badge">Swiped</span> : undefined}
          />
        ))}
      </section>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header page-header--with-back">
        <Link className="icon-button" to="/discover" aria-label="Back to Discover">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p className="eyebrow">Find someone</p>
          <h1>Search</h1>
        </div>
      </header>

      <label className="search-box">
        <Search size={19} />
        <input
          autoFocus
          type="search"
          placeholder="Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search people"
        />
      </label>

      {content}
    </main>
  );
}

export default SearchPage;
