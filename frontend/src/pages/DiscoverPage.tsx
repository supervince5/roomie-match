import CompatibilityPanel from "../components/CompatibilityPanel";
import SwipeSurface from "../components/SwipeSurface";
import InviteButton from "../components/InviteButton";
import {
  Heart,
  History,
  PartyPopper,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import FormErrors from "../components/FormErrors";
import ProfileCard, { InstagramLink } from "../components/ProfileCard";
import SchoolPicker, { type SchoolOption } from "../components/SchoolPicker";
import { ApiError, apiRequest } from "../lib/api";
import {
  invalidateApiCache,
  readApiCache,
  updateApiCache,
  writeApiCache,
} from "../lib/useApi";
import {
  CLEANLINESS_LABELS,
  SLEEP_LABELS,
  TAGS,
  type MatchedProfile,
  type Profile,
} from "../types/profile";

type SwipeAction = "like" | "pass";

// Each filter is a URL setting, e.g. { smoking: "false" } becomes ?smoking=false.
// An empty value means "any", so it's left out of the URL.
type Filters = {
  schoolId: string;
  major: string;
  classYear: string;
  minAge: string;
  maxAge: string;
  moveInBy: string;
  sleepSchedule: string;
  cleanliness: string;
  smoking: string;
  pets: string;
  maxBudget: string;
  tag: string;
};

const NO_FILTERS: Filters = {
  schoolId: "",
  major: "",
  classYear: "",
  minAge: "",
  maxAge: "",
  moveInBy: "",
  sleepSchedule: "",
  cleanliness: "",
  smoking: "",
  pets: "",
  maxBudget: "",
  tag: "",
};

const THIS_YEAR = new Date().getFullYear();
const CLASS_YEARS = Array.from({ length: 8 }, (_, i) => THIS_YEAR + i);
const TYPED_FILTERS: (keyof Filters)[] = [
  "major",
  "minAge",
  "maxAge",
  "maxBudget",
];

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

type DiscoverResponse = {
  school: { id: number; name: string };
  profiles: Profile[];
  nextCursor: string | null;
};

// Everything loaded so far for one set of filters. `key` says which filters it belongs to.
type Feed = {
  key: string;
  school?: { id: number; name: string };
  profiles: Profile[];
  nextCursor: string | null;
  error: ApiError | null;
};

const LOAD_MORE_WHEN_LEFT = 3; // start fetching the next batch when this few profiles are left

function asApiError(caught: unknown) {
  return caught instanceof ApiError
    ? caught
    : new ApiError(0, "Something went wrong.");
}

function DiscoverPage() {
  // `draft` is what the filter boxes show; `filters` is what's actually been searched.
  // Typed filters wait until you pause typing, so we don't search on every keystroke.
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [draft, setDraft] = useState<Filters>(NO_FILTERS);
  const [filterSchool, setFilterSchool] = useState<SchoolOption | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(
    () => window.matchMedia("(min-width: 960px)").matches,
  );
  const [version, setVersion] = useState(0); // bump to refresh
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const activeFeedKey = useRef("");
  const decisionInFlight = useRef(false);

  // Changing a filter (or refreshing) starts a fresh feed from the first page
  const feedKey = toQueryString(filters) + "#" + version;
  const path = "/discover" + toQueryString(filters);
  useEffect(() => {
    let cancelled = false;
    activeFeedKey.current = feedKey;
    apiRequest<DiscoverResponse>(path).then(
      (data) => {
        writeApiCache(path, data);
        if (!cancelled)
          setFeed({
            key: feedKey,
            school: data.school,
            profiles: data.profiles,
            nextCursor: data.nextCursor,
            error: null,
          });
      },
      (caught) => {
        if (!cancelled)
          setFeed({
            key: feedKey,
            profiles: [],
            nextCursor: null,
            error: asApiError(caught),
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [feedKey, path]);

  // Show the remembered deck instantly while the fresh one loads
  const remembered = readApiCache<DiscoverResponse>(path);
  const current: Feed | null =
    feed?.key === feedKey
      ? feed
      : remembered
        ? {
            key: feedKey,
            school: remembered.school,
            profiles: remembered.profiles,
            nextCursor: remembered.nextCursor,
            error: null,
          }
        : null;
  const loading = current === null;
  const error = current?.error ?? null;
  const reload = () => setVersion((v) => v + 1);

  // "Load more": fetch the next page using the bookmark and add it to the end
  async function loadMore() {
    if (!current || !current.nextCursor || loadingMoreRef.current) {
      return;
    }
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const data = await apiRequest<DiscoverResponse>(
        "/discover" + toQueryString(filters, current.nextCursor),
      );
      if (activeFeedKey.current !== feedKey) return;
      setFeed((latest) => {
        const base = latest?.key === feedKey ? latest : current;
        return {
          ...base,
          profiles: [...base.profiles, ...data.profiles],
          nextCursor: data.nextCursor,
        };
      });
    } catch (caught) {
      setSwipeError(caught);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  const [swipedIds, setSwipedIds] = useState<string[]>([]);
  const [animation, setAnimation] = useState<SwipeAction | null>(null);
  const [lastDecision, setLastDecision] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState<Profile | null>(null);
  const [swipeError, setSwipeError] = useState<unknown>(null);

  // The deck is whatever the API sent, minus anyone swiped on since it loaded
  const deck = (current?.profiles ?? []).filter(
    (profile) => !swipedIds.includes(profile.id),
  );
  const hasMore = current !== null && current.nextCursor !== null;
  const currentProfile = deck[0];
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "",
  ).length;

  function updateFilter(key: keyof Filters, value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    window.clearTimeout(typingTimer.current);
    if (TYPED_FILTERS.includes(key)) {
      typingTimer.current = window.setTimeout(() => setFilters(next), 450);
    } else {
      setFilters(next);
    }
  }

  function pickSchool(school: SchoolOption | null) {
    setFilterSchool(school);
    updateFilter("schoolId", school === null ? "" : String(school.id));
  }

  function clearFilters() {
    window.clearTimeout(typingTimer.current);
    setFilterSchool(null);
    setDraft(NO_FILTERS);
    setFilters(NO_FILTERS);
  }

  async function handleDecision(action: SwipeAction) {
    if (!currentProfile || decisionInFlight.current) {
      return;
    }
    decisionInFlight.current = true;
    setSwipeError(null);
    setAnimation(action);
    try {
      const [result] = await Promise.all([
        apiRequest<{ matched: boolean; match?: Profile }>("/swipes", {
          method: "POST",
          body: { targetId: currentProfile.id, direction: action },
        }),
        new Promise<void>((resolve) => window.setTimeout(resolve, 280)),
      ]);
      const swipedId = currentProfile.id;
      invalidateApiCache("/swipes"); // history changed
      // Keep the remembered deck in sync, so they don't reappear next time you open Discover
      updateApiCache<DiscoverResponse>(path, (deckData) => ({
        ...deckData,
        profiles: deckData.profiles.filter((p) => p.id !== swipedId),
      }));
      if (result.matched) {
        // The match version of their profile includes their Instagram
        const matched = result.match ?? currentProfile;
        setNewMatch(matched);
        // Put them at the top of the remembered Matches list right away
        updateApiCache<{ matches: MatchedProfile[] }>("/matches", (list) => ({
          matches: [
            { ...matched, matchedAt: new Date().toISOString() },
            ...list.matches,
          ],
        }));
      }
      setLastDecision(
        action === "like"
          ? `You liked ${currentProfile.name}.`
          : `You passed on ${currentProfile.name}.`,
      );
      setSwipedIds((ids) => [...ids, currentProfile.id]);
      if (deck.length - 1 <= LOAD_MORE_WHEN_LEFT) {
        loadMore();
      }
    } catch (caught) {
      setSwipeError(caught);
    } finally {
      decisionInFlight.current = false;
      setAnimation(null);
    }
  }

  let content;
  if (loading) {
    content = (
      <p className="status-message">Finding students at your school...</p>
    );
  } else if (error?.status === 404 || error?.status === 409) {
    content = (
      <section className="empty-state">
        <h2>
          {error.status === 404
            ? "Create your profile first"
            : "Finish your profile first"}
        </h2>
        <p>
          Discover shows students at your school, so we need to know where you
          go.
        </p>
        <Link className="primary-button" to="/profile">
          Set up profile
        </Link>
      </section>
    );
  } else if (error) {
    content = (
      <section className="empty-state">
        <FormErrors error={error} />
        <button className="secondary-button" type="button" onClick={reload}>
          Try again
        </button>
      </section>
    );
  } else if (currentProfile) {
    content = (
      <>
        <SwipeSurface
          disabled={animation !== null}
          onSwipe={handleDecision}
          name={currentProfile.name}
        >
          <ProfileCard profile={currentProfile} animation={animation} />
        </SwipeSurface>
        <CompatibilityPanel profile={currentProfile} />
        <FormErrors error={swipeError} />
        <div className="swipe-controls">
          <button
            className="swipe-button swipe-button--pass"
            type="button"
            aria-label={`Pass on ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("pass")}
          >
            <X size={22} strokeWidth={1.8} />
            <span>Pass</span>
          </button>
          <span className="swipe-hint">
            {animation
              ? "Saving your choice…"
              : "Your next chapter starts here"}
          </span>
          <button
            className="swipe-button swipe-button--like"
            type="button"
            aria-label={`Like ${currentProfile.name}`}
            disabled={animation !== null}
            onClick={() => handleDecision("like")}
          >
            <Heart size={22} strokeWidth={1.8} />
            <span>Like</span>
          </button>
        </div>
        <p className="swipe-help">
          Scroll to explore · Drag left to pass, right to like · Or focus the
          card and use ← / →
        </p>
      </>
    );
  } else if (hasMore) {
    content = (
      <section className="empty-state">
        <p>
          {loadingMore
            ? "Finding more students..."
            : "Looking for more students..."}
        </p>
        <button
          className="secondary-button"
          type="button"
          disabled={loadingMore}
          onClick={loadMore}
        >
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
        <h2>
          {activeFilterCount > 0
            ? "No one matches these filters."
            : "You're all caught up."}
        </h2>
        <p>
          {activeFilterCount > 0
            ? "Try loosening a filter or two."
            : `You've seen everyone at ${current?.school?.name ?? "this school"} for now. Check back as more students join.`}
        </p>
        <div className="empty-actions">
          {activeFilterCount > 0 ? (
            <button
              className="secondary-button"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          ) : (
            <button className="secondary-button" type="button" onClick={reload}>
              <RotateCcw size={17} />
              Check again
            </button>
          )}
          <Link className="button button--dark" to="/history">
            Revisit your swipes
          </Link>
          <InviteButton />
        </div>
        <Link className="text-link" to="/matches">
          Make the first hello with your matches →
        </Link>
      </section>
    );
  }

  return (
    <main className="page page--with-navigation discover-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Roomie Match</p>
          <h1>Find your kind of company.</h1>
          <p className="page-subtitle">
            A shared space starts with the little things you have in common.
          </p>
        </div>
        <div className="page-header__actions">
          <Link className="icon-button" to="/search" aria-label="Search people">
            <Search size={22} />
          </Link>
          <Link
            className="icon-button"
            to="/history"
            aria-label="Swipe history"
          >
            <History size={22} />
          </Link>
          <button
            className="icon-button filter-button"
            type="button"
            aria-label="Filters"
            aria-expanded={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={22} />
            {activeFilterCount > 0 && (
              <span className="filter-button__count">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </header>

      <div
        className={`discover-grid ${showFilters ? "" : "discover-grid--no-filters"}`}
      >
        {showFilters && (
          <section className="filter-panel" aria-label="Filters">
            <div className="filter-heading">
              <SlidersHorizontal size={16} />
              <h2>Your preferences</h2>
            </div>
            <div className="field filter-panel__wide">
              <span>School</span>
              {filterSchool === null ? (
                <div className="filter-panel__school">
                  <span>Your school</span>
                  <SchoolPicker value={null} onChange={pickSchool} />
                </div>
              ) : (
                <SchoolPicker value={filterSchool} onChange={pickSchool} />
              )}
            </div>
            <label className="field">
              <span>Major</span>
              <input
                placeholder="Any"
                value={draft.major}
                onChange={(e) => updateFilter("major", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Class of</span>
              <select
                value={draft.classYear}
                onChange={(e) => updateFilter("classYear", e.target.value)}
              >
                <option value="">Any</option>
                {CLASS_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Min age</span>
              <input
                type="number"
                min={17}
                max={100}
                placeholder="Any"
                value={draft.minAge}
                onChange={(e) => updateFilter("minAge", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Max age</span>
              <input
                type="number"
                min={17}
                max={100}
                placeholder="Any"
                value={draft.maxAge}
                onChange={(e) => updateFilter("maxAge", e.target.value)}
              />
            </label>
            <label className="field filter-panel__wide">
              <span>Moving in by</span>
              <input
                type="date"
                value={draft.moveInBy}
                onChange={(e) => updateFilter("moveInBy", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Sleep schedule</span>
              <select
                value={draft.sleepSchedule}
                onChange={(e) => updateFilter("sleepSchedule", e.target.value)}
              >
                <option value="">Any</option>
                {Object.entries(SLEEP_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cleanliness</span>
              <select
                value={draft.cleanliness}
                onChange={(e) => updateFilter("cleanliness", e.target.value)}
              >
                <option value="">Any</option>
                {Object.entries(CLEANLINESS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Smoking</span>
              <select
                value={draft.smoking}
                onChange={(e) => updateFilter("smoking", e.target.value)}
              >
                <option value="">Any</option>
                <option value="false">Non-smokers</option>
                <option value="true">Smokers</option>
              </select>
            </label>
            <label className="field">
              <span>Pets</span>
              <select
                value={draft.pets}
                onChange={(e) => updateFilter("pets", e.target.value)}
              >
                <option value="">Any</option>
                <option value="false">No pets</option>
                <option value="true">Has pets</option>
              </select>
            </label>
            <label className="field">
              <span>Max budget ($/mo)</span>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={draft.maxBudget}
                onChange={(e) => updateFilter("maxBudget", e.target.value)}
              />
            </label>
            <label className="field">
              <span>Tag</span>
              <select
                value={draft.tag}
                onChange={(e) => updateFilter("tag", e.target.value)}
              >
                <option value="">Any</option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            {activeFilterCount > 0 && (
              <button
                className="small-button"
                type="button"
                onClick={clearFilters}
              >
                Clear all
              </button>
            )}
          </section>
        )}

        <div className="discover-main">
          {current?.school && (
            <p className="discover-school">
              Showing students at {current.school.name}
            </p>
          )}

          {newMatch && (
            <section className="match-banner" role="status">
              {newMatch.photoUrl ? (
                <img
                  className="match-banner__photo"
                  src={newMatch.photoUrl}
                  alt=""
                />
              ) : (
                <PartyPopper size={26} />
              )}
              <div>
                <strong>It's a match with {newMatch.name}!</strong>
                {newMatch.instagram && (
                  <p>
                    Say hi: <InstagramLink handle={newMatch.instagram} />
                  </p>
                )}
                <p>
                  <Link to={`/matches/${encodeURIComponent(newMatch.id)}`}>
                    View {newMatch.name}'s profile
                  </Link>
                </p>
              </div>
              <button
                className="match-banner__close"
                type="button"
                aria-label="Dismiss"
                onClick={() => setNewMatch(null)}
              >
                <X size={18} />
              </button>
            </section>
          )}

          {lastDecision && !newMatch && (
            <p className="decision-message" role="status">
              {lastDecision}
            </p>
          )}

          {content}
          {!currentProfile && !loading && !error && (
            <div className="empty-illustration">
              <div>
                <p className="eyebrow">MAKE ROOM FOR A NEW CHAPTER</p>
                <h3>Good company is worth finding.</h3>
                <p>
                  Your next roomie may be just one introduction away. Invite
                  someone from your campus to join.
                </p>
              </div>
              <img src="/images/campus-editorial.png" alt="" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default DiscoverPage;
