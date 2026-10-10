import { Heart, PartyPopper, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import ProfileCard, { InstagramLink } from "../components/ProfileCard";
import { ApiError, apiRequest } from "../lib/api";
import { CLEANLINESS_LABELS, SLEEP_LABELS, TAGS, type Profile } from "../types/profile";

type SwipeAction = "like" | "pass";

// Each filter is a URL setting, e.g. { smoking: "false" } becomes ?smoking=false.
// An empty value means "any", so it's left out of the URL.
type Filters = {
  sleepSchedule: string;
  cleanliness: string;
  smoking: string;
  pets: string;
  maxBudget: string;
  tag: string;
};

const NO_FILTERS: Filters = { sleepSchedule: "", cleanliness: "", smoking: "", pets: "", maxBudget: "", tag: "" };

function toQueryString(filters: Filters, cursor?: string) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  if (cursor) {
    params.set("cursor", cursor);
  }
  const query = params.toString();
  return query === "" ? "" : "?" + query;
}

type DiscoverResponse = { profiles: Profile[]; nextCursor: string | null };

// Everything loaded so far for one set of filters. `key` says which filters it belongs to.
type Feed = { key: string; profiles: Profile[]; nextCursor: string | null; error: ApiError | null };

const LOAD_MORE_WHEN_LEFT = 3; // start fetching the next batch when this few profiles are left

function asApiError(caught: unknown) {
  return caught instanceof ApiError ? caught : new ApiError(0, "Something went wrong.");
}

function DiscoverPage() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [version, setVersion] = useState(0); // bump to refresh
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Changing a filter (or refreshing) starts a fresh feed from the first page
  const feedKey = toQueryString(filters) + "#" + version;
  useEffect(() => {
    let cancelled = false;
    apiRequest<DiscoverResponse>("/discover" + toQueryString(filters)).then(
      (data) => {
        if (!cancelled) setFeed({ key: feedKey, profiles: data.profiles, nextCursor: data.nextCursor, error: null });
      },
      (caught) => {
        if (!cancelled) setFeed({ key: feedKey, profiles: [], nextCursor: null, error: asApiError(caught) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [feedKey, filters]);

  const loading = feed?.key !== feedKey;
  const error = loading ? null : feed.error;
  const reload = () => setVersion((v) => v + 1);

  // "Load more": fetch the next page using the bookmark and add it to the end
  async function loadMore() {
    if (!feed || feed.key !== feedKey || !feed.nextCursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    try {
      const data = await apiRequest<DiscoverResponse>("/discover" + toQueryString(filters, feed.nextCursor));
      setFeed((current) =>
        current && current.key === feedKey
          ? { ...current, profiles: [...current.profiles, ...data.profiles], nextCursor: data.nextCursor }
          : current,
      );
    } catch (caught) {
      setSwipeError(caught);
    } finally {
      setLoadingMore(false);
    }
  }

  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [animation, setAnimation] = useState<SwipeAction | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [swipeError, setSwipeError] = useState<unknown>(null);

  // The deck is whatever the API sent, minus anyone swiped on since it loaded
  const deck = loading ? [] : feed.profiles.filter((profile) => !swipedIds.includes(profile.id));
  const hasMore = !loading && feed.nextCursor !== null;
  const currentProfile = deck[0];
  const activeFilterCount = Object.values(filters).filter((value) => value !== "").length;

  function updateFilter(key: keyof Filters, value: string) {
    setFilters({ ...filters, [key]: value });
  }

  async function handleDecision(action: SwipeAction) {
    if (!currentProfile || animation !== null) {
      return;
    }
    setSwipeError(null);
    setAnimation(action);
    try {
      const result = await apiRequest<{ matched: boolean; match?: Profile }>("/swipes", {
        method: "POST",
        body: { targetId: currentProfile.id, direction: action },
      });
      if (result.matched) {
        // The match version of their profile includes their Instagram
        setNewMatch(result.match ?? currentProfile);
      }
      setLastDecision(action === "like" ? `You liked ${currentProfile.name}.` : `You passed on ${currentProfile.name}.`);
      setSwipedIds([...swipedIds, currentProfile.id]);
      if (deck.length - 1 <= LOAD_MORE_WHEN_LEFT) {
        loadMore();
      }
    } catch (caught) {
      setSwipeError(caught);
    } finally {
      setAnimation(null);
    }
  }

  let content;
  if (loading) {
    content = <p className="status-message">Finding students at your school...</p>;
  } else if (error?.status === 404 || error?.status === 409) {
    content = (
      <section className="empty-state">
        <h2>{error.status === 404 ? "Create your profile first" : "Finish your profile first"}</h2>
        <p>Discover shows students at your school, so we need to know where you go.</p>
        <Link className="primary-button" to="/profile">Set up profile</Link>
      </section>
    );
  } else if (error) {
    content = (
      <section className="empty-state">
        <FormErrors error={error} />
        <button className="secondary-button" type="button" onClick={reload}>Try again</button>
      </section>
    );
  } else if (currentProfile) {
    content = (
      <>
        <ProfileCard profile={currentProfile} animation={animation} />
        <FormErrors error={swipeError} />
        <div className="swipe-controls">
          <button
            className="swipe-button swipe-button--pass"
            type="button"
            aria-label={`Pass on ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("pass")}
          >
            <X size={35} strokeWidth={2.7} />
          </button>
          <button
            className="swipe-button swipe-button--like"
            type="button"
            aria-label={`Like ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("like")}
          >
            <Heart size={34} strokeWidth={2.6} />
          </button>
        </div>
      </>
    );
  } else if (hasMore) {
    content = (
      <section className="empty-state">
        <p>{loadingMore ? "Finding more students..." : "Looking for more students..."}</p>
        <button className="secondary-button" type="button" disabled={loadingMore} onClick={loadMore}>
          Load more
        </button>
      </section>
    );
  } else {
    content = (
      <section className="empty-state">
        <div className="empty-state__icon">
          <Heart size={40} />
        </div>
        <h2>{activeFilterCount > 0 ? "No one matches these filters." : "You're all caught up."}</h2>
        <p>
          {activeFilterCount > 0
            ? "Try loosening a filter or two."
            : "You've seen everyone at your school for now. Check back as more students join."}
        </p>
        {activeFilterCount > 0 ? (
          <button className="secondary-button" type="button" onClick={() => setFilters(NO_FILTERS)}>
            Clear filters
          </button>
        ) : (
          <button className="secondary-button" type="button" onClick={reload}>
            <RotateCcw size={19} />
            Refresh
          </button>
        )}
      </section>
    );
  }

  return (
    <main className="page page--with-navigation">
      <header className="page-header">
        <div>
          <p className="eyebrow">Roomie Match</p>
          <h1>Discover</h1>
        </div>
        <button
          className="icon-button filter-button"
          type="button"
          aria-label="Filters"
          aria-expanded={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={22} />
          {activeFilterCount > 0 && <span className="filter-button__count">{activeFilterCount}</span>}
        </button>
      </header>

      {showFilters && (
        <section className="filter-panel" aria-label="Filters">
          <label className="field">
            <span>Sleep schedule</span>
            <select value={filters.sleepSchedule} onChange={(e) => updateFilter("sleepSchedule", e.target.value)}>
              <option value="">Any</option>
              {Object.entries(SLEEP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Cleanliness</span>
            <select value={filters.cleanliness} onChange={(e) => updateFilter("cleanliness", e.target.value)}>
              <option value="">Any</option>
              {Object.entries(CLEANLINESS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Smoking</span>
            <select value={filters.smoking} onChange={(e) => updateFilter("smoking", e.target.value)}>
              <option value="">Any</option>
              <option value="false">Non-smokers</option>
              <option value="true">Smokers</option>
            </select>
          </label>
          <label className="field">
            <span>Pets</span>
            <select value={filters.pets} onChange={(e) => updateFilter("pets", e.target.value)}>
              <option value="">Any</option>
              <option value="false">No pets</option>
              <option value="true">Has pets</option>
            </select>
          </label>
          <label className="field">
            <span>Max budget ($/mo)</span>
            <input type="number" min={0} placeholder="Any" value={filters.maxBudget} onChange={(e) => updateFilter("maxBudget", e.target.value)} />
          </label>
          <label className="field">
            <span>Tag</span>
            <select value={filters.tag} onChange={(e) => updateFilter("tag", e.target.value)}>
              <option value="">Any</option>
              {TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </label>
          {activeFilterCount > 0 && (
            <button className="small-button" type="button" onClick={() => setFilters(NO_FILTERS)}>
              Clear all
            </button>
          )}
        </section>
      )}

      {newMatch && (
        <section className="match-banner" role="status">
          {newMatch.photoUrl ? (
            <img className="match-banner__photo" src={newMatch.photoUrl} alt="" />
          ) : (
            <PartyPopper size={26} />
          )}
          <div>
            <strong>It's a match with {newMatch.name}!</strong>
            {newMatch.instagram && (
              <p>Say hi: <InstagramLink handle={newMatch.instagram} /></p>
            )}
            <p><Link to={`/matches/${encodeURIComponent(newMatch.id)}`}>View {newMatch.name}'s profile</Link></p>
          </div>
          <button className="match-banner__close" type="button" aria-label="Dismiss" onClick={() => setNewMatch(null)}>
            <X size={18} />
          </button>
        </section>
      )}

      {lastDecision && !newMatch && (
        <p className="decision-message" role="status">{lastDecision}</p>
      )}

      {content}
    </main>
  );
}

export default DiscoverPage;
